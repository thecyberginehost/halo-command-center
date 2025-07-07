import { IntegrationNode } from '@/types/integrations';

export const salesforceIntegration: IntegrationNode = {
  id: 'salesforce',
  name: 'Salesforce',
  description: 'Manage leads, contacts, and opportunities in Salesforce',
  category: 'crm',
  icon: 'Users',
  color: 'bg-blue-600',
  type: 'action',
  requiresAuth: true,
  authType: 'oauth',
  configSchema: {
    objectType: {
      type: 'select',
      label: 'Object Type',
      required: true,
      options: [
        { label: 'Lead', value: 'Lead' },
        { label: 'Contact', value: 'Contact' },
        { label: 'Account', value: 'Account' },
        { label: 'Opportunity', value: 'Opportunity' }
      ]
    },
    firstName: {
      type: 'text',
      label: 'First Name',
      required: false
    },
    lastName: {
      type: 'text',
      label: 'Last Name',
      required: true
    },
    email: {
      type: 'email',
      label: 'Email',
      required: false
    },
    company: {
      type: 'text',
      label: 'Company',
      required: false
    },
    phone: {
      type: 'text',
      label: 'Phone',
      required: false
    }
  },
  endpoints: [
    {
      id: 'create',
      name: 'Create Record',
      description: 'Create a new record in Salesforce',
      method: 'POST',
      path: '/salesforce/create',
      parameters: {
        objectType: {
          type: 'select',
          label: 'Object Type',
          required: true,
          options: [
            { label: 'Lead', value: 'Lead' },
            { label: 'Contact', value: 'Contact' }
          ]
        }
      }
    },
    {
      id: 'update',
      name: 'Update Record',
      description: 'Update an existing record in Salesforce',
      method: 'PUT',
      path: '/salesforce/update',
      parameters: {
        recordId: {
          type: 'text',
          label: 'Record ID',
          required: true
        }
      }
    }
  ]
};

export const hubspotIntegration: IntegrationNode = {
  id: 'hubspot',
  name: 'HubSpot',
  description: 'Manage contacts and deals in HubSpot CRM',
  category: 'crm',
  icon: 'Users',
  color: 'bg-orange-600',
  type: 'action',
  requiresAuth: true,
  authType: 'api_key',
  configSchema: {
    apiKey: {
      type: 'password',
      label: 'HubSpot API Key',
      required: true
    },
    email: {
      type: 'email',
      label: 'Email',
      required: true
    },
    firstName: {
      type: 'text',
      label: 'First Name',
      required: false
    },
    lastName: {
      type: 'text',
      label: 'Last Name',
      required: false
    },
    company: {
      type: 'text',
      label: 'Company',
      required: false
    },
    phone: {
      type: 'text',
      label: 'Phone',
      required: false
    }
  },
  endpoints: [
    {
      id: 'create-contact',
      name: 'Create Contact',
      description: 'Create a new contact in HubSpot',
      method: 'POST',
      path: '/hubspot/contacts',
      parameters: {
        email: {
          type: 'email',
          label: 'Email',
          required: true
        },
        firstName: {
          type: 'text',
          label: 'First Name',
          required: false
        },
        lastName: {
          type: 'text',
          label: 'Last Name',
          required: false
        }
      }
    }
  ]
};

export const pipedriveIntegration: IntegrationNode = {
  id: 'pipedrive',
  name: 'Pipedrive',
  description: 'Manage leads and deals in Pipedrive CRM',
  category: 'crm',
  icon: 'Users',
  color: 'bg-green-600',
  type: 'action',
  requiresAuth: true,
  authType: 'api_key',
  configSchema: {
    apiToken: {
      type: 'password',
      label: 'Pipedrive API Token',
      required: true
    },
    companyDomain: {
      type: 'text',
      label: 'Company Domain',
      placeholder: 'yourcompany',
      required: true
    },
    name: {
      type: 'text',
      label: 'Person Name',
      required: true
    },
    email: {
      type: 'email',
      label: 'Email',
      required: false
    },
    phone: {
      type: 'text',
      label: 'Phone',
      required: false
    }
  },
  endpoints: [
    {
      id: 'create-person',
      name: 'Create Person',
      description: 'Create a new person in Pipedrive',
      method: 'POST',
      path: '/pipedrive/persons',
      parameters: {
        name: {
          type: 'text',
          label: 'Name',
          required: true
        },
        email: {
          type: 'email',
          label: 'Email',
          required: false
        }
      }
    }
  ]
};