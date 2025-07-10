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
import { 
  postgresqlCreateRecord, 
  postgresqlReadRecords, 
  postgresqlUpdateRecord, 
  postgresqlDeleteRecord, 
  postgresqlExecuteQuery,
  mysqlCreateRecord, 
  mysqlReadRecords, 
  mysqlUpdateRecord, 
  mysqlDeleteRecord, 
  mysqlExecuteQuery,
  mongodbCreateDocument, 
  mongodbFindDocuments, 
  mongodbUpdateDocument, 
  mongodbDeleteDocument,
  mongodbAggregate,
  redisIntegration 
} from './databaseIntegrations';
import { 
  googleDriveUploadFile, 
  googleDriveDownloadFile, 
  googleDriveListFiles, 
  googleDriveDeleteFile, 
  googleDriveCreateFolder, 
  googleDriveShareFile,
  awsS3UploadObject, 
  awsS3DownloadObject, 
  awsS3ListObjects, 
  awsS3DeleteObject, 
  awsS3GeneratePresignedUrl,
  dropboxIntegration 
} from './fileStorageIntegrations';
import { 
  googleSheetsReadRow, 
  googleSheetsWriteRow, 
  googleSheetsAppendRow, 
  googleSheetsCreateSheet, 
  googleSheetsClearRange,
  googleCalendarCreateEvent, 
  googleCalendarListEvents,
  notionCreatePage, 
  notionUpdatePage, 
  notionCreateDatabaseEntry, 
  notionQueryDatabase,
  airtableCreateRecord, 
  airtableGetRecords, 
  airtableUpdateRecord,
  googleSheetsIntegration, 
  googleCalendarIntegration, 
  notionIntegration, 
  airtableIntegration 
} from './productivityIntegrations';
import { githubIntegration, jiraIntegration, trelloIntegration, asanaIntegration } from './developerIntegrations';
import { googleAnalyticsIntegration, mixpanelIntegration, segmentIntegration } from './analyticsIntegrations';
import { stripeIntegration, paypalIntegration } from './paymentIntegrations';
import { routerIntegration, iteratorIntegration, aggregatorIntegration } from './flowControlIntegrations';
import * as EcommerceIntegrations from './ecommerceIntegrations';
import * as SocialMediaIntegrations from './socialMediaIntegrations';
import * as MarketingIntegrations from './marketingIntegrations';
import * as CloudIntegrations from './cloudIntegrations';
import * as BusinessIntegrations from './businessIntegrations';

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
  postgresqlCreateRecord, postgresqlReadRecords, postgresqlUpdateRecord, postgresqlDeleteRecord, postgresqlExecuteQuery,
  mysqlCreateRecord, mysqlReadRecords, mysqlUpdateRecord, mysqlDeleteRecord, mysqlExecuteQuery,
  mongodbCreateDocument, mongodbFindDocuments, mongodbUpdateDocument, mongodbDeleteDocument, mongodbAggregate, redisIntegration,
  
  // File Storage
  googleDriveUploadFile, googleDriveDownloadFile, googleDriveListFiles, googleDriveDeleteFile, googleDriveCreateFolder, googleDriveShareFile,
  awsS3UploadObject, awsS3DownloadObject, awsS3ListObjects, awsS3DeleteObject, awsS3GeneratePresignedUrl, dropboxIntegration,
  
  // Productivity Tools
  googleSheetsReadRow, googleSheetsWriteRow, googleSheetsAppendRow, googleSheetsCreateSheet, googleSheetsClearRange,
  googleCalendarCreateEvent, googleCalendarListEvents,
  notionCreatePage, notionUpdatePage, notionCreateDatabaseEntry, notionQueryDatabase,
  airtableCreateRecord, airtableGetRecords, airtableUpdateRecord,
  
  // Developer Tools
  githubIntegration, jiraIntegration, trelloIntegration, asanaIntegration,
  
  // Analytics
  googleAnalyticsIntegration, mixpanelIntegration, segmentIntegration,
  
  // Payment
  stripeIntegration, paypalIntegration,
  
  // Flow Control
  routerIntegration, iteratorIntegration, aggregatorIntegration,
  
  // E-commerce
  ...Object.values(EcommerceIntegrations),
  
  // Social Media
  ...Object.values(SocialMediaIntegrations),
  
  // Marketing
  ...Object.values(MarketingIntegrations),
  
  // Cloud Services
  ...Object.values(CloudIntegrations),
  
  // Business Applications
  ...Object.values(BusinessIntegrations),
];

export const integrationsByCategory: Record<IntegrationCategory, IntegrationNode[]> = {
  communication: [gmailSendEmail, gmailSearchEmails, gmailDeleteEmail, gmailArchiveEmail, gmailReplyEmail, sesIntegration, sendgridIntegration, slackIntegration],
  crm: [salesforceCreateLead, salesforceCreateContact, salesforceUpdateContact, salesforceSearchContacts, salesforceCreateOpportunity, hubspotCreateContact, hubspotUpdateContact, hubspotCreateDeal, pipedriveCreatePerson, pipedriveCreateDeal, pipedriveUpdateDeal],
  webhook: [webhookTrigger, httpRequestAction, routerIntegration, iteratorIntegration, aggregatorIntegration],
  database: [
    postgresqlCreateRecord, postgresqlReadRecords, postgresqlUpdateRecord, postgresqlDeleteRecord, postgresqlExecuteQuery,
    mysqlCreateRecord, mysqlReadRecords, mysqlUpdateRecord, mysqlDeleteRecord, mysqlExecuteQuery,
    mongodbCreateDocument, mongodbFindDocuments, mongodbUpdateDocument, mongodbDeleteDocument, mongodbAggregate, redisIntegration
  ],
  file_storage: [
    googleDriveUploadFile, googleDriveDownloadFile, googleDriveListFiles, googleDriveDeleteFile, googleDriveCreateFolder, googleDriveShareFile,
    awsS3UploadObject, awsS3DownloadObject, awsS3ListObjects, awsS3DeleteObject, awsS3GeneratePresignedUrl, dropboxIntegration
  ],
  ai: [openaiAgentIntegration, claudeAgentIntegration, openaiLLMIntegration, claudeLLMIntegration, aiToolIntegration],
  analytics: [googleAnalyticsIntegration, mixpanelIntegration, segmentIntegration],
  payment: [stripeIntegration, paypalIntegration],
  productivity: [
    googleSheetsReadRow, googleSheetsWriteRow, googleSheetsAppendRow, googleSheetsCreateSheet, googleSheetsClearRange,
    googleCalendarCreateEvent, googleCalendarListEvents,
    notionCreatePage, notionUpdatePage, notionCreateDatabaseEntry, notionQueryDatabase,
    airtableCreateRecord, airtableGetRecords, airtableUpdateRecord
  ],
  developer_tools: [githubIntegration, jiraIntegration, trelloIntegration, asanaIntegration],
  triggers: [scheduleTrigger, emailTrigger, formTrigger, fileUploadTrigger, gmailNewEmailTrigger],
  logic: [conditionIntegration, loopIntegration, errorHandlerIntegration],
  data_transform: [dataTransformIntegration, dataValidationIntegration, jsonProcessorIntegration, calculatorIntegration],
  flow_control: [routerIntegration, iteratorIntegration, aggregatorIntegration],
  masp_tools: [dataStorageIntegration], // MASP-specific tools for service providers
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