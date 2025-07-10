import { supabase } from '@/integrations/supabase/client';

// Documentation Generator Service - Phase 5
export interface DocumentationTemplate {
  id: string;
  name: string;
  type: 'integration' | 'api' | 'workflow' | 'troubleshooting' | 'user_guide';
  template_content: string;
  variables: string[]; // Template variables to be replaced
  format: 'markdown' | 'html' | 'pdf' | 'json';
  tenant_id: string;
}

export interface GeneratedDocumentation {
  id: string;
  title: string;
  content: string;
  format: 'markdown' | 'html' | 'pdf' | 'json';
  type: 'integration' | 'api' | 'workflow' | 'troubleshooting' | 'user_guide';
  integration_id?: string;
  workflow_id?: string;
  version: string;
  generated_at: string;
  tenant_id: string;
  metadata: {
    word_count: number;
    sections: string[];
    examples_count: number;
    images_count: number;
  };
}

export interface DocumentationSection {
  title: string;
  content: string;
  order: number;
  subsections?: DocumentationSection[];
}

export interface IntegrationDocData {
  id: string;
  name: string;
  description: string;
  authentication: any;
  endpoints: any[];
  parameters: any[];
  examples: any[];
  error_codes: any[];
  rate_limits: any;
  testing_info: any;
}

class DocumentationGeneratorService {
  private static instance: DocumentationGeneratorService;

  static getInstance(): DocumentationGeneratorService {
    if (!DocumentationGeneratorService.instance) {
      DocumentationGeneratorService.instance = new DocumentationGeneratorService();
    }
    return DocumentationGeneratorService.instance;
  }

  // Generate comprehensive integration documentation
  async generateIntegrationDocumentation(integrationId: string, tenantId: string): Promise<GeneratedDocumentation> {
    // Gather integration data
    const integrationData = await this.gatherIntegrationData(integrationId, tenantId);
    
    // Create documentation sections
    const sections: DocumentationSection[] = [
      {
        title: 'Overview',
        content: this.generateOverviewSection(integrationData),
        order: 1
      },
      {
        title: 'Authentication',
        content: this.generateAuthenticationSection(integrationData),
        order: 2
      },
      {
        title: 'Configuration',
        content: this.generateConfigurationSection(integrationData),
        order: 3
      },
      {
        title: 'Usage Examples',
        content: this.generateExamplesSection(integrationData),
        order: 4
      },
      {
        title: 'API Reference',
        content: this.generateAPIReferenceSection(integrationData),
        order: 5
      },
      {
        title: 'Error Handling',
        content: this.generateErrorHandlingSection(integrationData),
        order: 6
      },
      {
        title: 'Testing',
        content: this.generateTestingSection(integrationData),
        order: 7
      },
      {
        title: 'Troubleshooting',
        content: this.generateTroubleshootingSection(integrationData),
        order: 8
      }
    ];

    // Compile final documentation
    const content = this.compileSections(sections);
    
    const documentation: GeneratedDocumentation = {
      id: `doc_${integrationId}_${Date.now()}`,
      title: `${integrationData.name} Integration Guide`,
      content,
      format: 'markdown',
      type: 'integration',
      integration_id: integrationId,
      version: '1.0.0',
      generated_at: new Date().toISOString(),
      tenant_id: tenantId,
      metadata: {
        word_count: content.split(' ').length,
        sections: sections.map(s => s.title),
        examples_count: integrationData.examples.length,
        images_count: 0
      }
    };

    // Store documentation
    await supabase
      .from('generated_documentation')
      .insert({
        title: documentation.title,
        content: documentation.content,
        format: documentation.format,
        type: documentation.type,
        integration_id: documentation.integration_id,
        version: documentation.version,
        metadata: documentation.metadata,
        tenant_id: documentation.tenant_id
      });

    return documentation;
  }

