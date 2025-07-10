import { IntegrationNode } from '@/types/integrations';
import { Mail, Users, BarChart, Target, Megaphone, Calendar, PieChart, TrendingUp } from 'lucide-react';

// Email Marketing Platforms
export const mailchimpCreateCampaign: IntegrationNode = {
  id: 'mailchimp_create_campaign',
  name: 'Create Campaign',
  description: 'Create a new email campaign in Mailchimp',
  category: 'communication',
  icon: Mail,
  color: '#FFE01B',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'type', label: 'Campaign Type', type: 'select', required: true, options: [
      { label: 'Regular', value: 'regular' },
      { label: 'Plain Text', value: 'plaintext' },
      { label: 'A/B Test', value: 'variate' }
    ]},
    { name: 'list_id', label: 'Audience ID', type: 'text', required: true },
    { name: 'subject_line', label: 'Subject Line', type: 'text', required: true },
    { name: 'from_name', label: 'From Name', type: 'text', required: true },
    { name: 'reply_to', label: 'Reply To Email', type: 'text', required: true }
  ],
  endpoints: [],
  configSchema: {
    api_key: { type: 'password', label: 'API Key', required: true, placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us1' }
  }
};

export const mailchimpAddSubscriber: IntegrationNode = {
  id: 'mailchimp_add_subscriber',
  name: 'Add Subscriber',
  description: 'Add a new subscriber to a Mailchimp audience',
  category: 'communication',
  icon: Users,
  color: '#FFE01B',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'list_id', label: 'Audience ID', type: 'text', required: true },
    { name: 'email_address', label: 'Email Address', type: 'text', required: true },
    { name: 'status', label: 'Status', type: 'select', required: true, options: [
      { label: 'Subscribed', value: 'subscribed' },
      { label: 'Pending', value: 'pending' }
    ]},
    { name: 'first_name', label: 'First Name', type: 'text', required: false },
    { name: 'last_name', label: 'Last Name', type: 'text', required: false }
  ],
  endpoints: [],
  configSchema: {
    api_key: { type: 'password', label: 'API Key', required: true }
  }
};

export const mailchimpNewSubscriber: IntegrationNode = {
  id: 'mailchimp_new_subscriber',
  name: 'New Subscriber',
  description: 'Triggered when someone subscribes to audience',
  category: 'triggers',
  icon: Users,
  color: '#FFE01B',
  requiresAuth: true,
  authType: 'api_key',
  type: 'trigger',
  fields: [
    { name: 'list_id', label: 'Audience ID', type: 'text', required: true }
  ],
  endpoints: [],
  configSchema: {
    api_key: { type: 'password', label: 'API Key', required: true }
  }
};

// ConvertKit
export const convertkitAddSubscriber: IntegrationNode = {
  id: 'convertkit_add_subscriber',
  name: 'Add Subscriber',
  description: 'Add a subscriber to ConvertKit',
  category: 'communication',
  icon: Users,
  color: '#FB7BA2',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'email', label: 'Email Address', type: 'text', required: true },
    { name: 'first_name', label: 'First Name', type: 'text', required: false },
    { name: 'tags', label: 'Tags (comma separated)', type: 'text', required: false }
  ],
  endpoints: [],
  configSchema: {
    api_key: { type: 'password', label: 'API Key', required: true },
    api_secret: { type: 'password', label: 'API Secret', required: true }
  }
};

export const convertkitAddToSequence: IntegrationNode = {
  id: 'convertkit_add_to_sequence',
  name: 'Add to Sequence',
  description: 'Add subscriber to an email sequence',
  category: 'communication',
  icon: Mail,
  color: '#FB7BA2',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'email', label: 'Email Address', type: 'text', required: true },
    { name: 'sequence_id', label: 'Sequence ID', type: 'text', required: true }
  ],
  endpoints: [],
  configSchema: {
    api_key: { type: 'password', label: 'API Key', required: true }
  }
};

