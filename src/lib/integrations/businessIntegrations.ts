import { IntegrationNode } from '@/types/integrations';
import { FileText, DollarSign, Calendar, Users, BarChart, Building, Briefcase, Calculator } from 'lucide-react';

// Accounting & Finance
export const quickbooksCreateInvoice: IntegrationNode = {
  id: 'quickbooks_create_invoice',
  name: 'Create Invoice',
  description: 'Create a new invoice in QuickBooks',
  category: 'productivity',
  icon: FileText,
  color: '#0077C5',
  requiresAuth: true,
  authType: 'oauth',
  type: 'action',
  fields: [
    { name: 'customer_id', label: 'Customer ID', type: 'text', required: true },
    { name: 'line_items', label: 'Line Items (JSON)', type: 'textarea', required: true },
    { name: 'due_date', label: 'Due Date', type: 'text', required: false },
    { name: 'memo', label: 'Memo', type: 'textarea', required: false }
  ],
  endpoints: [],
  configSchema: {
    client_id: { type: 'text', label: 'Client ID', required: true },
    client_secret: { type: 'password', label: 'Client Secret', required: true },
    company_id: { type: 'text', label: 'Company ID', required: true }
  }
};

export const quickbooksCreateCustomer: IntegrationNode = {
  id: 'quickbooks_create_customer',
  name: 'Create Customer',
  description: 'Create a new customer in QuickBooks',
  category: 'crm',
  icon: Users,
  color: '#0077C5',
  requiresAuth: true,
  authType: 'oauth',
  type: 'action',
  fields: [
    { name: 'name', label: 'Customer Name', type: 'text', required: true },
    { name: 'company_name', label: 'Company Name', type: 'text', required: false },
    { name: 'email', label: 'Email', type: 'text', required: false },
    { name: 'phone', label: 'Phone', type: 'text', required: false }
  ],
  endpoints: [],
  configSchema: {
    client_id: { type: 'text', label: 'Client ID', required: true },
    client_secret: { type: 'password', label: 'Client Secret', required: true }
  }
};

export const xeroCreateInvoice: IntegrationNode = {
  id: 'xero_create_invoice',
  name: 'Create Invoice',
  description: 'Create a new invoice in Xero',
  category: 'productivity',
  icon: FileText,
  color: '#13B5EA',
  requiresAuth: true,
  authType: 'oauth',
  type: 'action',
  fields: [
    { name: 'contact_id', label: 'Contact ID', type: 'text', required: true },
    { name: 'invoice_number', label: 'Invoice Number', type: 'text', required: false },
    { name: 'line_items', label: 'Line Items (JSON)', type: 'textarea', required: true },
    { name: 'due_date', label: 'Due Date', type: 'text', required: false }
  ],
  endpoints: [],
  configSchema: {
    client_id: { type: 'text', label: 'Client ID', required: true },
    client_secret: { type: 'password', label: 'Client Secret', required: true }
  }
};

export const freshbooksCreateInvoice: IntegrationNode = {
  id: 'freshbooks_create_invoice',
  name: 'Create Invoice',
  description: 'Create a new invoice in FreshBooks',
  category: 'productivity',
  icon: FileText,
  color: '#0E8F00',
  requiresAuth: true,
  authType: 'oauth',
  type: 'action',
  fields: [
    { name: 'customer_id', label: 'Customer ID', type: 'text', required: true },
    { name: 'create_date', label: 'Invoice Date', type: 'text', required: true },
    { name: 'line_items', label: 'Line Items (JSON)', type: 'textarea', required: true }
  ],
  endpoints: [],
  configSchema: {
    client_id: { type: 'text', label: 'Client ID', required: true },
    client_secret: { type: 'password', label: 'Client Secret', required: true }
  }
};

// HR & Payroll
export const bamboohrCreateEmployee: IntegrationNode = {
  id: 'bamboohr_create_employee',
  name: 'Create Employee',
  description: 'Add a new employee to BambooHR',
  category: 'productivity',
  icon: Users,
  color: '#6BA444',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'first_name', label: 'First Name', type: 'text', required: true },
    { name: 'last_name', label: 'Last Name', type: 'text', required: true },
    { name: 'work_email', label: 'Work Email', type: 'text', required: true },
    { name: 'job_title', label: 'Job Title', type: 'text', required: false },
    { name: 'department', label: 'Department', type: 'text', required: false }
  ],
  endpoints: [],
  configSchema: {
    api_key: { type: 'password', label: 'API Key', required: true },
    subdomain: { type: 'text', label: 'Company Subdomain', required: true }
  }
};

