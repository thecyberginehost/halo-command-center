import { HaloNodeDefinition, HaloNodeExecuteContext, HaloNodeExecutionData } from '../../types/haloNode';

export const SalesforceNode: HaloNodeDefinition = {
  displayName: 'Salesforce',
  name: 'salesforce',
  icon: 'salesforce.svg',
  group: ['crm'],
  version: 1,
  description: 'Manage leads, contacts, and opportunities in Salesforce',
  defaults: {
    name: 'Salesforce',
    color: '#00A1E0',
  },
  inputs: ['main'],
  outputs: ['main'],
  credentials: [
    {
      name: 'salesforceCredentials',
      required: true
    }
  ],
  properties: [
    {
      displayName: 'Operation',
      name: 'operation',
      type: 'options',
      default: 'createLead',
      required: true,
      options: [
        { name: 'Create Lead', value: 'createLead' },
        { name: 'Create Contact', value: 'createContact' },
        { name: 'Update Contact', value: 'updateContact' },
        { name: 'Create Opportunity', value: 'createOpportunity' },
        { name: 'Search Records', value: 'search' }
      ]
    },
    {
      displayName: 'First Name',
      name: 'firstName',
      type: 'string',
      default: '',
      required: true,
      description: 'First name of the lead/contact',
      placeholder: 'John',
      displayOptions: {
        show: {
          operation: ['createLead', 'createContact']
        }
      }
    },
    {
      displayName: 'Last Name',
      name: 'lastName',
      type: 'string',
      default: '',
      required: true,
      description: 'Last name of the lead/contact',
      placeholder: 'Doe',
      displayOptions: {
        show: {
          operation: ['createLead', 'createContact', 'updateContact']
        }
      }
    },
    {
      displayName: 'Email',
      name: 'email',
      type: 'string',
      default: '',
      required: true,
      description: 'Email address',
      placeholder: 'john.doe@example.com',
      displayOptions: {
        show: {
          operation: ['createLead', 'createContact', 'updateContact']
        }
      }
    },
    {
      displayName: 'Company',
      name: 'company',
      type: 'string',
      default: '',
      required: true,
      description: 'Company name (required for leads)',
      placeholder: 'ACME Corporation',
      displayOptions: {
        show: {
          operation: ['createLead']
        }
      }
    },
    {
      displayName: 'Phone',
      name: 'phone',
      type: 'string',
      default: '',
      required: false,
      description: 'Phone number',
      placeholder: '+1-555-123-4567',
      displayOptions: {
        show: {
          operation: ['createLead', 'createContact', 'updateContact']
        }
      }
    },
    {
      displayName: 'Contact ID',
      name: 'contactId',
      type: 'string',
      default: '',
      required: true,
      description: 'Salesforce Contact ID to update',
      placeholder: '0033000000abc123',
      displayOptions: {
        show: {
          operation: ['updateContact']
        }
      }
    },
    {
      displayName: 'Opportunity Name',
      name: 'opportunityName',
      type: 'string',
      default: '',
      required: true,
      description: 'Name of the opportunity',
      placeholder: 'Q1 2024 Deal',
      displayOptions: {
        show: {
          operation: ['createOpportunity']
        }
      }
    },
    {
      displayName: 'Account ID',
      name: 'accountId',
      type: 'string',
      default: '',
      required: true,
      description: 'Salesforce Account ID for the opportunity',
      placeholder: '0013000000abc123',
      displayOptions: {
        show: {
          operation: ['createOpportunity']
        }
      }
    },
    {
      displayName: 'Search Query (SOQL)',
      name: 'searchQuery',
      type: 'string',
      default: '',
      required: true,
      description: 'SOQL query to search records',
      placeholder: 'SELECT Id, Name, Email FROM Contact WHERE Email != null LIMIT 10',
      typeOptions: {
        rows: 3
      },
      displayOptions: {
        show: {
          operation: ['search']
        }
      }
    }
  ],
  async execute(context: HaloNodeExecuteContext): Promise<HaloNodeExecutionData[][]> {
    const operation = context.getNodeParameter('operation', 0) as string;
    const inputData = context.getInputData();
    const previousData = inputData[0]?.json || {};

    try {
      let result: any = {
        timestamp: new Date().toISOString(),
        service: 'salesforce',
        operation,
        previousNodeData: previousData
      };

      if (operation === 'createLead') {
        const firstName = context.getNodeParameter('firstName', 0) as string;
        const lastName = context.getNodeParameter('lastName', 0) as string;
        const email = context.getNodeParameter('email', 0) as string;
        const company = context.getNodeParameter('company', 0) as string;
        const phone = context.getNodeParameter('phone', 0) as string;

        result = {
          ...result,
          leadId: `00Q3000000${Math.random().toString(36).substr(2, 9)}`,
          firstName,
          lastName,
          email,
          company,
          phone: phone || undefined,
          status: 'Open - Not Contacted',
          created: true
        };

        console.log('Salesforce lead would be created:', result);
      } else if (operation === 'createContact') {
        const firstName = context.getNodeParameter('firstName', 0) as string;
        const lastName = context.getNodeParameter('lastName', 0) as string;
        const email = context.getNodeParameter('email', 0) as string;
        const phone = context.getNodeParameter('phone', 0) as string;

        result = {
          ...result,
          contactId: `0033000000${Math.random().toString(36).substr(2, 9)}`,
          firstName,
          lastName,
          email,
          phone: phone || undefined,
          created: true
        };

        console.log('Salesforce contact would be created:', result);
      } else if (operation === 'updateContact') {
        const contactId = context.getNodeParameter('contactId', 0) as string;
        const lastName = context.getNodeParameter('lastName', 0) as string;
        const email = context.getNodeParameter('email', 0) as string;
        const phone = context.getNodeParameter('phone', 0) as string;

        result = {
          ...result,
          contactId,
          lastName,
          email,
          phone: phone || undefined,
          updated: true
        };

        console.log('Salesforce contact would be updated:', result);
      } else if (operation === 'createOpportunity') {
        const opportunityName = context.getNodeParameter('opportunityName', 0) as string;
        const accountId = context.getNodeParameter('accountId', 0) as string;

        result = {
          ...result,
          opportunityId: `0063000000${Math.random().toString(36).substr(2, 9)}`,
          name: opportunityName,
          accountId,
          stage: 'Qualification',
          closeDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
          created: true
        };

        console.log('Salesforce opportunity would be created:', result);
      } else if (operation === 'search') {
        const searchQuery = context.getNodeParameter('searchQuery', 0) as string;

        result = {
          ...result,
          query: searchQuery,
          records: [
            {
              Id: '0033000000example',
              Name: 'Sample Contact',
              Email: 'sample@example.com'
            }
          ],
          totalSize: 1
        };

        console.log('Salesforce search would return:', result);
      }

      return [[{ json: result }]];
    } catch (error) {
      throw new Error(`Failed to execute Salesforce operation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};