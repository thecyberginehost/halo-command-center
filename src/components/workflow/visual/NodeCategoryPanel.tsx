import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { IntegrationNode } from '@/types/integrations';
import { NodeItem } from './NodeItem';

interface NodeCategoryPanelProps {
  searchTerm: string;
  selectedCategory: string | null;
  globalSearchResults: IntegrationNode[];
  categoryIntegrations: IntegrationNode[];
  categoryInfo?: {
    label: string;
    icon: any;
    color: string;
  };
  onNodeClick: (integration: IntegrationNode, event?: React.MouseEvent) => void;
  onClose: () => void;
}

export function NodeCategoryPanel({
  searchTerm,
  selectedCategory,
  globalSearchResults,
  categoryIntegrations,
  categoryInfo,
  onNodeClick,
  onClose
}: NodeCategoryPanelProps) {
  const hasSearchResults = searchTerm && globalSearchResults.length > 0;

  if (!hasSearchResults && !selectedCategory) {
    return null;
  }

  return (
    <Card className="mb-2 w-80 max-h-80 border shadow-xl bg-background">
      <div className="p-3 border-b">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          {hasSearchResults ? (
            <>
              <Search className="h-4 w-4" />
              Search Results
            </>
          ) : selectedCategory && categoryInfo ? (
            <>
              <categoryInfo.icon className="h-4 w-4" style={{ color: categoryInfo.color }} />
              {categoryInfo.label}
            </>
          ) : null}
        </h4>
        <p className="text-xs text-muted-foreground mt-1">
          {hasSearchResults 
            ? `${globalSearchResults.length} integration${globalSearchResults.length !== 1 ? 's' : ''} found`
            : selectedCategory 
              ? `Click to add multiple nodes`
              : ''
          }
        </p>
        {selectedCategory && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="mt-2 h-6 px-2 text-xs"
          >
            Close
          </Button>
        )}
      </div>
      <div className="max-h-64 overflow-y-auto">
        <div className="p-2 space-y-1">
          {hasSearchResults 
            ? globalSearchResults.map((integration) => (
                <NodeItem 
                  key={integration.id} 
                  integration={integration} 
                  onNodeClick={onNodeClick}
                />
              ))
            : selectedCategory 
              ? categoryIntegrations.map((integration) => (
                  <NodeItem 
                    key={integration.id} 
                    integration={integration} 
                    onNodeClick={onNodeClick}
                  />
                ))
              : null
          }
        </div>
      </div>
    </Card>
  );
}