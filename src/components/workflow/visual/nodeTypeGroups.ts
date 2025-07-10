import { Send, Database, Zap, GitBranch, Brain, BarChart, Code, ShoppingCart, Share2, Megaphone, Cloud, Briefcase } from 'lucide-react';
import { IntegrationCategory } from '@/types/integrations';

export interface NodeTypeGroup {
  id: string;
  label: string;
  icon: any;
  color: string;
  categories: IntegrationCategory[];
}

export const nodeTypeGroups: NodeTypeGroup[] = [
  { id: 'triggers', label: 'Triggers', icon: Zap, color: '#10B981', categories: ['triggers'] },
  { id: 'communication', label: 'Communication', icon: Send, color: '#3B82F6', categories: ['communication'] },
  { id: 'crm', label: 'CRM', icon: Briefcase, color: '#8B5CF6', categories: ['crm'] },
  { id: 'ecommerce', label: 'E-commerce', icon: ShoppingCart, color: '#F59E0B', categories: ['ecommerce'] },
  { id: 'social', label: 'Social Media', icon: Share2, color: '#EC4899', categories: ['social_media'] },
  { id: 'marketing', label: 'Marketing', icon: Megaphone, color: '#06B6D4', categories: ['marketing'] },
  { id: 'cloud', label: 'Cloud', icon: Cloud, color: '#64748B', categories: ['cloud'] },
  { id: 'business', label: 'Business', icon: Briefcase, color: '#059669', categories: ['business'] },
  { id: 'data', label: 'Data', icon: Database, color: '#7C3AED', categories: ['database', 'data_transform'] },
  { id: 'ai', label: 'AI', icon: Brain, color: '#DC2626', categories: ['ai'] },
  { id: 'analytics', label: 'Analytics', icon: BarChart, color: '#EA580C', categories: ['analytics'] },
  { id: 'dev', label: 'Developer', icon: Code, color: '#1F2937', categories: ['developer_tools'] },
  { id: 'productivity', label: 'Productivity', icon: Briefcase, color: '#0F766E', categories: ['productivity'] },
  { id: 'storage', label: 'Storage', icon: Database, color: '#9333EA', categories: ['file_storage'] },
  { id: 'payments', label: 'Payments', icon: Send, color: '#BE123C', categories: ['payment'] },
  { id: 'webhooks', label: 'Webhooks', icon: GitBranch, color: '#B45309', categories: ['webhook'] },
  { id: 'logic', label: 'Logic', icon: GitBranch, color: '#92400E', categories: ['logic', 'flow_control'] }
];