// ActiveCampaign
export const activecampaignCreateContact: IntegrationNode = {
  id: 'activecampaign_create_contact',
  name: 'Create Contact',
  description: 'Create a new contact in ActiveCampaign',
  category: 'crm',
  icon: Users,
  color: '#356AE6',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'email', label: 'Email Address', type: 'text', required: true },
    { name: 'firstName', label: 'First Name', type: 'text', required: false },
    { name: 'lastName', label: 'Last Name', type: 'text', required: false },
    { name: 'phone', label: 'Phone Number', type: 'text', required: false }
  ],
  endpoints: [],
  configSchema: {
    api_url: { type: 'text', label: 'API URL', required: true, placeholder: 'https://youraccountname.api-us1.com' },
    api_key: { type: 'password', label: 'API Key', required: true }
  }
};

export const activecampaignAddToAutomation: IntegrationNode = {
  id: 'activecampaign_add_to_automation',
  name: 'Add to Automation',
  description: 'Add contact to an automation sequence',
  category: 'communication',
  icon: Target,
  color: '#356AE6',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'contact_id', label: 'Contact ID', type: 'text', required: true },
    { name: 'automation_id', label: 'Automation ID', type: 'text', required: true }
  ],
  endpoints: [],
  configSchema: {
    api_url: { type: 'text', label: 'API URL', required: true },
    api_key: { type: 'password', label: 'API Key', required: true }
  }
};

// GetResponse
export const getresponseAddContact: IntegrationNode = {
  id: 'getresponse_add_contact',
  name: 'Add Contact',
  description: 'Add a contact to GetResponse campaign',
  category: 'communication',
  icon: Users,
  color: '#00D4D8',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'email', label: 'Email Address', type: 'text', required: true },
    { name: 'campaign_id', label: 'Campaign ID', type: 'text', required: true },
    { name: 'name', label: 'Name', type: 'text', required: false }
  ],
  endpoints: [],
  configSchema: {
    api_key: { type: 'password', label: 'API Key', required: true }
  }
};

// Campaign Monitor
export const campaignmonitorAddSubscriber: IntegrationNode = {
  id: 'campaignmonitor_add_subscriber',
  name: 'Add Subscriber',
  description: 'Add subscriber to Campaign Monitor list',
  category: 'communication',
  icon: Users,
  color: '#509E2F',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'list_id', label: 'List ID', type: 'text', required: true },
    { name: 'email', label: 'Email Address', type: 'text', required: true },
    { name: 'name', label: 'Name', type: 'text', required: false }
  ],
  endpoints: [],
  configSchema: {
    api_key: { type: 'password', label: 'API Key', required: true }
  }
};

// Marketing Automation
export const leadScoringUpdate: IntegrationNode = {
  id: 'lead_scoring_update',
  name: 'Update Lead Score',
  description: 'Update lead scoring based on behavior',
  category: 'logic',
  icon: TrendingUp,
  color: '#8B5CF6',
  requiresAuth: false,
  type: 'action',
  fields: [
    { name: 'contact_id', label: 'Contact ID', type: 'text', required: true },
    { name: 'score_change', label: 'Score Change', type: 'number', required: true },
    { name: 'activity_type', label: 'Activity Type', type: 'select', required: true, options: [
      { label: 'Email Open', value: 'email_open' },
      { label: 'Email Click', value: 'email_click' },
      { label: 'Website Visit', value: 'website_visit' },
      { label: 'Form Submit', value: 'form_submit' },
      { label: 'Download', value: 'download' }
    ]}
  ],
  endpoints: [],
  configSchema: {}
};

export const segmentationTrigger: IntegrationNode = {
  id: 'segmentation_trigger',
  name: 'Segmentation Update',
  description: 'Triggered when contact meets segmentation criteria',
  category: 'triggers',
  icon: Target,
  color: '#F59E0B',
  requiresAuth: false,
  type: 'trigger',
  fields: [
    { name: 'segment_id', label: 'Segment ID', type: 'text', required: true },
    { name: 'criteria', label: 'Criteria', type: 'textarea', required: true }
  ],
  endpoints: [],
  configSchema: {}
};

