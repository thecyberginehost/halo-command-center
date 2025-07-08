import { IntegrationNode } from '@/types/integrations';
import { BarChart, TrendingUp, Activity } from 'lucide-react';

export const googleAnalyticsIntegration: IntegrationNode = {
  id: 'google_analytics',
  name: 'Google Analytics',
  description: 'Track and analyze website data',
  category: 'analytics',
  icon: BarChart,
  color: '#FF6F00',
  requiresAuth: true,
  authType: 'oauth',
  type: 'action',
  configSchema: {
    client_id: {
      type: 'text',
      label: 'Client ID',
      required: true
    },
    client_secret: {
      type: 'password',
      label: 'Client Secret',
      required: true
    },
    property_id: {
      type: 'text',
      label: 'Property ID',
      required: true
    }
  },
  fields: [
    {
      name: 'operation',
      label: 'Analytics Operation',
      type: 'select',
      required: true,
      options: [
        { label: 'Get Report', value: 'get_report' },
        { label: 'Track Event', value: 'track_event' },
        { label: 'Get Real-time Data', value: 'realtime' },
        { label: 'Get Audience Data', value: 'audience' }
      ]
    },
    {
      name: 'metrics',
      label: 'Metrics',
      type: 'text',
      required: false,
      placeholder: 'sessions,pageviews,users',
      helpText: 'Comma-separated metric names'
    },
    {
      name: 'dimensions',
      label: 'Dimensions',
      type: 'text',
      required: false,
      placeholder: 'country,deviceCategory',
      helpText: 'Comma-separated dimension names'
    },
    {
      name: 'date_range',
      label: 'Date Range',
      type: 'select',
      required: false,
      options: [
        { label: 'Last 7 days', value: '7daysAgo' },
        { label: 'Last 30 days', value: '30daysAgo' },
        { label: 'Last 90 days', value: '90daysAgo' },
        { label: 'This year', value: 'thisYear' }
      ]
    }
  ],
  endpoints: [
    {
      id: 'execute',
      name: 'Execute Analytics Operation',
      description: 'Execute Google Analytics operation',
      method: 'POST',
      path: '/googleanalytics/execute',
      parameters: {
        operation: {
          type: 'text',
          label: 'Operation',
          required: true
        },
        property_id: {
          type: 'text',
          label: 'Property ID',
          required: true
        }
      }
    }
  ]
};

export const mixpanelIntegration: IntegrationNode = {
  id: 'mixpanel',
  name: 'Mixpanel',
  description: 'Track user events and analyze behavior',
  category: 'analytics',
  icon: TrendingUp,
  color: '#7856FF',
  requiresAuth: true,
  authType: 'bearer',
  type: 'action',
  configSchema: {
    project_token: {
      type: 'password',
      label: 'Project Token',
      required: true
    },
    api_secret: {
      type: 'password',
      label: 'API Secret',
      required: true
    }
  },
  fields: [
    {
      name: 'operation',
      label: 'Mixpanel Operation',
      type: 'select',
      required: true,
      options: [
        { label: 'Track Event', value: 'track' },
        { label: 'Update User Profile', value: 'engage' },
        { label: 'Export Events', value: 'export' },
        { label: 'Get Insights', value: 'insights' }
      ]
    },
    {
      name: 'event_name',
      label: 'Event Name',
      type: 'text',
      required: false,
      placeholder: 'Button Clicked'
    },
    {
      name: 'user_id',
      label: 'User ID',
      type: 'text',
      required: false,
      placeholder: 'user123'
    },
    {
      name: 'properties',
      label: 'Event Properties',
      type: 'textarea',
      required: false,
      placeholder: '{"button": "signup", "page": "home"}',
      helpText: 'JSON object with event properties'
    },
    {
      name: 'user_properties',
      label: 'User Properties',
      type: 'textarea',
      required: false,
      placeholder: '{"$name": "John Doe", "$email": "john@example.com"}',
      helpText: 'JSON object with user properties'
    }
  ],
  endpoints: [
    {
      id: 'execute',
      name: 'Execute Mixpanel Operation',
      description: 'Execute Mixpanel operation',
      method: 'POST',
      path: '/mixpanel/execute',
      parameters: {
        operation: {
          type: 'text',
          label: 'Operation',
          required: true
        },
        event_data: {
          type: 'textarea',
          label: 'Event Data',
          required: false
        }
      }
    }
  ]
};

export const segmentIntegration: IntegrationNode = {
  id: 'segment',
  name: 'Segment',
  description: 'Customer data platform for analytics',
  category: 'analytics',
  icon: Activity,
  color: '#52BD94',
  requiresAuth: true,
  authType: 'bearer',
  type: 'action',
  configSchema: {
    write_key: {
      type: 'password',
      label: 'Write Key',
      required: true
    }
  },
  fields: [
    {
      name: 'operation',
      label: 'Segment Operation',
      type: 'select',
      required: true,
      options: [
        { label: 'Track Event', value: 'track' },
        { label: 'Identify User', value: 'identify' },
        { label: 'Group User', value: 'group' },
        { label: 'Page View', value: 'page' },
        { label: 'Screen View', value: 'screen' }
      ]
    },
    {
      name: 'user_id',
      label: 'User ID',
      type: 'text',
      required: true,
      placeholder: 'user123'
    },
    {
      name: 'event_name',
      label: 'Event Name',
      type: 'text',
      required: false,
      placeholder: 'Product Purchased'
    },
    {
      name: 'properties',
      label: 'Properties',
      type: 'textarea',
      required: false,
      placeholder: '{"product": "Pro Plan", "revenue": 99.99}',
      helpText: 'JSON object with event/user properties'
    },
    {
      name: 'traits',
      label: 'User Traits',
      type: 'textarea',
      required: false,
      placeholder: '{"name": "John Doe", "email": "john@example.com"}',
      helpText: 'JSON object with user traits'
    }
  ],
  endpoints: [
    {
      id: 'execute',
      name: 'Execute Segment Operation',
      description: 'Execute Segment operation',
      method: 'POST',
      path: '/segment/execute',
      parameters: {
        operation: {
          type: 'text',
          label: 'Operation',
          required: true
        },
        user_id: {
          type: 'text',
          label: 'User ID',
          required: true
        }
      }
    }
  ]
};