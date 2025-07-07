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

interface DeveloperModeEditorProps {
  scriptCode: string;
  setScriptCode: (code: string) => void;
  setChatMessages: React.Dispatch<React.SetStateAction<Array<{role: string; content: string}>>>;
}

export function DeveloperModeEditor({ 
  scriptCode, 
  setScriptCode, 
  setChatMessages 
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
    toast({
      title: "Script Execution",
      description: "Script is running in test mode...",
    });
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Developer Mode</h3>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleDebugCode}>
            <Bug className="h-4 w-4 mr-2" />
            Debug Code
          </Button>
          <Button onClick={handleRunScript}>
            <Play className="h-4 w-4 mr-2" />
            Test Run
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
  );
}