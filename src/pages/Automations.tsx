import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';
import { AutomationImportExportService } from '@/services/automationImportExport';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WorkflowEditModal } from '@/components/WorkflowEditModal';
import { WorkflowDeleteDialog } from '@/components/WorkflowDeleteDialog';
import { WorkflowRecord } from '@/types/tenant';
import { AutomationCard } from '@/components/automations/AutomationCard';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';


const Automations = () => {
  usePageTitle('Automations');
  const { workflows, loading, error, refreshWorkflows } = useWorkflows();
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowRecord | null>(null);
  const [deletingWorkflow, setDeletingWorkflow] = useState<WorkflowRecord | null>(null);
  

  const handleCreateAutomation = async () => {
    if (!currentTenant) {
      toast({
        title: "Error",
        description: "No tenant selected",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('workflows')
        .insert({
          name: 'My Automation',
          description: '',
          status: 'draft',
          tenant_id: currentTenant.id,
          steps: []
        })
        .select()
        .single();

      if (error) throw error;

      navigate(`/automations/create/${data.id}`);
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast({
        title: "Error",
        description: "Failed to create automation",
        variant: "destructive"
      });
    }
  };

  const handleCardClick = (workflow: WorkflowRecord) => {
    navigate(`/automations/create/${workflow.id}`);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentTenant) return;

    const validation = AutomationImportExportService.validateImportFile(file);
    if (!validation.valid) {
      toast({
        title: "Invalid File",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await AutomationImportExportService.importWorkflow(file, currentTenant.id);
      
      if (result.success && result.workflow) {
        toast({
          title: "Import Successful",
          description: `"${result.workflow.name}" has been imported successfully.`
        });
        refreshWorkflows();
      } else {
        toast({
          title: "Import Failed",
          description: result.error || "Failed to import automation",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "An unexpected error occurred during import",
        variant: "destructive"
      });
    }

    // Clear the input
    event.target.value = '';
  };


  return (
    <Layout pageTitle="Automations">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Automations
            </h2>
            <p className="text-muted-foreground">
              Manage and monitor your workflow automations for {currentTenant?.name}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="import-file"
              />
              <Button 
                variant="outline"
                className="cursor-pointer"
                asChild
              >
                <label htmlFor="import-file" className="cursor-pointer flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </label>
              </Button>
            </div>
            <Button 
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleCreateAutomation}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Automation
            </Button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="text-lg">Loading automations...</div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-red-600">Error loading automations: {error}</div>
        </div>
      ) : workflows.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-lg font-medium text-foreground mb-2">No automations yet</div>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first workflow automation
          </p>
          <div className="flex gap-2 justify-center">
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="import-file-empty"
              />
              <Button 
                variant="outline"
                className="cursor-pointer"
                asChild
              >
                <label htmlFor="import-file-empty" className="cursor-pointer flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </label>
              </Button>
            </div>
            <Button 
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleCreateAutomation}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Automation
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <AutomationCard
              key={workflow.id}
              workflow={workflow}
              onCardClick={handleCardClick}
              onEdit={setEditingWorkflow}
              onDelete={setDeletingWorkflow}
              onRefresh={refreshWorkflows}
            />
          ))}
        </div>
      )}
      
      {/* Edit Modal */}
      {editingWorkflow && (
        <WorkflowEditModal
          workflow={editingWorkflow}
          open={!!editingWorkflow}
          onOpenChange={(open) => !open && setEditingWorkflow(null)}
          onWorkflowUpdated={refreshWorkflows}
        />
      )}
      
      {/* Delete Dialog */}
      {deletingWorkflow && (
        <WorkflowDeleteDialog
          workflow={deletingWorkflow}
          open={!!deletingWorkflow}
          onOpenChange={(open) => !open && setDeletingWorkflow(null)}
          onWorkflowDeleted={refreshWorkflows}
        />
      )}
    </Layout>
  );
};

export default Automations;