  // Generate API documentation for all integrations
  async generateAPIDocumentation(tenantId: string): Promise<GeneratedDocumentation> {
    const { data: integrations, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('tenant_id', tenantId);

    if (error) throw error;

    const apiSections: DocumentationSection[] = [
      {
        title: 'HALO Integration API Reference',
        content: this.generateAPIIntroduction(),
        order: 1
      },
      {
        title: 'Authentication',
        content: this.generateAPIAuthSection(),
        order: 2
      },
      {
        title: 'Base URL and Headers',
        content: this.generateAPIBasicsSection(),
        order: 3
      }
    ];

    // Add section for each integration
    integrations.forEach((integration, index) => {
      apiSections.push({
        title: `${integration.name} API`,
        content: this.generateIntegrationAPISection(integration),
        order: 4 + index
      });
    });

    const content = this.compileSections(apiSections);

    const documentation: GeneratedDocumentation = {
      id: `api_doc_${Date.now()}`,
      title: 'HALO Integration API Reference',
      content,
      format: 'markdown',
      type: 'api',
      version: '1.0.0',
      generated_at: new Date().toISOString(),
      tenant_id: tenantId,
      metadata: {
        word_count: content.split(' ').length,
        sections: apiSections.map(s => s.title),
        examples_count: integrations.length * 3, // Assume 3 examples per integration
        images_count: 0
      }
    };

    await supabase
      .from('generated_documentation')
      .insert({
        title: documentation.title,
        content: documentation.content,
        format: documentation.format,
        type: documentation.type,
        version: documentation.version,
        metadata: documentation.metadata,
        tenant_id: documentation.tenant_id
      });

    return documentation;
  }

  // Generate workflow documentation
  async generateWorkflowDocumentation(workflowId: string, tenantId: string): Promise<GeneratedDocumentation> {
    const { data: workflow, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .eq('tenant_id', tenantId)
      .single();

    if (error) throw error;

    const sections: DocumentationSection[] = [
      {
        title: 'Workflow Overview',
        content: this.generateWorkflowOverview(workflow),
        order: 1
      },
      {
        title: 'Step-by-Step Guide',
        content: this.generateWorkflowSteps(workflow),
        order: 2
      },
      {
        title: 'Configuration',
        content: this.generateWorkflowConfiguration(workflow),
        order: 3
      },
      {
        title: 'Testing & Validation',
        content: this.generateWorkflowTesting(workflow),
        order: 4
      },
      {
        title: 'Monitoring & Troubleshooting',
        content: this.generateWorkflowMonitoring(workflow),
        order: 5
      }
    ];

    const content = this.compileSections(sections);

    const documentation: GeneratedDocumentation = {
      id: `workflow_doc_${workflowId}_${Date.now()}`,
      title: `${workflow.name} Workflow Guide`,
      content,
      format: 'markdown',
      type: 'workflow',
      workflow_id: workflowId,
      version: '1.0.0',
      generated_at: new Date().toISOString(),
      tenant_id: tenantId,
      metadata: {
        word_count: content.split(' ').length,
        sections: sections.map(s => s.title),
        examples_count: workflow.steps?.length || 0,
        images_count: 0
      }
    };

    await supabase
      .from('generated_documentation')
      .insert({
        title: documentation.title,
        content: documentation.content,
        format: documentation.format,
        type: documentation.type,
        workflow_id: documentation.workflow_id,
        version: documentation.version,
        metadata: documentation.metadata,
        tenant_id: documentation.tenant_id
      });

    return documentation;
  }

  // Generate user guide
  async generateUserGuide(tenantId: string): Promise<GeneratedDocumentation> {
    const sections: DocumentationSection[] = [
      {
        title: 'Getting Started with HALO',
        content: this.generateGettingStartedSection(),
        order: 1
      },
      {
        title: 'Managing Integrations',
        content: this.generateIntegrationManagementSection(),
        order: 2
      },
      {
        title: 'Building Workflows',
        content: this.generateWorkflowBuildingSection(),
        order: 3
      },
      {
        title: 'Monitoring & Performance',
        content: this.generateMonitoringSection(),
        order: 4
      },
      {
        title: 'Best Practices',
        content: this.generateBestPracticesSection(),
        order: 5
      },
      {
        title: 'FAQs',
        content: this.generateFAQSection(),
        order: 6
      }
    ];

    const content = this.compileSections(sections);

    const documentation: GeneratedDocumentation = {
      id: `user_guide_${Date.now()}`,
      title: 'HALO User Guide',
      content,
      format: 'markdown',
      type: 'user_guide',
      version: '1.0.0',
      generated_at: new Date().toISOString(),
      tenant_id: tenantId,
      metadata: {
        word_count: content.split(' ').length,
        sections: sections.map(s => s.title),
        examples_count: 10,
        images_count: 0
      }
    };

    await supabase
      .from('generated_documentation')
      .insert({
        title: documentation.title,
        content: documentation.content,
        format: documentation.format,
        type: documentation.type,
        version: documentation.version,
        metadata: documentation.metadata,
        tenant_id: documentation.tenant_id
      });

    return documentation;
  }

  // Helper methods for gathering data
  private async gatherIntegrationData(integrationId: string, tenantId: string): Promise<IntegrationDocData> {
    // Mock implementation - would gather real integration data
    return {
      id: integrationId,
      name: 'Sample Integration',
      description: 'A sample integration for demonstration',
      authentication: { type: 'API_KEY', fields: ['api_key'] },
      endpoints: [
        { method: 'GET', path: '/api/data', description: 'Fetch data' },
        { method: 'POST', path: '/api/data', description: 'Create data' }
      ],
      parameters: [
        { name: 'limit', type: 'number', required: false, description: 'Maximum number of results' }
      ],
      examples: [
        { title: 'Basic Usage', code: 'GET /api/data?limit=10', response: '{"data": [...]}' }
      ],
      error_codes: [
        { code: 400, message: 'Bad Request', description: 'Invalid parameters' },
        { code: 401, message: 'Unauthorized', description: 'Invalid API key' }
      ],
      rate_limits: { requests_per_minute: 100 },
      testing_info: { test_endpoint: '/api/test' }
    };
  }

  // Content generation methods
  private generateOverviewSection(data: IntegrationDocData): string {
    return `# ${data.name} Integration

${data.description}

## Key Features
- Real-time data synchronization
- Comprehensive error handling
- Rate limiting and retry logic
- Extensive testing capabilities

## Prerequisites
- Valid ${data.name} account
- API credentials
- HALO platform access
`;
  }

  private generateAuthenticationSection(data: IntegrationDocData): string {
    return `## Authentication

This integration uses ${data.authentication.type} authentication.

### Required Credentials
${data.authentication.fields.map((field: string) => `- **${field}**: Your ${data.name} ${field.replace('_', ' ')}`).join('\n')}

### Setup Instructions
1. Log in to your ${data.name} account
2. Navigate to API settings
3. Generate new API credentials
4. Copy the credentials to HALO configuration

\`\`\`json
{
  "auth_type": "${data.authentication.type}",
  "credentials": {
    ${data.authentication.fields.map((field: string) => `"${field}": "your_${field}_here"`).join(',\n    ')}
  }
}
\`\`\`
`;
  }

  private generateConfigurationSection(data: IntegrationDocData): string {
    return `## Configuration

### Basic Configuration
Configure the integration with the following parameters:

${data.parameters.map(param => `- **${param.name}** (${param.type})${param.required ? ' *required*' : ''}: ${param.description}`).join('\n')}

### Advanced Settings
- **Timeout**: Request timeout in milliseconds (default: 30000)
- **Retry Count**: Number of retry attempts (default: 3)
- **Rate Limit**: Requests per minute (max: ${data.rate_limits.requests_per_minute})
`;
  }

  private generateExamplesSection(data: IntegrationDocData): string {
    return `## Usage Examples

${data.examples.map(example => `### ${example.title}

\`\`\`http
${example.code}
\`\`\`

**Response:**
\`\`\`json
${example.response}
\`\`\`
`).join('\n')}
`;
  }

  private generateAPIReferenceSection(data: IntegrationDocData): string {
    return `## API Reference

### Available Endpoints

${data.endpoints.map(endpoint => `#### ${endpoint.method} ${endpoint.path}

${endpoint.description}

**Parameters:**
${data.parameters.filter(p => endpoint.path.includes(p.name)).map(p => `- ${p.name} (${p.type})${p.required ? ' *required*' : ''}: ${p.description}`).join('\n') || 'None'}
`).join('\n')}
`;
  }

  private generateErrorHandlingSection(data: IntegrationDocData): string {
    return `## Error Handling

### Common Error Codes

${data.error_codes.map(error => `#### ${error.code} - ${error.message}
${error.description}
`).join('\n')}

### Retry Logic
The integration automatically retries failed requests with exponential backoff:
- Initial delay: 1 second
- Maximum retries: 3
- Backoff multiplier: 2
`;
  }

  private generateTestingSection(data: IntegrationDocData): string {
    return `## Testing

### Test Connection
Use the test endpoint to verify your configuration:

\`\`\`http
GET ${data.testing_info.test_endpoint}
\`\`\`

### Integration Tests
The following test cases are automatically generated:
- Authentication validation
- Basic functionality test  
- Error handling test
- Rate limiting test

### Manual Testing
1. Configure the integration with test credentials
2. Run the built-in test suite
3. Verify expected responses
4. Test error scenarios
`;
  }

