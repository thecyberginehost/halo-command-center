// Workflow Code Templates

export const workflowTemplates = {
  'simple-email': {
    name: 'Simple Email Automation',
    description: 'Send an email when triggered',
    code: `// Simple Email Automation
async function executeWorkflow({ input, context }) {
  // Send welcome email
  const result = await sendEmail({
    to: input.email,
    subject: 'Welcome!',
    body: \`Hello \${input.name || 'there'}, welcome to our platform!\`
  });
  
  if (!result.success) {
    throw new Error('Failed to send email: ' + result.error);
  }
  
  return {
    success: true,
    message: 'Welcome email sent successfully',
    data: { messageId: result.messageId }
  };
}`
  },

  'multi-step': {
    name: 'Multi-Step Workflow',
    description: 'Process data through multiple steps',
    code: `// Multi-Step Workflow
const workflow = {
  // Step 1: Validate input data
  validateData: async ({ input }) => {
    if (!input.email || !validateEmail(input.email)) {
      throw new Error('Valid email is required');
    }
    
    if (!input.name || input.name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
    
    return {
      validatedData: {
        email: input.email.toLowerCase().trim(),
        name: input.name.trim(),
        domain: extractDomain(input.email)
      }
    };
  },

  // Step 2: Add to CRM
  addToCRM: async ({ input, previous }) => {
    const { validatedData } = previous.validateData;
    
    const result = await addToCRM({
      email: validatedData.email,
      name: validatedData.name,
      customFields: {
        signupSource: input.source || 'website',
        domain: validatedData.domain
      }
    });
    
    if (!result.success) {
      throw new Error('Failed to add contact to CRM: ' + result.error);
    }
    
    return { contactId: result.contactId };
  },

  // Step 3: Send notification
  sendNotification: async ({ input, previous }) => {
    const { validatedData } = previous.validateData;
    const { contactId } = previous.addToCRM;
    
    // Send email to user
    await sendEmail({
      to: validatedData.email,
      subject: 'Welcome to Our Platform!',
      template: 'welcome',
      data: {
        name: validatedData.name,
        contactId: contactId
      }
    });
    
    // Notify team via Slack
    await sendSlackMessage({
      channel: '#sales',
      text: \`New signup: \${validatedData.name} (\${validatedData.email}) from \${validatedData.domain}\`
    });
    
    return { 
      notificationsSent: true,
      totalSteps: 3
    };
  }
};

// Execute the workflow
async function executeWorkflow({ input, context }) {
  const results = {};
  
  try {
    // Execute each step in sequence
    results.validateData = await workflow.validateData({ input });
    results.addToCRM = await workflow.addToCRM({ input, previous: results });
    results.sendNotification = await workflow.sendNotification({ input, previous: results });
    
    return {
      success: true,
      message: 'Multi-step workflow completed successfully',
      data: results
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      data: { completedSteps: Object.keys(results) }
    };
  }
}`
  },

  'conditional-logic': {
    name: 'Conditional Logic',
    description: 'Different actions based on conditions',
    code: `// Conditional Logic Workflow
async function executeWorkflow({ input, context }) {
  const { email, planType, isExistingCustomer } = input;
  
  // Determine the appropriate action based on conditions
  const action = match(planType, {
    'free': () => 'send_welcome_email',
    'pro': () => 'send_pro_welcome_and_setup',
    'enterprise': () => 'assign_account_manager'
  }, () => 'send_basic_welcome');
  
  let result;
  
  switch (action) {
    case 'send_welcome_email':
      result = await sendEmail({
        to: email,
        subject: 'Welcome to our Free Plan!',
        template: 'free-welcome'
      });
      break;
      
    case 'send_pro_welcome_and_setup':
      // Send pro welcome email
      await sendEmail({
        to: email,
        subject: 'Welcome to Pro - Let\\'s get you set up!',
        template: 'pro-welcome'
      });
      
      // Add to pro users CRM list
      result = await addToCRM({
        email,
        customFields: { plan: 'pro', needsOnboarding: true }
      });
      break;
      
    case 'assign_account_manager':
      // Notify account management team
      await sendSlackMessage({
        channel: '#enterprise-sales',
        text: \`New enterprise customer needs account manager: \${email}\`
      });
      
      // Send personalized welcome
      result = await sendEmail({
        to: email,
        subject: 'Welcome to Enterprise - Your Account Manager Will Contact You',
        template: 'enterprise-welcome'
      });
      break;
      
    default:
      result = await sendEmail({
        to: email,
        subject: 'Welcome!',
        body: 'Thank you for signing up!'
      });
  }
  
  // Additional logic for existing customers
  if (isExistingCustomer) {
    await sendSlackMessage({
      channel: '#customer-success',
      text: \`Existing customer \${email} upgraded to \${planType}\`
    });
  }
  
  return {
    success: true,
    message: \`Processed \${planType} signup for \${isExistingCustomer ? 'existing' : 'new'} customer\`,
    data: { action, result }
  };
}`
  },

  'api-integration': {
    name: 'API Integration',
    description: 'Integrate with external APIs',
    code: `// API Integration Workflow
async function executeWorkflow({ input, context }) {
  const { userId, action, data } = input;
  
  try {
    // Step 1: Get user data from internal API
    const userResponse = await makeHttpRequest({
      url: \`https://api.yourapp.com/users/\${userId}\`,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer YOUR_API_TOKEN',
        'Content-Type': 'application/json'
      }
    });
    
    if (!userResponse.success) {
      throw new Error('Failed to fetch user data');
    }
    
    const user = userResponse.data;
    
    // Step 2: Process based on action type
    let externalResult;
    
    if (action === 'sync_to_crm') {
      externalResult = await addToCRM({
        email: user.email,
        name: user.name,
        company: user.company,
        customFields: {
          lastActive: user.lastActiveAt,
          signupDate: user.createdAt,
          totalOrders: user.orderCount
        }
      });
    } else if (action === 'send_survey') {
      // Send data to survey platform
      externalResult = await makeHttpRequest({
        url: 'https://api.surveyplatform.com/send',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer SURVEY_API_TOKEN',
          'Content-Type': 'application/json'
        },
        body: {
          email: user.email,
          surveyId: data.surveyId,
          customData: {
            userName: user.name,
            userPlan: user.planType
          }
        }
      });
    }
    
    // Step 3: Log the activity
    await makeHttpRequest({
      url: 'https://api.yourapp.com/activity-log',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_API_TOKEN',
        'Content-Type': 'application/json'
      },
      body: {
        userId,
        action: \`workflow_\${action}\`,
        status: 'completed',
        timestamp: new Date().toISOString()
      }
    });
    
    return {
      success: true,
      message: \`Successfully processed \${action} for user \${userId}\`,
      data: {
        user: { id: user.id, email: user.email },
        externalResult
      }
    };
    
  } catch (error) {
    // Log error
    await makeHttpRequest({
      url: 'https://api.yourapp.com/activity-log',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_API_TOKEN',
        'Content-Type': 'application/json'
      },
      body: {
        userId,
        action: \`workflow_\${action}\`,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    });
    
    throw error;
  }
}`
  },

  'data-processing': {
    name: 'Data Processing',
    description: 'Transform and process data',
    code: `// Data Processing Workflow
async function executeWorkflow({ input, context }) {
  const { csvData, outputFormat = 'json' } = input;
  
  try {
    // Step 1: Parse and validate data
    let records;
    if (typeof csvData === 'string') {
      // Simple CSV parsing (for production, use a proper CSV library)
      const lines = csvData.trim().split('\\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      records = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        const record = {};
        
        headers.forEach((header, i) => {
          record[header] = values[i] || '';
        });
        
        record._rowNumber = index + 2; // +2 because of header and 0-based index
        return record;
      });
    } else {
      records = Array.isArray(csvData) ? csvData : [csvData];
    }
    
    // Step 2: Clean and transform data
    const processedRecords = records
      .filter(record => {
        // Filter out empty records
        return Object.values(record).some(value => 
          value && typeof value === 'string' && value.trim().length > 0
        );
      })
      .map(record => {
        const processed = { ...record };
        
        // Clean email addresses
        if (processed.email) {
          processed.email = processed.email.toLowerCase().trim();
          processed.emailValid = validateEmail(processed.email);
          processed.domain = extractDomain(processed.email);
        }
        
        // Standardize names
        if (processed.name) {
          processed.name = processed.name
            .split(' ')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(' ');
        }
        
        // Add processing metadata
        processed._processedAt = new Date().toISOString();
        processed._source = 'workflow_processing';
        
        return processed;
      });
    
    // Step 3: Validate required fields
    const validRecords = [];
    const invalidRecords = [];
    
    processedRecords.forEach(record => {
      const errors = [];
      
      if (!record.email || !record.emailValid) {
        errors.push('Invalid email address');
      }
      
      if (!record.name || record.name.length < 2) {
        errors.push('Name is required and must be at least 2 characters');
      }
      
      if (errors.length === 0) {
        validRecords.push(record);
      } else {
        invalidRecords.push({ ...record, _errors: errors });
      }
    });
    
    // Step 4: Export processed data
    let output;
    switch (outputFormat) {
      case 'csv':
        const headers = validRecords.length > 0 ? Object.keys(validRecords[0]) : [];
        const csvOutput = [
          headers.join(','),
          ...validRecords.map(record => 
            headers.map(header => record[header] || '').join(',')
          )
        ].join('\\n');
        output = csvOutput;
        break;
        
      case 'json':
      default:
        output = {
          validRecords,
          invalidRecords,
          summary: {
            totalInput: records.length,
            validOutput: validRecords.length,
            invalidOutput: invalidRecords.length,
            processingRate: validRecords.length / records.length
          }
        };
    }
    
    return {
      success: true,
      message: \`Processed \${records.length} records, \${validRecords.length} valid, \${invalidRecords.length} invalid\`,
      data: output
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'Data processing failed: ' + error.message,
      data: { error: error.message }
    };
  }
}`
  }
};

export const getTemplate = (templateId: string) => {
  return workflowTemplates[templateId] || null;
};

export const getTemplateList = () => {
  return Object.keys(workflowTemplates).map(id => ({
    id,
    name: workflowTemplates[id].name,
    description: workflowTemplates[id].description
  }));
};