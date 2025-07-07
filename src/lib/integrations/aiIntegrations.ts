import { IntegrationNode } from '@/types/integrations';
import { Brain, Bot, MessageSquare, Zap, Cpu, Sparkles } from 'lucide-react';

// AI Agent Integrations
export const openaiAgentIntegration: IntegrationNode = {
  id: 'openai-agent',
  name: 'OpenAI Agent',
  description: 'AI agent powered by OpenAI models with custom instructions and memory',
  category: 'ai',
  icon: Bot,
  color: '#10a37f',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  configSchema: {
    instructions: {
      type: 'textarea',
      label: 'Agent Instructions',
      placeholder: 'You are a helpful assistant that...',
      required: true
    },
    model: {
      type: 'select',
      label: 'Model',
      required: true,
      options: [
        { label: 'GPT-4.1-2025-04-14', value: 'gpt-4.1-2025-04-14' },
        { label: 'GPT-4o', value: 'gpt-4o' },
        { label: 'GPT-4o Mini', value: 'gpt-4o-mini' }
      ]
    },
    temperature: {
      type: 'number',
      label: 'Temperature',
      placeholder: '0.7',
      required: false
    },
    maxTokens: {
      type: 'number',
      label: 'Max Tokens',
      placeholder: '1000',
      required: false
    }
  },
  fields: [
    {
      name: 'instructions',
      label: 'Agent Instructions',
      type: 'textarea',
      required: true,
      placeholder: 'You are a helpful assistant that...',
      helpText: 'Define the agent\'s role, personality, and behavior'
    },
    {
      name: 'model',
      label: 'OpenAI Model',
      type: 'select',
      required: true,
      options: [
        { label: 'GPT-4.1-2025-04-14 (Recommended)', value: 'gpt-4.1-2025-04-14' },
        { label: 'GPT-4o', value: 'gpt-4o' },
        { label: 'GPT-4o Mini', value: 'gpt-4o-mini' }
      ],
      defaultValue: 'gpt-4.1-2025-04-14'
    },
    {
      name: 'temperature',
      label: 'Temperature',
      type: 'number',
      required: false,
      placeholder: '0.7',
      defaultValue: 0.7,
      helpText: 'Controls randomness (0.0 = deterministic, 1.0 = very random)'
    },
    {
      name: 'maxTokens',
      label: 'Max Tokens',
      type: 'number',
      required: false,
      placeholder: '1000',
      defaultValue: 1000,
      helpText: 'Maximum number of tokens in the response'
    },
    {
      name: 'credential',
      label: 'OpenAI Credential',
      type: 'select',
      required: true,
      options: [
        { label: 'Default OpenAI Key', value: 'default-openai' },
        { label: 'Production OpenAI Key', value: 'prod-openai' }
      ],
      helpText: 'Select which API credential to use'
    }
  ],
  endpoints: [
    {
      id: 'chat',
      name: 'Chat Completion',
      description: 'Generate responses using the AI agent',
      method: 'POST',
      path: '/chat/completions',
      parameters: {}
    }
  ]
};

