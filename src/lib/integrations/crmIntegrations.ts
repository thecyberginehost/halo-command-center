import { IntegrationNode } from '@/types/integrations';
import { Users } from 'lucide-react';

export const salesforceIntegration: IntegrationNode = {
  id: 'salesforce',
  name: 'Salesforce',
  description: 'Manage leads, contacts, and opportunities in Salesforce',
  category: 'crm',
  icon: Users,
  color: '#1589FF',
  type: 'action',
  requiresAuth: true,
  authType: 'oauth',
  configSchema: {},
  fields: [
    {
      name: 'objectType',
      label: 'Object Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Lead', value: 'Lead' },
        { label: 'Contact', value: 'Contact' },
        { label: 'Account', value: 'Account' },
        { label: 'Opportunity', value: 'Opportunity' }
      ]
    },
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      required: false,
      placeholder: 'John'
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      required: true,
      placeholder: 'Doe'
    },
    {
      name: 'email',
      label: 'Email',
      type: 'text',
      required: false,
      placeholder: 'john.doe@example.com'
    },
    {
      name: 'company',
      label: 'Company',
      type: 'text',
      required: false,
      placeholder: 'Acme Corp'
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'text',
      required: false,
      placeholder: '+1 555-123-4567'
    }
  ],
  endpoints: [
    {
      id: 'create',
      name: 'Create Record',
      description: 'Create a new record in Salesforce',
      method: 'POST',
      path: '/salesforce/create',
      parameters: {}
    }
  ]
};

export const hubspotIntegration: IntegrationNode = {
  id: 'hubspot',
  name: 'HubSpot',
  description: 'Manage contacts and deals in HubSpot CRM',
  category: 'crm',
  icon: Users,
  color: '#FF7A59',
  type: 'action',
  requiresAuth: true,
  authType: 'api_key',
  configSchema: {},
  fields: [
    {
      name: 'email',
      label: 'Email',
      type: 'text',
      required: true,
      placeholder: 'john.doe@example.com'
    },
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      required: false,
      placeholder: 'John'
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      required: false,
      placeholder: 'Doe'
    },
    {
      name: 'company',
      label: 'Company',
      type: 'text',
      required: false,
      placeholder: 'Acme Corp'
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'text',
      required: false,
      placeholder: '+1 555-123-4567'
    }
  ],
  endpoints: [
    {
      id: 'create-contact',
      name: 'Create Contact',
      description: 'Create a new contact in HubSpot',
      method: 'POST',
      path: '/hubspot/contacts',
      parameters: {}
    }
  ]
};

export const pipedriveIntegration: IntegrationNode = {
  id: 'pipedrive',
  name: 'Pipedrive',
  description: 'Manage leads and deals in Pipedrive CRM',
  category: 'crm',
  icon: Users,
  color: '#00E676',
  type: 'action',
  requiresAuth: true,
  authType: 'api_key',
  configSchema: {},
  fields: [
    {
      name: 'companyDomain',
      label: 'Company Domain',
      type: 'text',
      required: true,
      placeholder: 'yourcompany'
    },
    {
      name: 'name',
      label: 'Person Name',
      type: 'text',
      required: true,
      placeholder: 'John Doe'
    },
    {
      name: 'email',
      label: 'Email',
      type: 'text',
      required: false,
      placeholder: 'john.doe@example.com'
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'text',
      required: false,
      placeholder: '+1 555-123-4567'
    }
  ],
  endpoints: [
    {
      id: 'create-person',
      name: 'Create Person',
      description: 'Create a new person in Pipedrive',
      method: 'POST',
      path: '/pipedrive/persons',
      parameters: {}
    }
  ]
};