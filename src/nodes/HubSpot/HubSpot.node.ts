import { HaloNodeDefinition, HaloNodeExecuteContext, HaloNodeExecutionData } from '../../types/haloNode';

export const HubSpotNode: HaloNodeDefinition = {
  displayName: 'HubSpot',
  name: 'hubspot',
  icon: 'hubspot.svg',
  group: ['crm'],
  version: 1,
  description: 'Manage contacts, companies, and deals in HubSpot',
  defaults: {
    name: 'HubSpot',
    color: '#FF7A59',
  },
  inputs: ['main'],
  outputs: ['main'],
  credentials: [
    {
      name: 'hubspotCredentials',
      required: true
    }
  ],
  properties: [
    {
      displayName: 'Operation',
      name: 'operation',
      type: 'options',
      default: 'createContact',
      required: true,
      options: [
        { name: 'Create Contact', value: 'createContact' },
        { name: 'Update Contact', value: 'updateContact' },
        { name: 'Create Company', value: 'createCompany' },
        { name: 'Create Deal', value: 'createDeal' },
        { name: 'Search Contacts', value: 'searchContacts' }
      ]
    },
    {
      displayName: 'First Name',
      name: 'firstname',
      type: 'string',
      default: '',
      required: false,
      description: 'Contact first name',
      placeholder: 'John',
      displayOptions: {
        show: {
          operation: ['createContact', 'updateContact']
        }
      }
    },
    {
      displayName: 'Last Name',
      name: 'lastname',
      type: 'string',
      default: '',
      required: false,
      description: 'Contact last name',
      placeholder: 'Doe',
      displayOptions: {
        show: {
          operation: ['createContact', 'updateContact']
        }
      }
    },
    {
      displayName: 'Email',
      name: 'email',
      type: 'string',
      default: '',
      required: true,
      description: 'Contact email address',
      placeholder: 'john.doe@example.com',
      displayOptions: {
        show: {
          operation: ['createContact', 'updateContact']
        }
      }
    },
    {
      displayName: 'Phone',
      name: 'phone',
      type: 'string',
      default: '',
      required: false,
      description: 'Contact phone number',
      placeholder: '+1-555-123-4567',
      displayOptions: {
        show: {
          operation: ['createContact', 'updateContact']
        }
      }
    },
    {
      displayName: 'Company Name',
      name: 'companyName',
      type: 'string',
      default: '',
      required: true,
      description: 'Name of the company',
      placeholder: 'ACME Corporation',
      displayOptions: {
        show: {
          operation: ['createCompany']
        }
      }
    },
    {
      displayName: 'Company Domain',
      name: 'domain',
      type: 'string',
      default: '',
      required: false,
      description: 'Company domain',
      placeholder: 'acme.com',
      displayOptions: {
        show: {
          operation: ['createCompany']
        }
      }
    },
    {
      displayName: 'Deal Name',
      name: 'dealname',
      type: 'string',
      default: '',
      required: true,
      description: 'Name of the deal',
      placeholder: 'Q1 2024 Contract',
      displayOptions: {
        show: {
          operation: ['createDeal']
        }
      }
    },
    {
      displayName: 'Deal Amount',
      name: 'amount',
      type: 'string',
      default: '0',
      required: false,
      description: 'Deal amount in cents',
      placeholder: '100000',
      displayOptions: {
        show: {
          operation: ['createDeal']
        }
      }
    },
    {
      displayName: 'Deal Stage',
      name: 'dealstage',
      type: 'options',
      default: 'appointmentscheduled',
      required: false,
      options: [
        { name: 'Appointment Scheduled', value: 'appointmentscheduled' },
        { name: 'Qualified to Buy', value: 'qualifiedtobuy' },
        { name: 'Presentation Scheduled', value: 'presentationscheduled' },
        { name: 'Decision Maker Bought-In', value: 'decisionmakerboughtin' },
        { name: 'Contract Sent', value: 'contractsent' },
        { name: 'Closed Won', value: 'closedwon' },
        { name: 'Closed Lost', value: 'closedlost' }
      ],
      displayOptions: {
        show: {
          operation: ['createDeal']
        }
      }
    },
    {
      displayName: 'Contact ID',
      name: 'contactId',
      type: 'string',
      default: '',
      required: true,
      description: 'HubSpot Contact ID to update',
      placeholder: '12345',
      displayOptions: {
        show: {
          operation: ['updateContact']
        }
      }
    },
    {
      displayName: 'Search Query',
      name: 'searchQuery',
      type: 'string',
      default: '',
      required: true,
      description: 'Email or name to search for',
      placeholder: 'john.doe@example.com',
      displayOptions: {
        show: {
          operation: ['searchContacts']
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
        service: 'hubspot',
        operation,
        previousNodeData: previousData
      };

      if (operation === 'createContact') {
        const firstname = context.getNodeParameter('firstname', 0) as string;
        const lastname = context.getNodeParameter('lastname', 0) as string;
        const email = context.getNodeParameter('email', 0) as string;
        const phone = context.getNodeParameter('phone', 0) as string;

        result = {
          ...result,
          contactId: Math.floor(Math.random() * 100000).toString(),
          properties: {
            firstname: firstname || undefined,
            lastname: lastname || undefined,
            email,
            phone: phone || undefined,
            createdate: new Date().toISOString(),
            lastmodifieddate: new Date().toISOString()
          },
          created: true
        };

        console.log('HubSpot contact would be created:', result);
      } else if (operation === 'updateContact') {
        const contactId = context.getNodeParameter('contactId', 0) as string;
        const firstname = context.getNodeParameter('firstname', 0) as string;
        const lastname = context.getNodeParameter('lastname', 0) as string;
        const email = context.getNodeParameter('email', 0) as string;
        const phone = context.getNodeParameter('phone', 0) as string;

        result = {
          ...result,
          contactId,
          properties: {
            firstname: firstname || undefined,
            lastname: lastname || undefined,
            email,
            phone: phone || undefined,
            lastmodifieddate: new Date().toISOString()
          },
          updated: true
        };

        console.log('HubSpot contact would be updated:', result);
      } else if (operation === 'createCompany') {
        const companyName = context.getNodeParameter('companyName', 0) as string;
        const domain = context.getNodeParameter('domain', 0) as string;

        result = {
          ...result,
          companyId: Math.floor(Math.random() * 100000).toString(),
          properties: {
            name: companyName,
            domain: domain || undefined,
            createdate: new Date().toISOString(),
            hs_lastmodifieddate: new Date().toISOString()
          },
          created: true
        };

        console.log('HubSpot company would be created:', result);
      } else if (operation === 'createDeal') {
        const dealname = context.getNodeParameter('dealname', 0) as string;
        const amount = context.getNodeParameter('amount', 0) as string;
        const dealstage = context.getNodeParameter('dealstage', 0) as string;

        result = {
          ...result,
          dealId: Math.floor(Math.random() * 100000).toString(),
          properties: {
            dealname,
            amount: amount || undefined,
            dealstage,
            createdate: new Date().toISOString(),
            hs_lastmodifieddate: new Date().toISOString(),
            closedate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
          },
          created: true
        };

        console.log('HubSpot deal would be created:', result);
      } else if (operation === 'searchContacts') {
        const searchQuery = context.getNodeParameter('searchQuery', 0) as string;

        result = {
          ...result,
          query: searchQuery,
          results: [
            {
              id: '12345',
              properties: {
                firstname: 'John',
                lastname: 'Doe',
                email: 'john.doe@example.com',
                createdate: new Date().toISOString()
              }
            }
          ],
          total: 1
        };

        console.log('HubSpot search would return:', result);
      }

      return [[{ json: result }]];
    } catch (error) {
      throw new Error(`Failed to execute HubSpot operation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};