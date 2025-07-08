import { IntegrationNode, IntegrationCategory } from '@/types/integrations';
import { gmailIntegration, sesIntegration, sendgridIntegration } from './emailIntegrations';
import { salesforceIntegration, hubspotIntegration, pipedriveIntegration } from './crmIntegrations';
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

export const allIntegrations: IntegrationNode[] = [
  // Triggers
  webhookTrigger,
  
  // Email Actions
  gmailIntegration,
  sesIntegration,
  sendgridIntegration,
  
  // CRM Actions
  salesforceIntegration,
  hubspotIntegration,
  pipedriveIntegration,
  
  // Communication Actions
  slackIntegration,
  
  // Webhook Actions
  httpRequestAction,
  
  // AI Actions
  openaiAgentIntegration,
  claudeAgentIntegration,
  openaiLLMIntegration,
  claudeLLMIntegration,
  aiToolIntegration,
  
  // Logic Steps
  conditionIntegration,
  delayIntegration,
  loopIntegration,
  errorHandlerIntegration,
  
  // Data Processing Steps
  dataTransformIntegration,
  dataValidationIntegration,
  dataStorageIntegration,
  jsonProcessorIntegration,
  calculatorIntegration,
];

export const integrationsByCategory: Record<IntegrationCategory, IntegrationNode[]> = {
  communication: [gmailIntegration, sesIntegration, sendgridIntegration, slackIntegration],
  crm: [salesforceIntegration, hubspotIntegration, pipedriveIntegration],
  webhook: [webhookTrigger, httpRequestAction, conditionIntegration, delayIntegration, loopIntegration, errorHandlerIntegration],
  database: [dataTransformIntegration, dataValidationIntegration, dataStorageIntegration, jsonProcessorIntegration, calculatorIntegration],
  file_storage: [],
  ai: [openaiAgentIntegration, claudeAgentIntegration, openaiLLMIntegration, claudeLLMIntegration, aiToolIntegration],
  analytics: [],
  payment: []
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