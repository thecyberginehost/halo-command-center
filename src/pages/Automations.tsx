import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Copy, Trash2, Plus, Share, FolderOpen, Archive, Edit } from 'lucide-react';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WorkflowEditModal } from '@/components/WorkflowEditModal';
import { WorkflowDeleteDialog } from '@/components/WorkflowDeleteDialog';
import { WorkflowStatusToggle } from '@/components/WorkflowStatusToggle';
import { WorkflowRecord } from '@/types/tenant';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Automations = () => {
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

  const formatLastExecuted = (lastExecuted: string | null) => {
    if (!lastExecuted) return 'Never';
    const date = new Date(lastExecuted);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than 1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const handleCardClick = (workflow: WorkflowRecord) => {
    navigate(`/automations/create/${workflow.id}`);
  };

  return (
    <Layout>
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
          <Button 
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={handleCreateAutomation}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Automation
          </Button>
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
          <Button 
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={handleCreateAutomation}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Automation
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <Card 
              key={workflow.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCardClick(workflow)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{workflow.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Last updated just now</span>
                      <span>|</span>
                      <span>Created {new Date(workflow.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <WorkflowStatusToggle 
                      workflow={workflow}
                      onStatusChanged={refreshWorkflows}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          setEditingWorkflow(workflow);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Share className="h-4 w-4 mr-2" />
                          Share...
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <FolderOpen className="h-4 w-4 mr-2" />
                          Move
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingWorkflow(workflow);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </Card>
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