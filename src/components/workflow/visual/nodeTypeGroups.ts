import { Send, Database, Zap, GitBranch, Brain, BarChart, Code } from 'lucide-react';
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
  { id: 'actions', label: 'Actions', icon: Send, color: '#3B82F6', categories: ['communication', 'crm', 'productivity', 'payment', 'file_storage'] },
  { id: 'data', label: 'Data', icon: Database, color: '#8B5CF6', categories: ['database'] },
  { id: 'flow', label: 'Flow', icon: GitBranch, color: '#F59E0B', categories: ['webhook'] },
  { id: 'ai', label: 'AI', icon: Brain, color: '#EC4899', categories: ['ai'] },
  { id: 'analytics', label: 'Stats', icon: BarChart, color: '#06B6D4', categories: ['analytics'] },
  { id: 'dev', label: 'Dev', icon: Code, color: '#64748B', categories: ['developer_tools'] }
];