// A/B Testing
export const abtestCreate: IntegrationNode = {
  id: 'abtest_create',
  name: 'Create A/B Test',
  description: 'Create a new A/B test campaign',
  category: 'analytics',
  icon: PieChart,
  color: '#EC4899',
  requiresAuth: false,
  type: 'action',
  fields: [
    { name: 'test_name', label: 'Test Name', type: 'text', required: true },
    { name: 'variant_a', label: 'Variant A', type: 'textarea', required: true },
    { name: 'variant_b', label: 'Variant B', type: 'textarea', required: true },
    { name: 'traffic_split', label: 'Traffic Split %', type: 'number', required: true }
  ],
  endpoints: [],
  configSchema: {}
};

// Social Media Scheduling
export const socialMediaSchedule: IntegrationNode = {
  id: 'social_media_schedule',
  name: 'Schedule Post',
  description: 'Schedule social media posts across platforms',
  category: 'communication',
  icon: Calendar,
  color: '#10B981',
  requiresAuth: false,
  type: 'action',
  fields: [
    { name: 'content', label: 'Post Content', type: 'textarea', required: true },
    { name: 'platforms', label: 'Platforms', type: 'select', required: true, options: [
      { label: 'Facebook', value: 'facebook' },
      { label: 'Twitter', value: 'twitter' },
      { label: 'LinkedIn', value: 'linkedin' },
      { label: 'Instagram', value: 'instagram' }
    ]},
    { name: 'schedule_time', label: 'Schedule Time', type: 'text', required: true }
  ],
  endpoints: [],
  configSchema: {}
};

// Customer Journey
export const customerJourneyStage: IntegrationNode = {
  id: 'customer_journey_stage',
  name: 'Update Journey Stage',
  description: 'Move customer to next journey stage',
  category: 'logic',
  icon: Target,
  color: '#6366F1',
  requiresAuth: false,
  type: 'action',
  fields: [
    { name: 'customer_id', label: 'Customer ID', type: 'text', required: true },
    { name: 'current_stage', label: 'Current Stage', type: 'text', required: true },
    { name: 'next_stage', label: 'Next Stage', type: 'text', required: true }
  ],
  endpoints: [],
  configSchema: {}
};

// Marketing Analytics
export const conversionTracking: IntegrationNode = {
  id: 'conversion_tracking',
  name: 'Track Conversion',
  description: 'Track marketing conversion events',
  category: 'analytics',
  icon: BarChart,
  color: '#059669',
  requiresAuth: false,
  type: 'action',
  fields: [
    { name: 'event_name', label: 'Event Name', type: 'text', required: true },
    { name: 'conversion_value', label: 'Conversion Value', type: 'number', required: false },
    { name: 'user_id', label: 'User ID', type: 'text', required: true },
    { name: 'campaign_id', label: 'Campaign ID', type: 'text', required: false }
  ],
  endpoints: [],
  configSchema: {}
};

export const roiCalculation: IntegrationNode = {
  id: 'roi_calculation',
  name: 'Calculate ROI',
  description: 'Calculate marketing campaign ROI',
  category: 'analytics',
  icon: TrendingUp,
  color: '#DC2626',
  requiresAuth: false,
  type: 'action',
  fields: [
    { name: 'campaign_id', label: 'Campaign ID', type: 'text', required: true },
    { name: 'campaign_cost', label: 'Campaign Cost', type: 'number', required: true },
    { name: 'revenue_generated', label: 'Revenue Generated', type: 'number', required: true }
  ],
  endpoints: [],
  configSchema: {}
};

// Personalization
export const contentPersonalization: IntegrationNode = {
  id: 'content_personalization',
  name: 'Personalize Content',
  description: 'Personalize content based on user data',
  category: 'logic',
  icon: Target,
  color: '#7C3AED',
  requiresAuth: false,
  type: 'action',
  fields: [
    { name: 'user_id', label: 'User ID', type: 'text', required: true },
    { name: 'content_template', label: 'Content Template', type: 'textarea', required: true },
    { name: 'personalization_data', label: 'Personalization Data', type: 'textarea', required: true }
  ],
  endpoints: [],
  configSchema: {}
};