  private generateTroubleshootingSection(data: IntegrationDocData): string {
    return `## Troubleshooting

### Common Issues

#### Authentication Errors
- Verify API credentials are correct
- Check credential expiration dates
- Ensure proper permission scopes

#### Rate Limiting
- Monitor request frequency
- Implement proper request spacing
- Use caching where appropriate

#### Connection Issues
- Check network connectivity
- Verify endpoint URLs
- Test with integration test endpoint

### Getting Help
- Check integration logs in HALO dashboard
- Review error messages carefully
- Contact support with specific error details
`;
  }

  // API documentation sections
  private generateAPIIntroduction(): string {
    return `# HALO Integration API Reference

Welcome to the HALO Integration API documentation. This API allows you to manage and execute integrations programmatically.

## Base URL
\`https://your-halo-instance.com/api/v1\`

## Response Format
All API responses are in JSON format with the following structure:

\`\`\`json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "timestamp": "2024-01-01T00:00:00Z"
}
\`\`\`
`;
  }

  private generateAPIAuthSection(): string {
    return `## Authentication

The HALO API uses Bearer token authentication. Include your API token in the Authorization header:

\`\`\`http
Authorization: Bearer your_api_token_here
\`\`\`

### Obtaining an API Token
1. Log in to your HALO dashboard
2. Navigate to Settings > API Tokens
3. Generate a new token
4. Copy and securely store the token
`;
  }

