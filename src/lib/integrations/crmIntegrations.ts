import { IntegrationService, IntegrationNode } from '@/types/integrations';
import { Users, UserPlus, UserCheck, Search, Edit, Trash2, Building } from 'lucide-react';

export const salesforceService: IntegrationService = {
  id: 'salesforce',
  name: 'Salesforce',
  description: 'Salesforce CRM integration',
  category: 'crm',
  icon: Building,
  color: '#00A1E0',
  requiresAuth: true,
  authType: 'oauth',
  configSchema: {},
  actions: [
    {
      id: 'create_lead',
      name: 'Create Lead',
      description: 'Create a new lead in Salesforce',
      type: 'action',
      fields: [
        { name: 'firstName', label: 'First Name', type: 'text', required: true, placeholder: 'John' },
        { name: 'lastName', label: 'Last Name', type: 'text', required: true, placeholder: 'Doe' },
        { name: 'email', label: 'Email', type: 'text', required: true, placeholder: 'john@example.com' },
        { name: 'company', label: 'Company', type: 'text', required: true, placeholder: 'ACME Corp' },
        { name: 'phone', label: 'Phone', type: 'text', required: false, placeholder: '+1234567890' }
      ],
      endpoint: { id: 'create_lead', name: 'Create Lead', description: 'Create lead in Salesforce', method: 'POST', path: '/salesforce/leads', parameters: {} }
    },
    {
      id: 'create_contact',
      name: 'Create Contact',
      description: 'Create a new contact in Salesforce',
      type: 'action',
      fields: [
        { name: 'firstName', label: 'First Name', type: 'text', required: true, placeholder: 'John' },
        { name: 'lastName', label: 'Last Name', type: 'text', required: true, placeholder: 'Doe' },
        { name: 'email', label: 'Email', type: 'text', required: true, placeholder: 'john@example.com' },
        { name: 'accountId', label: 'Account ID', type: 'text', required: false, placeholder: '0013000000abc123' }
      ],
      endpoint: { id: 'create_contact', name: 'Create Contact', description: 'Create contact in Salesforce', method: 'POST', path: '/salesforce/contacts', parameters: {} }
    },
    {
      id: 'update_contact',
      name: 'Update Contact',
      description: 'Update an existing contact in Salesforce',
      type: 'action',
      fields: [
        { name: 'contactId', label: 'Contact ID', type: 'text', required: true, placeholder: '0033000000abc123' },
        { name: 'firstName', label: 'First Name', type: 'text', required: false, placeholder: 'John' },
        { name: 'lastName', label: 'Last Name', type: 'text', required: false, placeholder: 'Doe' },
        { name: 'email', label: 'Email', type: 'text', required: false, placeholder: 'john@example.com' }
      ],
      endpoint: { id: 'update_contact', name: 'Update Contact', description: 'Update contact in Salesforce', method: 'PUT', path: '/salesforce/contacts', parameters: {} }
    },
    {
      id: 'search_contacts',
      name: 'Search Contacts',
      description: 'Search for contacts in Salesforce',
      type: 'action',
      fields: [
        { name: 'searchTerm', label: 'Search Term', type: 'text', required: true, placeholder: 'john@example.com' },
        { name: 'limit', label: 'Limit', type: 'number', required: false, defaultValue: 10 }
      ],
      endpoint: { id: 'search_contacts', name: 'Search Contacts', description: 'Search contacts in Salesforce', method: 'GET', path: '/salesforce/contacts/search', parameters: {} }
    },
    {
      id: 'create_opportunity',
      name: 'Create Opportunity',
      description: 'Create a new opportunity in Salesforce',
      type: 'action',
      fields: [
        { name: 'name', label: 'Opportunity Name', type: 'text', required: true, placeholder: 'Big Deal 2024' },
        { name: 'amount', label: 'Amount', type: 'number', required: false, placeholder: '50000' },
        { name: 'closeDate', label: 'Close Date', type: 'text', required: true, placeholder: '2024-12-31' },
        { name: 'stageName', label: 'Stage', type: 'text', required: true, placeholder: 'Prospecting' }
      ],
      endpoint: { id: 'create_opportunity', name: 'Create Opportunity', description: 'Create opportunity in Salesforce', method: 'POST', path: '/salesforce/opportunities', parameters: {} }
    }
  ]
};

// Generate individual nodes for each Salesforce action
export const salesforceCreateLead: IntegrationNode = {
  ...salesforceService,
  id: 'salesforce-create-lead',
  name: 'Salesforce - Create Lead',
  type: 'action',
  icon: UserPlus,
  serviceId: 'salesforce',
  actionId: 'create_lead',
  fields: salesforceService.actions[0].fields,
  endpoints: [salesforceService.actions[0].endpoint]
};

