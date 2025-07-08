import { IntegrationNode, IntegrationCategory } from '@/types/integrations';
import { 
  gmailSendEmail, 
  gmailSearchEmails, 
  gmailDeleteEmail, 
  gmailArchiveEmail, 
  gmailReplyEmail, 
  gmailNewEmailTrigger,
  sesIntegration, 
  sendgridIntegration 
} from './emailIntegrations';
import { 
  salesforceCreateLead, 
  salesforceCreateContact, 
  salesforceUpdateContact, 
  salesforceSearchContacts, 
  salesforceCreateOpportunity,
  hubspotCreateContact, 
  hubspotUpdateContact, 
  hubspotCreateDeal,
  pipedriveCreatePerson, 
  pipedriveCreateDeal, 
  pipedriveUpdateDeal 
} from './crmIntegrations';
import { webhookTrigger, httpRequestAction, slackIntegration } from './webhookIntegrations';
import { 
  openaiAgentIntegration, 
  claudeAgentIntegration, 
  openaiLLMIntegration, 
  claudeLLMIntegration,
  aiToolIntegration 
} from './aiIntegrations';
import { 
  conditionIntegration, 
  delayIntegration, 
  loopIntegration, 
  errorHandlerIntegration 
} from './logicIntegrations';
import { 
  dataTransformIntegration, 
  dataValidationIntegration, 
  dataStorageIntegration, 
  jsonProcessorIntegration, 
  calculatorIntegration 
} from './dataIntegrations';
import { scheduleTrigger, emailTrigger, formTrigger, fileUploadTrigger } from './triggerIntegrations';
import { postgresqlIntegration, mysqlIntegration, mongodbIntegration, redisIntegration } from './databaseIntegrations';
import { googleDriveIntegration, awsS3Integration, dropboxIntegration } from './fileStorageIntegrations';
import { googleSheetsIntegration, googleCalendarIntegration, notionIntegration, airtableIntegration } from './productivityIntegrations';
import { githubIntegration, jiraIntegration, trelloIntegration, asanaIntegration } from './developerIntegrations';
import { googleAnalyticsIntegration, mixpanelIntegration, segmentIntegration } from './analyticsIntegrations';
import { stripeIntegration, paypalIntegration } from './paymentIntegrations';
import { routerIntegration, iteratorIntegration, aggregatorIntegration } from './flowControlIntegrations';

export const allIntegrations: IntegrationNode[] = [
  // Triggers
  webhookTrigger, scheduleTrigger, emailTrigger, formTrigger, fileUploadTrigger, gmailNewEmailTrigger,
  
  // Email Actions
  gmailSendEmail, gmailSearchEmails, gmailDeleteEmail, gmailArchiveEmail, gmailReplyEmail, sesIntegration, sendgridIntegration,
  
  // CRM Actions
  salesforceCreateLead, salesforceCreateContact, salesforceUpdateContact, salesforceSearchContacts, salesforceCreateOpportunity,
  hubspotCreateContact, hubspotUpdateContact, hubspotCreateDeal,
  pipedriveCreatePerson, pipedriveCreateDeal, pipedriveUpdateDeal,
  
  // Communication Actions
  slackIntegration,
  
  // Webhook Actions
  httpRequestAction,
  
  // AI Actions
  openaiAgentIntegration, claudeAgentIntegration, openaiLLMIntegration, claudeLLMIntegration, aiToolIntegration,
  
  // Logic Steps
  conditionIntegration, delayIntegration, loopIntegration, errorHandlerIntegration,
  
  // Data Processing Steps
  dataTransformIntegration, dataValidationIntegration, dataStorageIntegration, jsonProcessorIntegration, calculatorIntegration,
  
  // Database Integrations
  postgresqlIntegration, mysqlIntegration, mongodbIntegration, redisIntegration,
  
  // File Storage
  googleDriveIntegration, awsS3Integration, dropboxIntegration,
  
  // Productivity Tools
  googleSheetsIntegration, googleCalendarIntegration, notionIntegration, airtableIntegration,
  
  // Developer Tools
  githubIntegration, jiraIntegration, trelloIntegration, asanaIntegration,
  
  // Analytics
  googleAnalyticsIntegration, mixpanelIntegration, segmentIntegration,
  
  // Payment
  stripeIntegration, paypalIntegration,
  
  // Flow Control
  routerIntegration, iteratorIntegration, aggregatorIntegration,
];

export const integrationsByCategory: Record<IntegrationCategory, IntegrationNode[]> = {
  communication: [gmailSendEmail, gmailSearchEmails, gmailDeleteEmail, gmailArchiveEmail, gmailReplyEmail, sesIntegration, sendgridIntegration, slackIntegration],
  crm: [salesforceCreateLead, salesforceCreateContact, salesforceUpdateContact, salesforceSearchContacts, salesforceCreateOpportunity, hubspotCreateContact, hubspotUpdateContact, hubspotCreateDeal, pipedriveCreatePerson, pipedriveCreateDeal, pipedriveUpdateDeal],
  webhook: [webhookTrigger, httpRequestAction, conditionIntegration, delayIntegration, loopIntegration, errorHandlerIntegration, routerIntegration, iteratorIntegration, aggregatorIntegration],
  database: [postgresqlIntegration, mysqlIntegration, mongodbIntegration, redisIntegration, dataTransformIntegration, dataValidationIntegration, dataStorageIntegration, jsonProcessorIntegration, calculatorIntegration],
  file_storage: [googleDriveIntegration, awsS3Integration, dropboxIntegration],
  ai: [openaiAgentIntegration, claudeAgentIntegration, openaiLLMIntegration, claudeLLMIntegration, aiToolIntegration],
  analytics: [googleAnalyticsIntegration, mixpanelIntegration, segmentIntegration],
  payment: [stripeIntegration, paypalIntegration],
  productivity: [googleSheetsIntegration, googleCalendarIntegration, notionIntegration, airtableIntegration],
  developer_tools: [githubIntegration, jiraIntegration, trelloIntegration, asanaIntegration],
  triggers: [scheduleTrigger, emailTrigger, formTrigger, fileUploadTrigger, gmailNewEmailTrigger]
};

export const getIntegrationById = (id: string): IntegrationNode | undefined => {
  return allIntegrations.find(integration => integration.id === id);
};

export const getIntegrationsByType = (type: 'trigger' | 'action' | 'condition' | 'delay' | 'data_transform' | 'logic'): IntegrationNode[] => {
  return allIntegrations.filter(integration => integration.type === type);
};

export const getTriggerIntegrations = (): IntegrationNode[] => {
  return getIntegrationsByType('trigger');
};

export const getActionIntegrations = (): IntegrationNode[] => {
  return getIntegrationsByType('action');
};

export * from './emailIntegrations';
export * from './crmIntegrations';
export * from './webhookIntegrations';
export * from './aiIntegrations';
export * from './logicIntegrations';
export * from './dataIntegrations';