  private generateAPIBasicsSection(): string {
    return `## Base URL and Headers

### Base URL
\`https://your-halo-instance.com/api/v1\`

### Required Headers
\`\`\`http
Content-Type: application/json
Authorization: Bearer your_api_token_here
X-Tenant-ID: your_tenant_id
\`\`\`

### Rate Limits
- 1000 requests per hour per API token
- 100 requests per minute per endpoint
`;
  }

  private generateIntegrationAPISection(integration: any): string {
    return `### ${integration.name}

Execute ${integration.name} integration operations.

#### Execute Integration
\`\`\`http
POST /integrations/${integration.id}/execute
\`\`\`

**Request Body:**
\`\`\`json
{
  "input": {
    "param1": "value1",
    "param2": "value2"
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "execution_id": "exec_123",
    "result": {}
  }
}
\`\`\`
`;
  }

  // Workflow documentation sections
  private generateWorkflowOverview(workflow: any): string {
    return `# ${workflow.name}

${workflow.description || 'Automated workflow for data processing and integration.'}

## Workflow Details
- **Status**: ${workflow.status}
- **Last Executed**: ${workflow.last_executed || 'Never'}
- **Execution Count**: ${workflow.execution_count || 0}
- **Steps**: ${workflow.steps?.length || 0}

## Purpose
This workflow automates the process of [describe workflow purpose based on steps].
`;
  }

