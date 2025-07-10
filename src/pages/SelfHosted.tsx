import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Server, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  Container, 
  Shield,
  Zap,
  Users,
  AlertCircle,
  ExternalLink,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const requirements = {
  minimum: {
    os: "Ubuntu 20.04+ / CentOS 8+ / Debian 11+",
    cpu: "2 vCPU",
    memory: "4 GB RAM",
    storage: "20 GB SSD",
    docker: "Docker 20.10+ & Docker Compose 2.0+"
  },
  recommended: {
    os: "Ubuntu 22.04 LTS",
    cpu: "4 vCPU", 
    memory: "8 GB RAM",
    storage: "50 GB SSD",
    docker: "Docker 24.0+ & Docker Compose 2.20+"
  }
};

const installCommands = [
  {
    step: 1,
    title: "Download HALO",
    command: "curl -fsSL https://install.halo.run/install.sh | bash",
    description: "Downloads and runs the HALO installation script"
  },
  {
    step: 2, 
    title: "Configure Environment",
    command: "./halo configure",
    description: "Interactive setup for domain, database, and security settings"
  },
  {
    step: 3,
    title: "Start HALO",
    command: "./halo start",
    description: "Starts all HALO services with Docker Compose"
  }
];

const manualCommands = [
  {
    step: 1,
    title: "Clone Repository",
    command: "git clone https://github.com/halo-platform/halo.git\ncd halo",
    description: "Get the latest HALO source code"
  },
  {
    step: 2,
    title: "Copy Environment",
    command: "cp .env.example .env",
    description: "Create your environment configuration file"
  },
  {
    step: 3,
    title: "Configure Settings",
    command: "nano .env",
    description: "Edit database credentials, domain, and security keys"
  },
  {
    step: 4,
    title: "Start Services", 
    command: "docker-compose up -d",
    description: "Launch HALO with PostgreSQL, Redis, and web services"
  }
];

