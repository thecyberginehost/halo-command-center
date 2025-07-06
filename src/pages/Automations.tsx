import Header from '../components/Header';
import { AppSidebar } from '../components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Settings, MoreVertical, Copy, Trash2 } from 'lucide-react';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useTenant } from '@/contexts/TenantContext';
import { WorkflowCreateModal } from '@/components/WorkflowCreateModal';
import { WorkflowEditModal } from '@/components/WorkflowEditModal';
import { WorkflowDeleteDialog } from '@/components/WorkflowDeleteDialog';
import { WorkflowStatusToggle } from '@/components/WorkflowStatusToggle';
import ResonantDirective from '../components/ResonantDirective';
import { WorkflowRecord } from '@/types/tenant';
import { useState } from 'react';

const Automations = () => {
  const { workflows, loading, error, refreshWorkflows } = useWorkflows();
  const { currentTenant } = useTenant();
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowRecord | null>(null);
  const [deletingWorkflow, setDeletingWorkflow] = useState<WorkflowRecord | null>(null);

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

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="ml-auto">
            <Header />
          </div>
        </header>
        
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
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
              <WorkflowCreateModal onWorkflowCreated={refreshWorkflows} />
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
              <WorkflowCreateModal onWorkflowCreated={refreshWorkflows} />
            </div>
          ) : (
            <div className="space-y-4">
              {workflows.map((workflow) => (
                <Card key={workflow.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg font-semibold">
                        {workflow.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {workflow.description || 'No description provided'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={workflow.status === 'active' ? 'default' : 'secondary'}
                      >
                        {workflow.status || 'draft'}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingWorkflow(workflow)}>
                            <Settings className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeletingWorkflow(workflow)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Executions:</span>
                          <span className="ml-1 font-medium">{workflow.execution_count || 0}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Last run:</span>
                          <span className="ml-1 font-medium">{formatLastExecuted(workflow.last_executed)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingWorkflow(workflow)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                        <WorkflowStatusToggle 
                          workflow={workflow}
                          onStatusChanged={refreshWorkflows}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
        
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
      </SidebarInset>
      
      {/* Resonant Directive AI Assistant - positioned relative to viewport */}
      <ResonantDirective />
    </div>
  );
};

export default Automations;