  private generateWorkflowSteps(workflow: any): string {
    const steps = workflow.steps || [];
    return `## Workflow Steps

${steps.map((step: any, index: number) => `### Step ${index + 1}: ${step.name || 'Unnamed Step'}

**Type**: ${step.type || 'Unknown'}
**Description**: ${step.description || 'No description available'}

**Configuration:**
\`\`\`json
${JSON.stringify(step.config || {}, null, 2)}
\`\`\`
`).join('\n')}
`;
  }

  private generateWorkflowConfiguration(workflow: any): string {
    return `## Configuration

### Basic Settings
- **Name**: ${workflow.name}
- **Description**: ${workflow.description || 'No description'}
- **Status**: ${workflow.status}

### Execution Settings
- **Trigger**: ${workflow.trigger || 'Manual'}
- **Schedule**: ${workflow.schedule || 'None'}
- **Timeout**: ${workflow.timeout || '30 minutes'}

### Environment Variables
\`\`\`json
${JSON.stringify(workflow.environment || {}, null, 2)}
\`\`\`
`;
  }

  private generateWorkflowTesting(workflow: any): string {
    return `## Testing & Validation

### Test Execution
To test this workflow:

1. Navigate to Workflows in HALO dashboard
2. Select "${workflow.name}"
3. Click "Test Run"
4. Provide test input data
5. Monitor execution progress

### Validation Checklist
- [ ] All required inputs are provided
- [ ] Each step executes successfully
- [ ] Output matches expected format
- [ ] Error handling works correctly
- [ ] Performance meets requirements

### Test Data
\`\`\`json
{
  "test_input": {
    "sample_data": "value"
  }
}
\`\`\`
`;
  }

  private generateWorkflowMonitoring(workflow: any): string {
    return `## Monitoring & Troubleshooting

### Monitoring
- View execution history in the HALO dashboard
- Monitor performance metrics
- Set up alerts for failures
- Track execution success rates

### Common Issues
1. **Step Timeout**: Increase timeout values for slow integrations
2. **Authentication Errors**: Verify integration credentials
3. **Data Format Issues**: Validate input/output data formats
4. **Rate Limiting**: Implement delays between API calls

### Logs Location
Execution logs are available in:
- HALO Dashboard > Workflows > ${workflow.name} > Logs
- API endpoint: \`GET /workflows/${workflow.id}/executions\`
`;
  }

  // User guide sections
  private generateGettingStartedSection(): string {
    return `# Getting Started with HALO

Welcome to HALO - your comprehensive automation platform.

## What is HALO?
HALO (Hyper-Automation & Logical Orchestration) is an enterprise-grade platform designed for MASP (Managed Automation Service Provider) certified professionals.

## Quick Start
1. **Account Setup**: Create your HALO account
2. **Integration**: Connect your first integration
3. **Workflow**: Build your first workflow
4. **Execute**: Run and monitor your automation
5. **Optimize**: Use performance insights to improve

## Key Concepts
- **Integrations**: Connections to external services and APIs
- **Workflows**: Automated sequences of integration steps
- **Tenants**: Multi-tenant isolation for enterprise deployments
- **MASP Certification**: Professional designation for automation specialists
`;
  }

  private generateIntegrationManagementSection(): string {
    return `## Managing Integrations

### Adding New Integrations
1. Navigate to the Marketplace
2. Browse available integrations
3. Click "Install" on desired integration
4. Configure authentication credentials
5. Test the connection

### Configuration Best Practices
- Use environment-specific credentials
- Implement proper error handling
- Set appropriate timeout values
- Configure rate limiting
- Enable monitoring and alerts

### Security Considerations
- Store credentials securely
- Use minimum required permissions
- Regularly rotate API keys
- Monitor for unauthorized access
- Implement proper audit trails
`;
  }

  private generateWorkflowBuildingSection(): string {
    return `## Building Workflows

### Workflow Design
1. **Plan**: Define your automation goals
2. **Map**: Identify required integrations
3. **Design**: Create workflow steps
4. **Test**: Validate functionality
5. **Deploy**: Activate the workflow

### Visual Workflow Builder
- Drag and drop integrations
- Connect steps with logical flow
- Configure step parameters
- Add conditional logic
- Implement error handling

### Best Practices
- Keep workflows simple and focused
- Add descriptive names and comments
- Implement proper error handling
- Test thoroughly before deployment
- Monitor performance regularly
`;
  }

  private generateMonitoringSection(): string {
    return `## Monitoring & Performance

### Dashboard Overview
The HALO dashboard provides:
- Real-time execution status
- Performance metrics
- Error tracking
- Resource utilization
- Success/failure rates

### Performance Optimization
- Monitor response times
- Identify bottlenecks
- Implement caching strategies
- Optimize database queries
- Use performance benchmarks

### Alerting
Set up alerts for:
- Workflow failures
- Performance degradation
- Resource limits
- Security events
- Integration downtime
`;
  }

  private generateBestPracticesSection(): string {
    return `## Best Practices

### Integration Development
- Follow security best practices
- Implement comprehensive error handling
- Use proper authentication methods
- Add detailed logging
- Create thorough documentation

### Workflow Design
- Keep workflows modular
- Use descriptive naming
- Implement proper testing
- Plan for scalability
- Consider maintenance needs

### Performance
- Monitor resource usage
- Implement caching where appropriate
- Use batch processing for large datasets
- Optimize database queries
- Plan for peak loads

### Security
- Use secure credential storage
- Implement proper access controls
- Regular security audits
- Monitor for anomalies
- Keep systems updated
`;
  }

  private generateFAQSection(): string {
    return `## Frequently Asked Questions

### General
**Q: What is MASP certification?**
A: MASP (Managed Automation Service Provider) is a professional designation for certified automation specialists.

**Q: Can HALO be deployed on-premises?**
A: Yes, HALO supports both SaaS and self-hosted deployment options.

### Integrations
**Q: How many integrations can I have?**
A: The number depends on your subscription plan. Enterprise plans support unlimited integrations.

**Q: Can I create custom integrations?**
A: Yes, HALO provides tools for developing custom integrations with full API support.

### Workflows
**Q: What's the maximum workflow execution time?**
A: Default timeout is 30 minutes, configurable up to 24 hours for enterprise plans.

**Q: Can workflows be scheduled?**
A: Yes, workflows support cron-based scheduling and event-driven triggers.

### Support
**Q: How do I get help?**
A: Contact support through the HALO dashboard or visit maspcertified.com for training resources.
`;
  }

  // Utility methods
  private compileSections(sections: DocumentationSection[]): string {
    return sections
      .sort((a, b) => a.order - b.order)
      .map(section => section.content)
      .join('\n\n---\n\n');
  }

  // Export documentation in different formats
  async exportDocumentation(docId: string, format: 'markdown' | 'html' | 'pdf'): Promise<string> {
    const { data: doc, error } = await supabase
      .from('generated_documentation')
      .select('*')
      .eq('id', docId)
      .single();

    if (error) throw error;

    switch (format) {
      case 'html':
        return this.convertMarkdownToHTML(doc.content);
      case 'pdf':
        return this.convertMarkdownToPDF(doc.content);
      default:
        return doc.content;
    }
  }

  private convertMarkdownToHTML(markdown: string): string {
    // Simple markdown to HTML conversion - in production would use a proper library
    return markdown
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*)\*/g, '<em>$1</em>')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  private convertMarkdownToPDF(markdown: string): string {
    // PDF conversion would be implemented using a library like puppeteer
    return `PDF export not implemented in this demo: ${markdown.substring(0, 100)}...`;
  }
}

export const documentationGeneratorService = DocumentationGeneratorService.getInstance();