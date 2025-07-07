import { WorkflowRecord } from '@/types/tenant';
import { supabase } from '@/integrations/supabase/client';

export interface ExportedWorkflow {
  version: string;
  name: string;
  description: string | null;
  steps: any[];
  metadata: {
    exportedAt: string;
    exportedBy: string;
    originalId?: string;
  };
}

export class AutomationImportExportService {
  private static readonly EXPORT_VERSION = '1.0.0';

  static async exportWorkflow(workflow: WorkflowRecord): Promise<void> {
    const exportData: ExportedWorkflow = {
      version: this.EXPORT_VERSION,
      name: workflow.name,
      description: workflow.description,
      steps: workflow.steps || [],
      metadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: 'current-user',
        originalId: workflow.id
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workflow.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_automation.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async importWorkflow(
    file: File, 
    tenantId: string
  ): Promise<{ success: boolean; workflow?: WorkflowRecord; error?: string }> {
    try {
      const text = await file.text();
      const data: ExportedWorkflow = JSON.parse(text);

      // Validate structure
      if (!data.version || !data.name || !Array.isArray(data.steps)) {
        return { success: false, error: 'Invalid workflow file format' };
      }

      // Check for name conflicts and generate unique name if needed
      const uniqueName = await this.generateUniqueName(data.name, tenantId);

      // Create new workflow
      const { data: newWorkflow, error } = await supabase
        .from('workflows')
        .insert({
          name: uniqueName,
          description: data.description || `Imported from ${data.name}`,
          status: 'draft',
          tenant_id: tenantId,
          steps: data.steps
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: 'Failed to create workflow in database' };
      }

      return { success: true, workflow: newWorkflow };
    } catch (error) {
      return { success: false, error: 'Failed to parse workflow file' };
    }
  }

  private static async generateUniqueName(baseName: string, tenantId: string): Promise<string> {
    const { data: existingWorkflows } = await supabase
      .from('workflows')
      .select('name')
      .eq('tenant_id', tenantId)
      .like('name', `${baseName}%`);

    if (!existingWorkflows || existingWorkflows.length === 0) {
      return baseName;
    }

    const existingNames = existingWorkflows.map(w => w.name);
    let counter = 1;
    let newName = `${baseName} (Copy)`;

    while (existingNames.includes(newName)) {
      counter++;
      newName = `${baseName} (Copy ${counter})`;
    }

    return newName;
  }

  static validateImportFile(file: File): { valid: boolean; error?: string } {
    if (!file.name.endsWith('.json')) {
      return { valid: false, error: 'Please select a JSON file' };
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return { valid: false, error: 'File size too large (max 10MB)' };
    }

    return { valid: true };
  }
}