export const salesforceCreateContact: IntegrationNode = {
  ...salesforceService,
  id: 'salesforce-create-contact',
  name: 'Salesforce - Create Contact',
  type: 'action',
  icon: UserPlus,
  serviceId: 'salesforce',
  actionId: 'create_contact',
  fields: salesforceService.actions[1].fields,
  endpoints: [salesforceService.actions[1].endpoint]
};

export const salesforceUpdateContact: IntegrationNode = {
  ...salesforceService,
  id: 'salesforce-update-contact',
  name: 'Salesforce - Update Contact',
  type: 'action',
  icon: Edit,
  serviceId: 'salesforce',
  actionId: 'update_contact',
  fields: salesforceService.actions[2].fields,
  endpoints: [salesforceService.actions[2].endpoint]
};

export const salesforceSearchContacts: IntegrationNode = {
  ...salesforceService,
  id: 'salesforce-search-contacts',
  name: 'Salesforce - Search Contacts',
  type: 'action',
  icon: Search,
  serviceId: 'salesforce',
  actionId: 'search_contacts',
  fields: salesforceService.actions[3].fields,
  endpoints: [salesforceService.actions[3].endpoint]
};

export const salesforceCreateOpportunity: IntegrationNode = {
  ...salesforceService,
  id: 'salesforce-create-opportunity',
  name: 'Salesforce - Create Opportunity',
  type: 'action',
  icon: Building,
  serviceId: 'salesforce',
  actionId: 'create_opportunity',
  fields: salesforceService.actions[4].fields,
  endpoints: [salesforceService.actions[4].endpoint]
};

export const hubspotService: IntegrationService = {
  id: 'hubspot',
  name: 'HubSpot',
  description: 'HubSpot CRM integration',
  category: 'crm',
  icon: Users,
  color: '#FF7A59',
  requiresAuth: true,
  authType: 'api_key',
  configSchema: {},
  actions: [
    {
      id: 'create_contact',
      name: 'Create Contact',
      description: 'Create a new contact in HubSpot',
      type: 'action',
      fields: [
        { name: 'email', label: 'Email', type: 'text', required: true, placeholder: 'john@example.com' },
        { name: 'firstname', label: 'First Name', type: 'text', required: false, placeholder: 'John' },
        { name: 'lastname', label: 'Last Name', type: 'text', required: false, placeholder: 'Doe' },
        { name: 'phone', label: 'Phone', type: 'text', required: false, placeholder: '+1234567890' },
        { name: 'company', label: 'Company', type: 'text', required: false, placeholder: 'ACME Corp' }
      ],
      endpoint: { id: 'create_contact', name: 'Create Contact', description: 'Create contact in HubSpot', method: 'POST', path: '/hubspot/contacts', parameters: {} }
    },
    {
      id: 'update_contact',
      name: 'Update Contact',
      description: 'Update an existing contact in HubSpot',
      type: 'action',
      fields: [
        { name: 'contactId', label: 'Contact ID', type: 'text', required: true, placeholder: '12345' },
        { name: 'email', label: 'Email', type: 'text', required: false, placeholder: 'john@example.com' },
        { name: 'firstname', label: 'First Name', type: 'text', required: false, placeholder: 'John' },
        { name: 'lastname', label: 'Last Name', type: 'text', required: false, placeholder: 'Doe' }
      ],
      endpoint: { id: 'update_contact', name: 'Update Contact', description: 'Update contact in HubSpot', method: 'PUT', path: '/hubspot/contacts', parameters: {} }
    },
    {
      id: 'create_deal',
      name: 'Create Deal',
      description: 'Create a new deal in HubSpot',
      type: 'action',
      fields: [
        { name: 'dealname', label: 'Deal Name', type: 'text', required: true, placeholder: 'Big Deal 2024' },
        { name: 'amount', label: 'Amount', type: 'number', required: false, placeholder: '50000' },
        { name: 'dealstage', label: 'Deal Stage', type: 'text', required: true, placeholder: 'qualifiedtobuy' },
        { name: 'pipeline', label: 'Pipeline', type: 'text', required: false, placeholder: 'default' }
      ],
      endpoint: { id: 'create_deal', name: 'Create Deal', description: 'Create deal in HubSpot', method: 'POST', path: '/hubspot/deals', parameters: {} }
    }
  ]
};

export const hubspotCreateContact: IntegrationNode = {
  ...hubspotService,
  id: 'hubspot-create-contact',
  name: 'HubSpot - Create Contact',
  type: 'action',
  icon: UserPlus,
  serviceId: 'hubspot',
  actionId: 'create_contact',
  fields: hubspotService.actions[0].fields,
  endpoints: [hubspotService.actions[0].endpoint]
};

