import { IntegrationNode, IntegrationCategory } from '@/types/integrations';
import { gmailIntegration, sesIntegration, sendgridIntegration } from './emailIntegrations';
import { salesforceIntegration, hubspotIntegration, pipedriveIntegration } from './crmIntegrations';
import { webhookTrigger, httpRequestAction, slackIntegration } from './webhookIntegrations';

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
];

export const integrationsByCategory: Record<IntegrationCategory, IntegrationNode[]> = {
  communication: [gmailIntegration, sesIntegration, sendgridIntegration, slackIntegration],
  crm: [salesforceIntegration, hubspotIntegration, pipedriveIntegration],
  webhook: [webhookTrigger, httpRequestAction],
  database: [],
  file_storage: [],
  ai: [],
  analytics: [],
  payment: []
};

export const getIntegrationById = (id: string): IntegrationNode | undefined => {
  return allIntegrations.find(integration => integration.id === id);
};

export const getIntegrationsByType = (type: 'trigger' | 'action'): IntegrationNode[] => {
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