export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TenantKnowledgeBase {
  id: string;
  tenant_id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface WorkflowRecord extends Omit<import('./workflow').Workflow, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'executionCount' | 'lastExecuted'> {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}