import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Wand2 } from 'lucide-react';

interface WorkflowInputPanelProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isGenerating: boolean;
  onGenerateWorkflow: () => void;
  explanation: string;
  suggestions: string[];
  complexityAnalysis: {
    estimated_execution_time?: string;
    reliability_score?: string;
    maintenance_requirements?: string;
  } | null;
}

export const WorkflowInputPanel = ({
  prompt,
  setPrompt,
  isGenerating,
  onGenerateWorkflow,
  explanation,
  suggestions,
  complexityAnalysis
}: WorkflowInputPanelProps) => {
  return (
    <div className="w-96 border-r bg-white p-6 flex flex-col">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-halo-text mb-2 block">
            Describe Your Automation
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: When someone fills out our contact form, send them a welcome email, add them to our CRM, and notify our sales team in Slack"
            className="min-h-32 resize-none"
          />
        </div>
        
        <Button 
          onClick={onGenerateWorkflow}
          disabled={isGenerating}
          className="w-full bg-halo-accent hover:bg-halo-accent/90"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate Workflow
            </>
          )}
        </Button>

        {explanation && (
          <div className="mt-6">
            <h3 className="font-medium text-halo-text mb-2">Explanation</h3>
            <p className="text-sm text-halo-textSecondary bg-gray-50 p-3 rounded-lg">
              {explanation}
            </p>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium text-halo-text mb-2">o3 Suggestions</h3>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="text-xs text-halo-textSecondary bg-blue-50 p-2 rounded">
                  {suggestion}
                </div>
              ))}
            </div>
          </div>
        )}

        {complexityAnalysis && (
          <div className="mt-4">
            <h3 className="font-medium text-halo-text mb-2">Complexity Analysis</h3>
            <div className="space-y-2 text-xs">
              {complexityAnalysis.estimated_execution_time && (
                <div className="bg-gray-50 p-2 rounded">
                  <span className="font-medium">Execution Time:</span> {complexityAnalysis.estimated_execution_time}
                </div>
              )}
              {complexityAnalysis.reliability_score && (
                <div className="bg-gray-50 p-2 rounded">
                  <span className="font-medium">Reliability:</span> 
                  <Badge variant={
                    complexityAnalysis.reliability_score === 'high' ? 'default' : 
                    complexityAnalysis.reliability_score === 'medium' ? 'secondary' : 'outline'
                  } className="ml-2">
                    {complexityAnalysis.reliability_score}
                  </Badge>
                </div>
              )}
              {complexityAnalysis.maintenance_requirements && (
                <div className="bg-gray-50 p-2 rounded">
                  <span className="font-medium">Maintenance:</span> {complexityAnalysis.maintenance_requirements}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};