export const workdayCreateEmployee: IntegrationNode = {
  id: 'workday_create_employee',
  name: 'Create Worker',
  description: 'Create a new worker in Workday',
  category: 'productivity',
  icon: Users,
  color: '#0066CC',
  requiresAuth: true,
  authType: 'basic',
  type: 'action',
  fields: [
    { name: 'employee_id', label: 'Employee ID', type: 'text', required: true },
    { name: 'first_name', label: 'First Name', type: 'text', required: true },
    { name: 'last_name', label: 'Last Name', type: 'text', required: true },
    { name: 'hire_date', label: 'Hire Date', type: 'text', required: true }
  ],
  endpoints: [],
  configSchema: {
    tenant_url: { type: 'text', label: 'Tenant URL', required: true },
    username: { type: 'text', label: 'Username', required: true },
    password: { type: 'password', label: 'Password', required: true }
  }
};

export const adpPayrollRun: IntegrationNode = {
  id: 'adp_payroll_run',
  name: 'Process Payroll',
  description: 'Process payroll in ADP',
  category: 'productivity',
  icon: DollarSign,
  color: '#C41E3A',
  requiresAuth: true,
  authType: 'oauth',
  type: 'action',
  fields: [
    { name: 'pay_period_start', label: 'Pay Period Start', type: 'text', required: true },
    { name: 'pay_period_end', label: 'Pay Period End', type: 'text', required: true },
    { name: 'pay_date', label: 'Pay Date', type: 'text', required: true }
  ],
  endpoints: [],
  configSchema: {
    client_id: { type: 'text', label: 'Client ID', required: true },
    client_secret: { type: 'password', label: 'Client Secret', required: true }
  }
};

// Legal & Compliance
export const docusignSendEnvelope: IntegrationNode = {
  id: 'docusign_send_envelope',
  name: 'Send Envelope',
  description: 'Send a document for electronic signature',
  category: 'productivity',
  icon: FileText,
  color: '#FFCD3E',
  requiresAuth: true,
  authType: 'oauth',
  type: 'action',
  fields: [
    { name: 'email_subject', label: 'Email Subject', type: 'text', required: true },
    { name: 'email_body', label: 'Email Body', type: 'textarea', required: true },
    { name: 'document_base64', label: 'Document (Base64)', type: 'textarea', required: true },
    { name: 'signer_email', label: 'Signer Email', type: 'text', required: true },
    { name: 'signer_name', label: 'Signer Name', type: 'text', required: true }
  ],
  endpoints: [],
  configSchema: {
    integration_key: { type: 'text', label: 'Integration Key', required: true },
    user_id: { type: 'text', label: 'User ID', required: true },
    private_key: { type: 'textarea', label: 'Private Key', required: true }
  }
};

export const hellosignSendSignatureRequest: IntegrationNode = {
  id: 'hellosign_send_signature_request',
  name: 'Send Signature Request',
  description: 'Send a document for signature via HelloSign',
  category: 'productivity',
  icon: FileText,
  color: '#F26522',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'subject', label: 'Subject', type: 'text', required: true },
    { name: 'message', label: 'Message', type: 'textarea', required: false },
    { name: 'signer_email', label: 'Signer Email', type: 'text', required: true }
  ],
  endpoints: [],
  configSchema: {
    api_key: { type: 'password', label: 'API Key', required: true }
  }
};

// Business Intelligence
export const tableauCreateWorkbook: IntegrationNode = {
  id: 'tableau_create_workbook',
  name: 'Create Workbook',
  description: 'Create a new workbook in Tableau',
  category: 'analytics',
  icon: BarChart,
  color: '#E97627',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'name', label: 'Workbook Name', type: 'text', required: true },
    { name: 'project_id', label: 'Project ID', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: false }
  ],
  endpoints: [],
  configSchema: {
    server_url: { type: 'text', label: 'Server URL', required: true },
    username: { type: 'text', label: 'Username', required: true },
    password: { type: 'password', label: 'Password', required: true }
  }
};