export const claudeAgentIntegration: IntegrationNode = {
  id: 'claude-agent',
  name: 'Claude Agent',
  description: 'AI agent powered by Anthropic Claude with advanced reasoning',
  category: 'ai',
  icon: Brain,
  color: '#cc785c',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  configSchema: {
    instructions: {
      type: 'textarea',
      label: 'Agent Instructions',
      placeholder: 'You are a helpful assistant that...',
      required: true
    },
    model: {
      type: 'select',
      label: 'Model',
      required: true,
      options: [
        { label: 'Claude Sonnet 4', value: 'claude-sonnet-4-20250514' },
        { label: 'Claude Opus 4', value: 'claude-opus-4-20250514' },
        { label: 'Claude Haiku 3.5', value: 'claude-3-5-haiku-20241022' }
      ]
    }
  },
  fields: [
    {
      name: 'instructions',
      label: 'Agent Instructions',
      type: 'textarea',
      required: true,
      placeholder: 'You are a helpful assistant that...',
      helpText: 'Define the agent\'s role, personality, and behavior'
    },
    {
      name: 'model',
      label: 'Claude Model',
      type: 'select',
      required: true,
      options: [
        { label: 'Claude Sonnet 4 (Recommended)', value: 'claude-sonnet-4-20250514' },
        { label: 'Claude Opus 4 (Most Capable)', value: 'claude-opus-4-20250514' },
        { label: 'Claude Haiku 3.5 (Fastest)', value: 'claude-3-5-haiku-20241022' }
      ],
      defaultValue: 'claude-sonnet-4-20250514'
    },
    {
      name: 'maxTokens',
      label: 'Max Tokens',
      type: 'number',
      required: false,
      placeholder: '1000',
      defaultValue: 1000,
      helpText: 'Maximum number of tokens in the response'
    },
    {
      name: 'credential',
      label: 'Anthropic Credential',
      type: 'select',
      required: true,
      options: [
        { label: 'Default Anthropic Key', value: 'default-anthropic' },
        { label: 'Production Anthropic Key', value: 'prod-anthropic' }
      ],
      helpText: 'Select which API credential to use'
    }
  ],
  endpoints: [
    {
      id: 'messages',
      name: 'Create Message',
      description: 'Generate responses using Claude',
      method: 'POST',
      path: '/messages',
      parameters: {}
    }
  ]
};

// LLM Integrations
export const openaiLLMIntegration: IntegrationNode = {
  id: 'openai-llm',
  name: 'OpenAI LLM',
  description: 'Direct access to OpenAI language models for text generation',
  category: 'ai',
  icon: MessageSquare,
  color: '#10a37f',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  configSchema: {
    prompt: {
      type: 'textarea',
      label: 'Prompt',
      placeholder: 'Enter your prompt here...',
      required: true
    },
    model: {
      type: 'select',
      label: 'Model',
      required: true,
      options: [
        { label: 'GPT-4.1-2025-04-14', value: 'gpt-4.1-2025-04-14' },
        { label: 'GPT-4o', value: 'gpt-4o' },
        { label: 'GPT-4o Mini', value: 'gpt-4o-mini' }
      ]
    }
  },
  fields: [
    {
      name: 'prompt',
      label: 'Prompt',
      type: 'textarea',
      required: true,
      placeholder: 'Enter your prompt here...',
      helpText: 'The text prompt to send to the model'
    },
    {
      name: 'model',
      label: 'OpenAI Model',
      type: 'select',
      required: true,
      options: [
        { label: 'GPT-4.1-2025-04-14 (Recommended)', value: 'gpt-4.1-2025-04-14' },
        { label: 'GPT-4o', value: 'gpt-4o' },
        { label: 'GPT-4o Mini', value: 'gpt-4o-mini' }
      ],
      defaultValue: 'gpt-4.1-2025-04-14'
    },
    {
      name: 'temperature',
      label: 'Temperature',
      type: 'number',
      required: false,
      placeholder: '0.7',
      defaultValue: 0.7,
      helpText: 'Controls randomness (0.0 = deterministic, 1.0 = very random)'
    },
    {
      name: 'maxTokens',
      label: 'Max Tokens',
      type: 'number',
      required: false,
      placeholder: '1000',
      defaultValue: 1000
    },
    {
      name: 'credential',
      label: 'OpenAI Credential',
      type: 'select',
      required: true,
      options: [
        { label: 'Default OpenAI Key', value: 'default-openai' },
        { label: 'Production OpenAI Key', value: 'prod-openai' }
      ],
      helpText: 'Select which API credential to use'
    }
  ],
  endpoints: [
    {
      id: 'completions',
      name: 'Text Completion',
      description: 'Generate text completions',
      method: 'POST',
      path: '/chat/completions',
      parameters: {}
    }
  ]
};

