export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  settings: any;
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

export interface WorkflowRecord {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  status: string | null;
  steps: any;
  execution_count: number | null;
  last_executed: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}