export const powerbiCreateDataset: IntegrationNode = {
  id: 'powerbi_create_dataset',
  name: 'Create Dataset',
  description: 'Create a new dataset in Power BI',
  category: 'analytics',
  icon: BarChart,
  color: '#F2C811',
  requiresAuth: true,
  authType: 'oauth',
  type: 'action',
  fields: [
    { name: 'name', label: 'Dataset Name', type: 'text', required: true },
    { name: 'tables', label: 'Tables (JSON)', type: 'textarea', required: true },
    { name: 'default_mode', label: 'Default Mode', type: 'select', required: true, options: [
      { label: 'AsAzure', value: 'AsAzure' },
      { label: 'AsOnPrem', value: 'AsOnPrem' },
      { label: 'Push', value: 'Push' }
    ]}
  ],
  endpoints: [],
  configSchema: {
    client_id: { type: 'text', label: 'Client ID', required: true },
    client_secret: { type: 'password', label: 'Client Secret', required: true }
  }
};

// Real Estate
export const moxiworksCreateContact: IntegrationNode = {
  id: 'moxiworks_create_contact',
  name: 'Create Contact',
  description: 'Create a new contact in MoxiWorks',
  category: 'crm',
  icon: Users,
  color: '#00B4D8',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'contact_name', label: 'Contact Name', type: 'text', required: true },
    { name: 'primary_email_address', label: 'Email Address', type: 'text', required: true },
    { name: 'primary_phone_number', label: 'Phone Number', type: 'text', required: false },
    { name: 'home_purchase_anniversary', label: 'Home Purchase Date', type: 'text', required: false }
  ],
  endpoints: [],
  configSchema: {
    identifier: { type: 'text', label: 'Partner Identifier', required: true },
    secret: { type: 'password', label: 'Partner Secret', required: true }
  }
};

// Insurance
export const appliedSystemsCreateClient: IntegrationNode = {
  id: 'applied_systems_create_client',
  name: 'Create Client',
  description: 'Create a new client in Applied Systems',
  category: 'crm',
  icon: Building,
  color: '#1B365D',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'client_name', label: 'Client Name', type: 'text', required: true },
    { name: 'client_type', label: 'Client Type', type: 'select', required: true, options: [
      { label: 'Individual', value: 'Individual' },
      { label: 'Business', value: 'Business' }
    ]},
    { name: 'primary_contact', label: 'Primary Contact', type: 'text', required: false }
  ],
  endpoints: [],
  configSchema: {
    api_key: { type: 'password', label: 'API Key', required: true },
    base_url: { type: 'text', label: 'Base URL', required: true }
  }
};

// Time Tracking
export const togglCreateTimeEntry: IntegrationNode = {
  id: 'toggl_create_time_entry',
  name: 'Create Time Entry',
  description: 'Create a new time entry in Toggl',
  category: 'productivity',
  icon: Calendar,
  color: '#E57CD8',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'description', label: 'Description', type: 'text', required: true },
    { name: 'project_id', label: 'Project ID', type: 'text', required: false },
    { name: 'duration', label: 'Duration (seconds)', type: 'number', required: true },
    { name: 'start', label: 'Start Time (ISO 8601)', type: 'text', required: true }
  ],
  endpoints: [],
  configSchema: {
    api_token: { type: 'password', label: 'API Token', required: true }
  }
};

export const harvestCreateTimeEntry: IntegrationNode = {
  id: 'harvest_create_time_entry',
  name: 'Create Time Entry',
  description: 'Create a new time entry in Harvest',
  category: 'productivity',
  icon: Calendar,
  color: '#F47A1F',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'project_id', label: 'Project ID', type: 'text', required: true },
    { name: 'task_id', label: 'Task ID', type: 'text', required: true },
    { name: 'spent_date', label: 'Date (YYYY-MM-DD)', type: 'text', required: true },
    { name: 'hours', label: 'Hours', type: 'number', required: true },
    { name: 'notes', label: 'Notes', type: 'textarea', required: false }
  ],
  endpoints: [],
  configSchema: {
    access_token: { type: 'password', label: 'Access Token', required: true },
    account_id: { type: 'text', label: 'Account ID', required: true }
  }
};

// Expense Management
export const expensifyCreateExpense: IntegrationNode = {
  id: 'expensify_create_expense',
  name: 'Create Expense',
  description: 'Create a new expense in Expensify',
  category: 'productivity',
  icon: DollarSign,
  color: '#00C896',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'amount', label: 'Amount', type: 'number', required: true },
    { name: 'currency', label: 'Currency', type: 'text', required: true, placeholder: 'USD' },
    { name: 'merchant', label: 'Merchant', type: 'text', required: true },
    { name: 'category', label: 'Category', type: 'text', required: false },
    { name: 'comment', label: 'Comment', type: 'textarea', required: false }
  ],
  endpoints: [],
  configSchema: {
    user_id: { type: 'text', label: 'User ID', required: true },
    user_secret: { type: 'password', label: 'User Secret', required: true }
  }
};