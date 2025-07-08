import { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Zap, 
  Bot, 
  Puzzle, 
  Shield, 
  Users, 
  Code, 
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  Play,
  Settings,
  Database,
  Mail,
  Webhook,
  MessageSquare
} from 'lucide-react';

export default function Documentation() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language = 'json', id }: { code: string; language?: string; id: string }) => (
    <div className="relative bg-muted rounded-lg p-4 font-mono text-sm">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-8 w-8 p-0"
        onClick={() => handleCopyCode(code, id)}
      >
        {copiedCode === id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
      <pre className="overflow-x-auto pr-12">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">HALO Documentation</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Complete guide to HALO - the hyper-automation platform for MASP-certified professionals.
            Get started quickly or dive deep into advanced features.
          </p>
        </div>

        <Tabs defaultValue="quickstart" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
            <TabsTrigger value="migration">Migration</TabsTrigger>
            <TabsTrigger value="ai-features">AI Features</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Quick Start Tab */}
          <TabsContent value="quickstart" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Get Started in 5 Minutes
                </CardTitle>
                <CardDescription>
                  Follow these steps to create your first automation workflow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold">Access Your Dashboard</h4>
                      <p className="text-muted-foreground">Navigate to the main dashboard to see your automation overview and system health.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold">Create Your First Workflow</h4>
                      <p className="text-muted-foreground">Click "Automations" → "Create New" to start building your first automation.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold">Use AI Assistant</h4>
                      <p className="text-muted-foreground">Ask Resonant Directive: "Create a workflow that sends welcome emails to new contacts"</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold">Configure Credentials</h4>
                      <p className="text-muted-foreground">Set up your email and CRM credentials in Settings → Credentials for secure connections.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                      5
                    </div>
                    <div>
                      <h4 className="font-semibold">Test & Deploy</h4>
                      <p className="text-muted-foreground">Run a test execution, then activate your workflow to start automating.</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Sample Workflow JSON</h4>
                  <CodeBlock
                    id="sample-workflow"
                    code={`{
  "name": "Welcome Email Automation",
  "description": "Send welcome email to new contacts",
  "steps": [
    {
      "id": "trigger",
      "type": "webhook",
      "name": "New Contact Trigger",
      "config": {
        "method": "POST",
        "path": "/new-contact"
      }
    },
    {
      "id": "email",
      "type": "email",
      "name": "Send Welcome Email",
      "config": {
        "to": "{{trigger.email}}",
        "subject": "Welcome to our platform!",
        "template": "welcome_template"
      }
    }
  ]
}`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Migration Tab */}
          <TabsContent value="migration" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">From n8n</CardTitle>
                  <CardDescription>Migrate your n8n workflows seamlessly</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      Export n8n workflows as JSON
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      Use HALO import wizard
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      Remap credentials automatically
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      Test migrated workflows
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">From Make.com</CardTitle>
                  <CardDescription>Convert Make scenarios to HALO workflows</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      Download scenario blueprints
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      Use AI-powered conversion
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      Maintain trigger logic
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      Preserve error handling
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">From Windmill</CardTitle>
                  <CardDescription>Transition scripts and flows to HALO</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      Convert scripts to steps
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      Migrate flow definitions
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      Keep resource connections
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      Preserve scheduling logic
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Migration Assistant</CardTitle>
                <CardDescription>
                  Use Resonant Directive to help with complex migrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Ask our AI assistant questions like:
                  </p>
                  <div className="space-y-2">
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm">"Convert this n8n workflow to HALO format"</p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm">"Help me migrate my Make.com scenario with webhooks and email"</p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm">"What's the HALO equivalent of Windmill's cron scheduling?"</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Features Tab */}
          <TabsContent value="ai-features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Resonant Directive AI Assistant
                </CardTitle>
                <CardDescription>
                  Your intelligent automation companion for workflow creation and management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-3">Natural Language Workflow Creation</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Describe what you want to automate in plain English, and Resonant Directive will generate the complete workflow.
                    </p>
                    <div className="space-y-2">
                      <Badge variant="secondary">Example Prompts</Badge>
                      <div className="space-y-2 text-sm">
                        <div className="bg-muted p-2 rounded">
                          "When someone fills out our contact form, add them to Salesforce and send a welcome email"
                        </div>
                        <div className="bg-muted p-2 rounded">
                          "Create a workflow that backs up our database every night at 2 AM"
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Intelligent Troubleshooting</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get help debugging failed workflows with AI-powered error analysis and suggestions.
                    </p>
                    <div className="space-y-2">
                      <Badge variant="secondary">AI Capabilities</Badge>
                      <ul className="text-sm space-y-1">
                        <li className="flex items-center gap-2">
                          <ChevronRight className="h-4 w-4" />
                          Error pattern recognition
                        </li>
                        <li className="flex items-center gap-2">
                          <ChevronRight className="h-4 w-4" />
                          Suggested fixes
                        </li>
                        <li className="flex items-center gap-2">
                          <ChevronRight className="h-4 w-4" />
                          Performance optimization
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">AI-Powered Integrations</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardContent className="p-4">
                        <MessageSquare className="h-8 w-8 text-primary mb-2" />
                        <h5 className="font-semibold">Smart Content Generation</h5>
                        <p className="text-sm text-muted-foreground">Generate emails, messages, and documents using AI</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <Database className="h-8 w-8 text-primary mb-2" />
                        <h5 className="font-semibold">Data Processing</h5>
                        <p className="text-sm text-muted-foreground">Intelligent data transformation and analysis</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <Settings className="h-8 w-8 text-primary mb-2" />
                        <h5 className="font-semibold">Auto-Configuration</h5>
                        <p className="text-sm text-muted-foreground">Automatically configure integrations and mappings</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Puzzle className="h-5 w-5" />
                    Available Integrations
                  </CardTitle>
                  <CardDescription>
                    Connect HALO with your favorite tools and services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email & Communication
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <Badge variant="outline">SMTP</Badge>
                          <span>Custom SMTP servers</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Badge variant="outline">Gmail</Badge>
                          <span>Gmail API integration</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Badge variant="outline">Outlook</Badge>
                          <span>Microsoft Exchange</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Badge variant="outline">Slack</Badge>
                          <span>Team messaging</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        CRM & Databases
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <Badge variant="outline">Salesforce</Badge>
                          <span>CRM integration</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Badge variant="outline">HubSpot</Badge>
                          <span>Marketing automation</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Badge variant="outline">PostgreSQL</Badge>
                          <span>Database operations</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Badge variant="outline">MySQL</Badge>
                          <span>MySQL databases</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Webhook className="h-4 w-4" />
                        APIs & Webhooks
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <Badge variant="outline">REST API</Badge>
                          <span>HTTP requests</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Badge variant="outline">GraphQL</Badge>
                          <span>GraphQL queries</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Badge variant="outline">Webhooks</Badge>
                          <span>Event triggers</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Badge variant="outline">Custom</Badge>
                          <span>Build your own</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Integration Setup Example</CardTitle>
                  <CardDescription>
                    How to configure a Salesforce integration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CodeBlock
                    id="salesforce-config"
                    code={`{
  "name": "Salesforce Production",
  "type": "salesforce",
  "credentials": {
    "clientId": "your-client-id",
    "clientSecret": "your-client-secret",
    "username": "your-username",
    "password": "your-password",
    "securityToken": "your-security-token",
    "sandbox": false
  },
  "testConnection": true
}`}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Building Workflows
                </CardTitle>
                <CardDescription>
                  Learn how to create powerful automation workflows in HALO
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-3">Visual Mode</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag-and-drop interface for building workflows visually with real-time preview.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        Node-based workflow builder
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        Real-time data mapping
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        Visual execution flow
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        Built-in testing tools
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Developer Mode</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Advanced JSON editing for complex workflows with syntax highlighting and validation.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        JSON schema validation
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        Syntax highlighting
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        Auto-completion
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        Version control ready
                      </li>
                    </ul>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Workflow Step Types</h4>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Webhook className="h-8 w-8 text-primary mx-auto mb-2" />
                        <h5 className="font-semibold text-sm">Triggers</h5>
                        <p className="text-xs text-muted-foreground">Webhooks, schedules, manual</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Settings className="h-8 w-8 text-primary mx-auto mb-2" />
                        <h5 className="font-semibold text-sm">Actions</h5>
                        <p className="text-xs text-muted-foreground">API calls, data processing</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Code className="h-8 w-8 text-primary mx-auto mb-2" />
                        <h5 className="font-semibold text-sm">Logic</h5>
                        <p className="text-xs text-muted-foreground">Conditions, loops, delays</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Database className="h-8 w-8 text-primary mx-auto mb-2" />
                        <h5 className="font-semibold text-sm">Data</h5>
                        <p className="text-xs text-muted-foreground">Transform, validate, store</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Compliance
                </CardTitle>
                <CardDescription>
                  Enterprise-grade security for your automation platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-3">Credential Management</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Secure storage and management of API keys, passwords, and certificates.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        AES-256 encryption at rest
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        Role-based access control
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        Audit logging
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        Credential rotation
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Multi-Tenant Security</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Complete data isolation between organizations and clients.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        Database-level isolation
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        Network segregation
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        SSO integration
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        Compliance reporting
                      </li>
                    </ul>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Compliance Standards</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                        <h5 className="font-semibold">SOC 2 Type II</h5>
                        <p className="text-xs text-muted-foreground">Security and availability controls</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                        <h5 className="font-semibold">HIPAA</h5>
                        <p className="text-xs text-muted-foreground">Healthcare data protection</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Settings className="h-8 w-8 text-primary mx-auto mb-2" />
                        <h5 className="font-semibold">GDPR</h5>
                        <p className="text-xs text-muted-foreground">Data privacy compliance</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Best Practices</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        Use environment-specific credentials (dev, staging, production)
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        Regularly rotate API keys and passwords
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        Enable two-factor authentication for all accounts
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        Monitor and audit all workflow executions
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        Use least-privilege access for integrations
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-2">Need More Help?</h3>
              <p className="text-sm text-muted-foreground">
                Contact our support team or visit the MASP certification portal for advanced training.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                MASP Certified
              </Button>
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}