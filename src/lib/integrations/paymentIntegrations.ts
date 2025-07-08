import { IntegrationNode } from '@/types/integrations';
import { CreditCard, DollarSign } from 'lucide-react';

export const stripeIntegration: IntegrationNode = {
  id: 'stripe',
  name: 'Stripe',
  description: 'Process payments with Stripe',
  category: 'payment',
  icon: CreditCard,
  color: '#635BFF',
  requiresAuth: true,
  authType: 'bearer',
  type: 'action',
  configSchema: {
    secret_key: {
      type: 'password',
      label: 'Secret Key',
      required: true
    },
    publishable_key: {
      type: 'text',
      label: 'Publishable Key',
      required: true
    }
  },
  fields: [
    {
      name: 'operation',
      label: 'Stripe Operation',
      type: 'select',
      required: true,
      options: [
        { label: 'Create Payment Intent', value: 'create_payment_intent' },
        { label: 'Capture Payment', value: 'capture_payment' },
        { label: 'Refund Payment', value: 'refund_payment' },
        { label: 'Create Customer', value: 'create_customer' },
        { label: 'Create Subscription', value: 'create_subscription' },
        { label: 'List Charges', value: 'list_charges' }
      ]
    },
    {
      name: 'amount',
      label: 'Amount (cents)',
      type: 'number',
      required: false,
      placeholder: '2000',
      helpText: 'Amount in smallest currency unit (e.g., cents)'
    },
    {
      name: 'currency',
      label: 'Currency',
      type: 'select',
      required: false,
      defaultValue: 'usd',
      options: [
        { label: 'USD', value: 'usd' },
        { label: 'EUR', value: 'eur' },
        { label: 'GBP', value: 'gbp' },
        { label: 'CAD', value: 'cad' },
        { label: 'AUD', value: 'aud' }
      ]
    },
    {
      name: 'customer_email',
      label: 'Customer Email',
      type: 'text',
      required: false,
      placeholder: 'customer@example.com'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      required: false,
      placeholder: 'Payment for order #123'
    },
    {
      name: 'metadata',
      label: 'Metadata',
      type: 'textarea',
      required: false,
      placeholder: '{"order_id": "123", "customer_id": "456"}',
      helpText: 'JSON object with additional data'
    }
  ],
  endpoints: [
    {
      id: 'execute',
      name: 'Execute Stripe Operation',
      description: 'Execute Stripe payment operation',
      method: 'POST',
      path: '/stripe/execute',
      parameters: {
        operation: {
          type: 'text',
          label: 'Operation',
          required: true
        },
        amount: {
          type: 'number',
          label: 'Amount',
          required: false
        },
        currency: {
          type: 'text',
          label: 'Currency',
          required: false
        }
      }
    }
  ]
};

export const paypalIntegration: IntegrationNode = {
  id: 'paypal',
  name: 'PayPal',
  description: 'Process payments with PayPal',
  category: 'payment',
  icon: DollarSign,
  color: '#003087',
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
    environment: {
      type: 'select',
      label: 'Environment',
      required: true,
      options: [
        { label: 'Sandbox', value: 'sandbox' },
        { label: 'Live', value: 'live' }
      ]
    }
  },
  fields: [
    {
      name: 'operation',
      label: 'PayPal Operation',
      type: 'select',
      required: true,
      options: [
        { label: 'Create Payment', value: 'create_payment' },
        { label: 'Execute Payment', value: 'execute_payment' },
        { label: 'Refund Payment', value: 'refund_payment' },
        { label: 'Get Payment Details', value: 'get_payment' }
      ]
    },
    {
      name: 'amount',
      label: 'Amount',
      type: 'number',
      required: false,
      placeholder: '20.00'
    },
    {
      name: 'currency',
      label: 'Currency',
      type: 'select',
      required: false,
      defaultValue: 'USD',
      options: [
        { label: 'USD', value: 'USD' },
        { label: 'EUR', value: 'EUR' },
        { label: 'GBP', value: 'GBP' },
        { label: 'CAD', value: 'CAD' },
        { label: 'AUD', value: 'AUD' }
      ]
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      required: false,
      placeholder: 'Payment for services'
    },
    {
      name: 'return_url',
      label: 'Return URL',
      type: 'text',
      required: false,
      placeholder: 'https://example.com/success'
    },
    {
      name: 'cancel_url',
      label: 'Cancel URL',
      type: 'text',
      required: false,
      placeholder: 'https://example.com/cancel'
    }
  ],
  endpoints: [
    {
      id: 'execute',
      name: 'Execute PayPal Operation',
      description: 'Execute PayPal payment operation',
      method: 'POST',
      path: '/paypal/execute',
      parameters: {
        operation: {
          type: 'text',
          label: 'Operation',
          required: true
        },
        amount: {
          type: 'number',
          label: 'Amount',
          required: false
        },
        currency: {
          type: 'text',
          label: 'Currency',
          required: false
        }
      }
    }
  ]
};