export const claudeLLMIntegration: IntegrationNode = {
  id: 'claude-llm',
  name: 'Claude LLM',
  description: 'Direct access to Anthropic Claude models for text generation',
  category: 'ai',
  icon: Brain,
  color: '#cc785c',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  configSchema: {
    prompt: {
      type: 'textarea',
      label: 'Prompt',
      placeholder: 'Enter your prompt here...',
      required: true
    },
    model: {
      type: 'select',
      label: 'Model',
      required: true,
      options: [
        { label: 'Claude Sonnet 4', value: 'claude-sonnet-4-20250514' },
        { label: 'Claude Opus 4', value: 'claude-opus-4-20250514' },
        { label: 'Claude Haiku 3.5', value: 'claude-3-5-haiku-20241022' }
      ]
    }
  },
  fields: [
    {
      name: 'prompt',
      label: 'Prompt',
      type: 'textarea',
      required: true,
      placeholder: 'Enter your prompt here...',
      helpText: 'The text prompt to send to Claude'
    },
    {
      name: 'model',
      label: 'Claude Model',
      type: 'select',
      required: true,
      options: [
        { label: 'Claude Sonnet 4 (Recommended)', value: 'claude-sonnet-4-20250514' },
        { label: 'Claude Opus 4 (Most Capable)', value: 'claude-opus-4-20250514' },
        { label: 'Claude Haiku 3.5 (Fastest)', value: 'claude-3-5-haiku-20241022' }
      ],
      defaultValue: 'claude-sonnet-4-20250514'
    },
    {
      name: 'maxTokens',
      label: 'Max Tokens',
      type: 'number',
      required: false,
      placeholder: '1000',
      defaultValue: 1000
    },
    {
      name: 'credential',
      label: 'Anthropic Credential',
      type: 'select',
      required: true,
      options: [
        { label: 'Default Anthropic Key', value: 'default-anthropic' },
        { label: 'Production Anthropic Key', value: 'prod-anthropic' }
      ],
      helpText: 'Select which API credential to use'
    }
  ],
  endpoints: [
    {
      id: 'messages',
      name: 'Create Message',
      description: 'Generate text with Claude',
      method: 'POST',
      path: '/messages',
      parameters: {}
    }
  ]
};

// AI Tool/Function Calling Integration
export const aiToolIntegration: IntegrationNode = {
  id: 'ai-tool',
  name: 'AI Tool',
  description: 'AI that can call functions and use tools to perform actions',
  category: 'ai',
  icon: Zap,
  color: '#8b5cf6',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  configSchema: {
    instructions: {
      type: 'textarea',
      label: 'Tool Instructions',
      placeholder: 'You are an AI that can use tools to help users...',
      required: true
    },
    availableTools: {
      type: 'textarea',
      label: 'Available Tools (JSON)',
      placeholder: '[]',
      required: false
    }
  },
  fields: [
    {
      name: 'instructions',
      label: 'Tool Instructions',
      type: 'textarea',
      required: true,
      placeholder: 'You are an AI that can use tools to help users...',
      helpText: 'Instructions for when and how to use tools'
    },
    {
      name: 'availableTools',
      label: 'Available Tools (JSON)',
      type: 'textarea',
      required: false,
      placeholder: '[]',
      helpText: 'JSON array of tool definitions the AI can use'
    },
    {
      name: 'model',
      label: 'AI Model',
      type: 'select',
      required: true,
      options: [
        { label: 'GPT-4.1-2025-04-14', value: 'gpt-4.1-2025-04-14' },
        { label: 'Claude Sonnet 4', value: 'claude-sonnet-4-20250514' }
      ],
      defaultValue: 'gpt-4.1-2025-04-14'
    },
    {
      name: 'credential',
      label: 'AI Credential',
      type: 'select',
      required: true,
      options: [
        { label: 'Default OpenAI Key', value: 'default-openai' },
        { label: 'Default Anthropic Key', value: 'default-anthropic' }
      ],
      helpText: 'Select which API credential to use'
    }
  ],
  endpoints: [
    {
      id: 'execute',
      name: 'Execute with Tools',
      description: 'Execute AI with tool calling capabilities',
      method: 'POST',
      path: '/execute',
      parameters: {}
    }
  ]
};