export default function SelfHosted() {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyCommand = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommand(command);
      toast.success("Command copied to clipboard!");
      setTimeout(() => setCopiedCommand(null), 2000);
    } catch (err) {
      toast.error("Failed to copy command");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <Link to="/pricing" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Pricing
          </Link>
          <h1 className="text-4xl font-bold text-gradient-primary mb-4">
            Self-Hosted HALO
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Deploy HALO on your own infrastructure for complete control, data sovereignty, and custom configurations.
            Perfect for enterprises with strict security requirements.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  FREE
                </Badge>
                <CardTitle>Self-Hosted Community</CardTitle>
              </div>
              <CardDescription>
                Perfect for single organizations or testing environments
              </CardDescription>
              <div className="text-2xl font-bold">$0/month</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 text-sm">
                <Users className="h-4 w-4 text-primary" />
                <span>1 organization per instance</span>
              </div>
              <ul className="space-y-2">
                {[
                  "Unlimited workflows & executions",
                  "Core integrations",
                  "Community support",
                  "Docker deployment",
                  "Local data storage"
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="ring-2 ring-primary">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Badge>ENTERPRISE</Badge>
                <CardTitle>Self-Hosted Enterprise</CardTitle>
              </div>
              <CardDescription>
                For large organizations managing multiple clients
              </CardDescription>
              <div className="text-2xl font-bold">
                $999/month
                <span className="text-sm font-normal text-muted-foreground">/instance</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 text-sm">
                <Users className="h-4 w-4 text-primary" />
                <span>Unlimited organizations per instance</span>
              </div>
              <ul className="space-y-2">
                {[
                  "Everything in Community",
                  "Multi-tenant architecture", 
                  "Advanced analytics & reporting",
                  "Audit logging & compliance",
                  "SSO & LDAP integration",
                  "Dedicated support",
                  "Custom integrations"
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full">
                Contact Sales
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Requirements */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5" />
              <span>System Requirements</span>
            </CardTitle>
            <CardDescription>
              HALO is designed to run efficiently on modern Linux servers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4 text-orange-600">Minimum Requirements</h3>
                <div className="space-y-3">
                  <div>
                    <div className="font-medium text-sm">Operating System</div>
                    <div className="text-sm text-muted-foreground">{requirements.minimum.os}</div>
                  </div>
                  <div>
                    <div className="font-medium text-sm">CPU</div>
                    <div className="text-sm text-muted-foreground">{requirements.minimum.cpu}</div>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Memory</div>
                    <div className="text-sm text-muted-foreground">{requirements.minimum.memory}</div>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Storage</div>
                    <div className="text-sm text-muted-foreground">{requirements.minimum.storage}</div>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Dependencies</div>
                    <div className="text-sm text-muted-foreground">{requirements.minimum.docker}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4 text-green-600">Recommended (Production)</h3>
                <div className="space-y-3">
                  <div>
                    <div className="font-medium text-sm">Operating System</div>
                    <div className="text-sm text-muted-foreground">{requirements.recommended.os}</div>
                  </div>
                  <div>
                    <div className="font-medium text-sm">CPU</div>
                    <div className="text-sm text-muted-foreground">{requirements.recommended.cpu}</div>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Memory</div>
                    <div className="text-sm text-muted-foreground">{requirements.recommended.memory}</div>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Storage</div>
                    <div className="text-sm text-muted-foreground">{requirements.recommended.storage}</div>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Dependencies</div>
                    <div className="text-sm text-muted-foreground">{requirements.recommended.docker}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Installation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Terminal className="h-5 w-5" />
              <span>Installation Guide</span>
            </CardTitle>
            <CardDescription>
              Choose your preferred installation method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="quick" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="quick">Quick Install</TabsTrigger>
                <TabsTrigger value="manual">Manual Install</TabsTrigger>
              </TabsList>

              <TabsContent value="quick" className="space-y-6">
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    The quick installer automatically handles Docker setup, SSL certificates, and database configuration.
                  </AlertDescription>
                </Alert>

                <div className="space-y-6">
                  {installCommands.map((cmd) => (
                    <div key={cmd.step} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">
                          Step {cmd.step}: {cmd.title}
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyCommand(cmd.command)}
                          className="shrink-0"
                        >
                          {copiedCommand === cmd.command ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{cmd.description}</p>
                      <div className="bg-muted rounded p-3 font-mono text-sm overflow-x-auto">
                        {cmd.command}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="manual" className="space-y-6">
                <Alert>
                  <Container className="h-4 w-4" />
                  <AlertDescription>
                    Manual installation gives you full control over the configuration and deployment process.
                  </AlertDescription>
                </Alert>

                <div className="space-y-6">
                  {manualCommands.map((cmd) => (
                    <div key={cmd.step} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">
                          Step {cmd.step}: {cmd.title}
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyCommand(cmd.command)}
                          className="shrink-0"
                        >
                          {copiedCommand === cmd.command ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{cmd.description}</p>
                      <div className="bg-muted rounded p-3 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                        {cmd.command}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <Alert className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Security Note:</strong> The installer will generate secure passwords and SSL certificates automatically.
                For production deployments, ensure your firewall only allows necessary ports (80, 443, 22).
              </AlertDescription>
            </Alert>

            <div className="mt-6 text-center">
              <Button asChild>
                <a href="https://docs.halo.run/self-hosted" target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" />
                  Download Full Documentation
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">Why Self-Host HALO?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Complete Control</h3>
              <p className="text-sm text-muted-foreground">
                Your data stays on your infrastructure. Perfect for compliance with GDPR, HIPAA, and other regulations.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Server className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">No Vendor Lock-in</h3>
              <p className="text-sm text-muted-foreground">
                Open source foundation means you can modify, extend, and migrate freely without restrictions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Cost Effective</h3>
              <p className="text-sm text-muted-foreground">
                Free community edition for single organizations. Scale with your own hardware instead of per-user fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}