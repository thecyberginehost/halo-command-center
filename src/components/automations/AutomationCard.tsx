import { Card } from '@/components/ui/card';
import { WorkflowRecord } from '@/types/tenant';
import { WorkflowStatusToggle } from '@/components/WorkflowStatusToggle';
import { AutomationActions } from './AutomationActions';

interface AutomationCardProps {
  workflow: WorkflowRecord;
  onCardClick: (workflow: WorkflowRecord) => void;
  onEdit: (workflow: WorkflowRecord) => void;
  onDelete: (workflow: WorkflowRecord) => void;
  onRefresh: () => void;
}

export function AutomationCard({ 
  workflow, 
  onCardClick, 
  onEdit, 
  onDelete, 
  onRefresh 
}: AutomationCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onCardClick(workflow)}
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
              onStatusChanged={onRefresh}
            />
            <AutomationActions
              workflow={workflow}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}