import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Copy, Trash2, Share, FolderOpen, Archive, Edit, Download } from 'lucide-react';
import { WorkflowRecord } from '@/types/tenant';
import { AutomationImportExportService } from '@/services/automationImportExport';
import { useToast } from '@/hooks/use-toast';

interface AutomationActionsProps {
  workflow: WorkflowRecord;
  onEdit: (workflow: WorkflowRecord) => void;
  onDelete: (workflow: WorkflowRecord) => void;
}

export function AutomationActions({ workflow, onEdit, onDelete }: AutomationActionsProps) {
  const { toast } = useToast();

  const handleExport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await AutomationImportExportService.exportWorkflow(workflow);
      toast({
        title: "Export Successful",
        description: `"${workflow.name}" has been exported to your downloads.`
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export automation.",
        variant: "destructive"
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          onEdit(workflow);
        }}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
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
            onDelete(workflow);
          }}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}