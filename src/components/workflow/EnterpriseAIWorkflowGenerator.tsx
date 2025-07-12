import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  Zap, 
  Clock, 
  Shield, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  Workflow,
  Cpu,
  Database,
  Mail,
  MessageSquare,
  Users,
  FileText,
  Brain,
  Sparkles
} from 'lucide-react';
import { WorkflowAIService } from '@/services/workflowAI';
import { useTenant } from '@/contexts/TenantContext';
import { AIGenerationResponse } from '@/types/workflow';

interface EnterpriseAIWorkflowGeneratorProps {
  onWorkflowGenerated: (response: AIGenerationResponse) => void;
  onClose?: () => void;
}

const enterprisePrompts = [
  {
    category: "Lead Management",
    icon: <Users className="w-4 h-4" />,
    prompts: [
      "When a new lead fills out our contact form, validate their email, add them to Salesforce, send a welcome email, and notify our sales team in Slack",
      "Create a lead scoring system that analyzes website behavior, enriches contact data from LinkedIn, and automatically assigns high-value leads to senior sales reps",
      "Set up automated lead nurturing that sends personalized emails based on industry, triggers follow-up tasks in CRM, and schedules qualification calls"
    ]
  },
  {
    category: "Customer Support",
    icon: <MessageSquare className="w-4 h-4" />,
    prompts: [
      "When a customer submits a support ticket, categorize it using AI, assign to the right team, create a Slack channel, and send status updates",
      "Build an escalation workflow that monitors ticket response times, automatically escalates urgent issues, and notifies managers of SLA breaches",
      "Create a customer feedback loop that processes survey responses, updates CRM satisfaction scores, and triggers improvement workflows"
    ]
  },
  {
    category: "Financial Operations",
    icon: <TrendingUp className="w-4 h-4" />,
    prompts: [
      "When an invoice is paid, update accounting records, send receipt to customer, trigger fulfillment process, and update sales commission tracking",
      "Create a expense approval workflow that routes requests based on amount, requires manager approval, integrates with accounting systems, and tracks budgets",
      "Build a financial reporting pipeline that aggregates data from multiple sources, generates executive dashboards, and sends monthly summaries"
    ]
  },
  {
    category: "Content & Marketing",
    icon: <FileText className="w-4 h-4" />,
    prompts: [
      "When blog content is published, automatically share on social media, update SEO metadata, notify email subscribers, and track engagement metrics",
      "Create a content approval workflow that routes drafts to reviewers, tracks changes, ensures brand compliance, and schedules publication",
      "Build a campaign performance tracker that monitors ad spend, calculates ROI, adjusts budgets automatically, and reports to stakeholders"
    ]
  }
];

const integrationIcons = {
  email: <Mail className="w-3 h-3" />,
  crm: <Users className="w-3 h-3" />,
  communication: <MessageSquare className="w-3 h-3" />,
  database: <Database className="w-3 h-3" />,
  ai: <Brain className="w-3 h-3" />,
  trigger: <Zap className="w-3 h-3" />
};

