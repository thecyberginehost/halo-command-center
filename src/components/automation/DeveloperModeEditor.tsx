import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bug, Play, BookOpen, Code, Lightbulb, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getTemplateList, getTemplate } from '@/lib/workflow/templates';
import { useState } from 'react';
import { VisualModeCanvas } from './VisualModeCanvas';

interface DeveloperModeEditorProps {
  scriptCode: string;
  setScriptCode: (code: string) => void;
  setChatMessages: React.Dispatch<React.SetStateAction<Array<{role: string; content: string}>>>;
  onWorkflowChange?: (nodes: any[], edges: any[]) => void;
  workflowNodes?: any[];
  workflowEdges?: any[];
}

export function DeveloperModeEditor({ 
  scriptCode, 
  setScriptCode, 
  setChatMessages,
  onWorkflowChange,
  workflowNodes = [],
  workflowEdges = []
}: DeveloperModeEditorProps) {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [activeTab, setActiveTab] = useState('editor');
  const templates = getTemplateList();

  const handleDebugCode = () => {
    setChatMessages(prev => [...prev, 
      { role: 'user', content: 'Please debug my automation script' },
      { role: 'assistant', content: 'I\'ll analyze your script for potential issues. Let me check the syntax, logic flow, and suggest improvements...' }
    ]);
  };

  const handleRunScript = () => {
    console.log('Running script:', scriptCode);
    
    // Parse script and generate visual nodes
    const generatedNodes = parseScriptToNodes(scriptCode);
    const generatedEdges = generateEdgesFromNodes(generatedNodes);
    
    if (onWorkflowChange) {
      onWorkflowChange(generatedNodes, generatedEdges);
    }
    
    toast({
      title: "Script Tested",
      description: `Generated ${generatedNodes.length} nodes from your code!`,
    });
  };

  const parseScriptToNodes = (code: string) => {
    const nodes = [];
    let nodeIndex = 0;
    
    // Simple parsing for common automation patterns
    if (code.includes('sendEmail')) {
      nodes.push({
        id: `email-${nodeIndex++}`,
        type: 'integrationNode',
        position: { x: 100, y: 100 + (nodeIndex * 120) },
        data: {
          integration: {
            id: 'email',
            name: 'Send Email',
            type: 'action',
            color: '#3B82F6',
            icon: () => null
          },
          config: {},
          label: 'Send Email',
          isConfigured: true,
        }
      });
    }
    
    if (code.includes('makeHttpRequest') || code.includes('fetch')) {
      nodes.push({
        id: `http-${nodeIndex++}`,
        type: 'integrationNode',
        position: { x: 100, y: 100 + (nodeIndex * 120) },
        data: {
          integration: {
            id: 'http',
            name: 'HTTP Request',
            type: 'action',
            color: '#10B981',
            icon: () => null
          },
          config: {},
          label: 'HTTP Request',
          isConfigured: true,
        }
      });
    }
    
    if (code.includes('addToCRM')) {
      nodes.push({
        id: `crm-${nodeIndex++}`,
        type: 'integrationNode',
        position: { x: 100, y: 100 + (nodeIndex * 120) },
        data: {
          integration: {
            id: 'crm',
            name: 'Add to CRM',
            type: 'action',
            color: '#8B5CF6',
            icon: () => null
          },
          config: {},
          label: 'Add to CRM',
          isConfigured: true,
        }
      });
    }
    
    return nodes;
  };

  const generateEdgesFromNodes = (nodes: any[]) => {
    const edges = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push({
        id: `edge-${i}`,
        source: nodes[i].id,
        target: nodes[i + 1].id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
      });
    }
    return edges;
  };

  const handleLoadTemplate = () => {
    if (!selectedTemplate) return;
    
    const template = getTemplate(selectedTemplate);
    if (template) {
      setScriptCode(template.code);
      toast({
        title: "Template Loaded",
        description: `"${template.name}" template has been loaded into the editor.`,
      });
    }
  };

  const handleCopyExample = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied",
      description: "Code example copied to clipboard",
    });
  };

  return (
    <div className="h-full flex">
      {/* Left side - Code Editor */}
      <div className="w-1/2 p-4 border-r space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Code Editor</h3>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleDebugCode}>
              <Bug className="h-4 w-4 mr-2" />
              Debug Code
            </Button>
            <Button onClick={handleRunScript}>
              <Play className="h-4 w-4 mr-2" />
              Test & Visualize
            </Button>
          </div>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="editor">
            <Code className="h-4 w-4 mr-2" />
            Code Editor
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Lightbulb className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="api">
            <BookOpen className="h-4 w-4 mr-2" />
            API Reference
          </TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={handleLoadTemplate}
                disabled={!selectedTemplate}
              >
                Load Template
              </Button>
            </div>
          </div>
          
          <div className="border rounded-lg">
            <Textarea
              value={scriptCode}
              onChange={(e) => setScriptCode(e.target.value)}
              className="min-h-[500px] font-mono text-sm resize-none border-0 focus-visible:ring-0"
              placeholder={`// Write your automation workflow here
// Example:
async function executeWorkflow({ input, context }) {
  // Your automation logic
  const result = await sendEmail({
    to: input.email,
    subject: 'Welcome!',
    body: 'Thank you for signing up!'
  });
  
  return {
    success: true,
    message: 'Email sent successfully',
    data: result
  };
}`}
            />
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:bg-muted/50" onClick={() => {
                setSelectedTemplate(template.id);
                setActiveTab('editor');
                handleLoadTemplate();
              }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <Badge variant="secondary">Template</Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Email Functions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="font-mono text-sm bg-muted p-3 rounded">
                  <div className="font-bold mb-2">sendEmail(config)</div>
                  <div className="text-muted-foreground">
                    Send emails using your configured email provider
                  </div>
                  <div className="mt-2 text-xs">
                    Parameters: to, subject, body, template, data, from
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">HTTP Functions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="font-mono text-sm bg-muted p-3 rounded">
                  <div className="font-bold mb-2">makeHttpRequest(config)</div>
                  <div className="text-muted-foreground">
                    Make HTTP requests to external APIs
                  </div>
                  <div className="mt-2 text-xs">
                    Parameters: url, method, headers, body, timeout
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">CRM Functions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="font-mono text-sm bg-muted p-3 rounded">
                  <div className="font-bold mb-2">addToCRM(contact, provider)</div>
                  <div className="text-muted-foreground">
                    Add contacts to your CRM system
                  </div>
                  <div className="mt-2 text-xs">
                    Parameters: email, name, company, phone, customFields
                  </div>
                </div>
                <div className="font-mono text-sm bg-muted p-3 rounded">
                  <div className="font-bold mb-2">updateCRMContact(id, updates)</div>
                  <div className="text-muted-foreground">
                    Update existing CRM contacts
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Utility Functions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="font-mono text-sm bg-muted p-3 rounded">
                  <div className="font-bold mb-2">delay(ms), validateEmail(email), formatDate(date)</div>
                  <div className="text-muted-foreground">
                    Common utility functions for data processing
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  Basic Email Example
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleCopyExample(`await sendEmail({
  to: input.email,
  subject: 'Welcome!',
  body: \`Hello \${input.name}, welcome!\`
});`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`await sendEmail({
  to: input.email,
  subject: 'Welcome!',
  body: \`Hello \${input.name}, welcome!\`
});`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  API Call Example
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleCopyExample(`const response = await makeHttpRequest({
  url: 'https://api.example.com/data',
  method: 'POST',
  headers: { 'Authorization': 'Bearer token' },
  body: { key: 'value' }
});`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`const response = await makeHttpRequest({
  url: 'https://api.example.com/data',
  method: 'POST',
  headers: { 'Authorization': 'Bearer token' },
  body: { key: 'value' }
});`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  Conditional Logic Example
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleCopyExample(`if (input.userType === 'premium') {
  await sendEmail({ template: 'premium-welcome' });
} else {
  await sendEmail({ template: 'basic-welcome' });
}`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`if (input.userType === 'premium') {
  await sendEmail({ template: 'premium-welcome' });
} else {
  await sendEmail({ template: 'basic-welcome' });
}`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-sm text-muted-foreground space-y-1">
        <p>• Use the <code>executeWorkflow</code> function as your main entry point</p>
        <p>• Access input data via <code>input</code> parameter and context via <code>context</code></p>
        <p>• Return an object with <code>success</code>, <code>message</code>, and <code>data</code> properties</p>
        <p>• Use built-in functions like <code>sendEmail()</code>, <code>addToCRM()</code>, <code>makeHttpRequest()</code></p>
      </div>
      </div>

      {/* Right side - Visual Workflow */}
      <div className="w-1/2 p-4">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Visual Preview</h3>
            <div className="text-sm text-muted-foreground">
              {workflowNodes.length} nodes • {workflowEdges.length} connections
            </div>
          </div>
          
          <div className="flex-1 border rounded-lg bg-muted/20 relative overflow-hidden">
            {workflowNodes.length > 0 ? (
              <div className="absolute inset-0">
                <VisualModeCanvas
                  onAddStepClick={() => {}}
                  onWorkflowChange={onWorkflowChange}
                  initialNodes={workflowNodes}
                  initialEdges={workflowEdges}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center space-y-2">
                  <Code className="h-8 w-8 mx-auto opacity-50" />
                  <p className="text-sm">Write code and test to see visual nodes</p>
                  <p className="text-xs">Functions like sendEmail(), makeHttpRequest() will create nodes</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}