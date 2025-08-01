import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

const DEMO_WORKFLOWS = [
  {
    title: "Lead Processing Pipeline",
    description: "When a new lead fills out our contact form, add them to CRM, send welcome email, and notify sales team",
    prompt: "When someone fills out our contact form, add them to our CRM, send them a welcome email, and notify our sales team in Slack"
  },
  {
    title: "Customer Onboarding Flow", 
    description: "Automate new customer setup with account creation, welcome sequence, and team notifications",
    prompt: "When a customer signs up, create their account in our system, send a welcome email series, add them to our onboarding Slack channel, and schedule a follow-up call"
  },
  {
    title: "Support Ticket Automation",
    description: "Process support requests with AI categorization, auto-routing, and response tracking",
    prompt: "When a support ticket comes in via email, categorize it using AI, assign to the right team member, send auto-reply to customer, and create task in project management tool"
  },
  {
    title: "Invoice Processing",
    description: "Automate invoice workflow with approval routing, payment tracking, and notifications",
    prompt: "When an invoice is received, extract data using AI, route for approval based on amount, update accounting system, and notify relevant departments"
  }
];

interface DemoWorkflowGeneratorProps {
  onWorkflowGenerated: (workflow: any) => void;
}

export const DemoWorkflowGenerator: React.FC<DemoWorkflowGeneratorProps> = ({ onWorkflowGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingWorkflow, setGeneratingWorkflow] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentTenant } = useTenant();

  const generateWorkflow = async (workflow: typeof DEMO_WORKFLOWS[0]) => {
    if (!currentTenant) {
      toast({
        title: "Error",
        description: "No tenant selected",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratingWorkflow(workflow.title);

    try {
      const { data, error } = await supabase.functions.invoke('generate-workflow', {
        body: {
          prompt: workflow.prompt,
          tenantId: currentTenant.id,
          context: {
            demo: true,
            platform: 'HALO',
            target: 'Y_Combinator_Demo'
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Workflow Generated!",
        description: `Created "${workflow.title}" with ${data.workflow.steps.length} steps`
      });

      onWorkflowGenerated(data);

    } catch (error) {
      console.error('Error generating workflow:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate workflow. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setGeneratingWorkflow(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-primary">HALO Demo Workflows</h2>
        <p className="text-muted-foreground">
          Click any workflow to see HALO's AI generate a complete automation in seconds
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DEMO_WORKFLOWS.map((workflow, index) => (
          <Card 
            key={index} 
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-primary/50"
            onClick={() => !isGenerating && generateWorkflow(workflow)}
          >
            <CardHeader>
              <CardTitle className="text-lg">{workflow.title}</CardTitle>
              <CardDescription>{workflow.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                disabled={isGenerating}
                variant={generatingWorkflow === workflow.title ? "default" : "outline"}
              >
                {generatingWorkflow === workflow.title ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Generating...
                  </>
                ) : (
                  "Generate Workflow"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-muted/50 p-6 rounded-lg">
        <h3 className="font-semibold mb-2">💡 Demo Tip</h3>
        <p className="text-sm text-muted-foreground">
          Each workflow demonstrates HALO's enterprise-grade automation capabilities: 
          AI-powered workflow generation, professional integrations (CRM, Email, Slack), 
          and production-ready error handling.
        </p>
      </div>
    </div>
  );
};