export function EnterpriseAIWorkflowGenerator({ onWorkflowGenerated, onClose }: EnterpriseAIWorkflowGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<AIGenerationResponse | null>(null);
  const { toast } = useToast();
  const { currentTenant } = useTenant();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Input Required",
        description: "Please describe the enterprise automation you want to create.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const aiService = new WorkflowAIService();
      const response = await aiService.generateWorkflow({
        prompt,
        tenantId: currentTenant?.id
      });

      setLastGenerated(response);
      onWorkflowGenerated(response);

      toast({
        title: "Enterprise Workflow Generated!",
        description: `AI-powered automation created with ${response.workflow.steps.length} processing units.`,
        action: (
          <Button variant="outline" size="sm" onClick={onClose}>
            View Pipeline
          </Button>
        )
      });
    } catch (error) {
      toast({
        title: "Generation Failed", 
        description: "Failed to generate enterprise workflow. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePromptSelect = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HALO AI Workflow Generator
            </h2>
            <p className="text-sm text-muted-foreground">Enterprise-grade automation powered by advanced reasoning AI</p>
          </div>
        </div>
      </div>

      {/* AI Capabilities Banner */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <Cpu className="w-6 h-6 mx-auto text-blue-600" />
              <div className="text-xs font-medium">o3 Reasoning</div>
              <div className="text-xs text-muted-foreground">Advanced AI</div>
            </div>
            <div className="space-y-1">
              <Workflow className="w-6 h-6 mx-auto text-purple-600" />
              <div className="text-xs font-medium">Auto-Architecture</div>
              <div className="text-xs text-muted-foreground">Smart Design</div>
            </div>
            <div className="space-y-1">
              <Shield className="w-6 h-6 mx-auto text-green-600" />
              <div className="text-xs font-medium">Enterprise-Ready</div>
              <div className="text-xs text-muted-foreground">Production Grade</div>
            </div>
            <div className="space-y-1">
              <Sparkles className="w-6 h-6 mx-auto text-yellow-600" />
              <div className="text-xs font-medium">MASP Certified</div>
              <div className="text-xs text-muted-foreground">Professional</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prompt Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <span>Describe Your Enterprise Automation</span>
          </CardTitle>
          <CardDescription>
            Describe your business process in natural language. Our AI will architect a complete enterprise automation pipeline.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Example: When a customer fills out our contact form, validate their information, add them to our CRM, send a personalized welcome email, notify our sales team in Slack, and schedule a follow-up task..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="min-h-[100px]"
          />
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {prompt.length}/500 characters
            </div>
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isGenerating ? (
                <>
                  <Cpu className="w-4 h-4 mr-2 animate-spin" />
                  AI Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Enterprise Pipeline
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Template Prompts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enterprise Automation Templates</CardTitle>
          <CardDescription>
            Click any template to customize for your business needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enterprisePrompts.map((category) => (
              <div key={category.category}>
                <div className="flex items-center space-x-2 mb-2">
                  {category.icon}
                  <h4 className="font-medium text-sm">{category.category}</h4>
                </div>
                <div className="space-y-2">
                  {category.prompts.map((promptText, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200"
                      onClick={() => handlePromptSelect(promptText)}
                    >
                      <p className="text-sm text-gray-700">{promptText}</p>
                    </div>
                  ))}
                </div>
                {category !== enterprisePrompts[enterprisePrompts.length - 1] && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Last Generated Preview */}
      {lastGenerated && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <CheckCircle2 className="w-5 h-5" />
              <span>Latest Generated Pipeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium text-green-800">{lastGenerated.workflow.name}</h4>
              <p className="text-sm text-green-700">{lastGenerated.workflow.description}</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {lastGenerated.workflow.steps.map((step) => {
                const integration = step.config?.integration || 'general';
                const icon = integrationIcons[integration as keyof typeof integrationIcons] || <Workflow className="w-3 h-3" />;
                return (
                  <Badge key={step.id} variant="secondary" className="text-xs">
                    {icon}
                    <span className="ml-1">{step.title}</span>
                  </Badge>
                );
              })}
            </div>

            {lastGenerated.complexity_analysis && (
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <Clock className="w-4 h-4 mx-auto text-green-600 mb-1" />
                  <div className="text-xs font-medium">Execution Time</div>
                  <div className="text-xs text-green-700">{lastGenerated.complexity_analysis.estimated_execution_time}</div>
                </div>
                <div>
                  <Shield className="w-4 h-4 mx-auto text-green-600 mb-1" />
                  <div className="text-xs font-medium">Reliability</div>
                  <div className="text-xs text-green-700 capitalize">{lastGenerated.complexity_analysis.reliability_score}</div>
                </div>
                <div>
                  <TrendingUp className="w-4 h-4 mx-auto text-green-600 mb-1" />
                  <div className="text-xs font-medium">Steps</div>
                  <div className="text-xs text-green-700">{lastGenerated.workflow.steps.length} Units</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}