export const hubspotUpdateContact: IntegrationNode = {
  ...hubspotService,
  id: 'hubspot-update-contact',
  name: 'HubSpot - Update Contact',
  type: 'action',
  icon: Edit,
  serviceId: 'hubspot',
  actionId: 'update_contact',
  fields: hubspotService.actions[1].fields,
  endpoints: [hubspotService.actions[1].endpoint]
};

export const hubspotCreateDeal: IntegrationNode = {
  ...hubspotService,
  id: 'hubspot-create-deal',
  name: 'HubSpot - Create Deal',
  type: 'action',
  icon: Building,
  serviceId: 'hubspot',
  actionId: 'create_deal',
  fields: hubspotService.actions[2].fields,
  endpoints: [hubspotService.actions[2].endpoint]
};

export const pipedriveService: IntegrationService = {
  id: 'pipedrive',
  name: 'Pipedrive',
  description: 'Pipedrive CRM integration',
  category: 'crm',
  icon: Building,
  color: '#28BF47',
  requiresAuth: true,
  authType: 'api_key',
  configSchema: {},
  actions: [
    {
      id: 'create_person',
      name: 'Create Person',
      description: 'Create a new person in Pipedrive',
      type: 'action',
      fields: [
        { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'John Doe' },
        { name: 'email', label: 'Email', type: 'text', required: false, placeholder: 'john@example.com' },
        { name: 'phone', label: 'Phone', type: 'text', required: false, placeholder: '+1234567890' },
        { name: 'org_id', label: 'Organization ID', type: 'text', required: false, placeholder: '123' }
      ],
      endpoint: { id: 'create_person', name: 'Create Person', description: 'Create person in Pipedrive', method: 'POST', path: '/pipedrive/persons', parameters: {} }
    },
    {
      id: 'create_deal',
      name: 'Create Deal',
      description: 'Create a new deal in Pipedrive',
      type: 'action',
      fields: [
        { name: 'title', label: 'Deal Title', type: 'text', required: true, placeholder: 'Big Deal 2024' },
        { name: 'value', label: 'Value', type: 'number', required: false, placeholder: '50000' },
        { name: 'currency', label: 'Currency', type: 'text', required: false, placeholder: 'USD' },
        { name: 'person_id', label: 'Person ID', type: 'text', required: false, placeholder: '123' }
      ],
      endpoint: { id: 'create_deal', name: 'Create Deal', description: 'Create deal in Pipedrive', method: 'POST', path: '/pipedrive/deals', parameters: {} }
    },
    {
      id: 'update_deal',
      name: 'Update Deal',
      description: 'Update an existing deal in Pipedrive',
      type: 'action',
      fields: [
        { name: 'deal_id', label: 'Deal ID', type: 'text', required: true, placeholder: '123' },
        { name: 'title', label: 'Deal Title', type: 'text', required: false, placeholder: 'Updated Deal' },
        { name: 'value', label: 'Value', type: 'number', required: false, placeholder: '60000' },
        { name: 'stage_id', label: 'Stage ID', type: 'text', required: false, placeholder: '1' }
      ],
      endpoint: { id: 'update_deal', name: 'Update Deal', description: 'Update deal in Pipedrive', method: 'PUT', path: '/pipedrive/deals', parameters: {} }
    }
  ]
};

export const pipedriveCreatePerson: IntegrationNode = {
  ...pipedriveService,
  id: 'pipedrive-create-person',
  name: 'Pipedrive - Create Person',
  type: 'action',
  icon: UserPlus,
  serviceId: 'pipedrive',
  actionId: 'create_person',
  fields: pipedriveService.actions[0].fields,
  endpoints: [pipedriveService.actions[0].endpoint]
};

export const pipedriveCreateDeal: IntegrationNode = {
  ...pipedriveService,
  id: 'pipedrive-create-deal',
  name: 'Pipedrive - Create Deal',
  type: 'action',
  icon: Building,
  serviceId: 'pipedrive',
  actionId: 'create_deal',
  fields: pipedriveService.actions[1].fields,
  endpoints: [pipedriveService.actions[1].endpoint]
};

export const pipedriveUpdateDeal: IntegrationNode = {
  ...pipedriveService,
  id: 'pipedrive-update-deal',
  name: 'Pipedrive - Update Deal',
  type: 'action',
  icon: Edit,
  serviceId: 'pipedrive',
  actionId: 'update_deal',
  fields: pipedriveService.actions[2].fields,
  endpoints: [pipedriveService.actions[2].endpoint]
};

// Keep backward compatibility
export const salesforceIntegration: IntegrationNode = salesforceCreateLead;
export const hubspotIntegration: IntegrationNode = hubspotCreateContact;
export const pipedriveIntegration: IntegrationNode = pipedriveCreatePerson;
