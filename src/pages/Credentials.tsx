import { useState, useEffect } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import { CredentialsService, TenantCredential, CreateCredentialRequest } from '@/services/credentialsService';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Key, Edit, Trash2, TestTube } from 'lucide-react';

const credentialsService = new CredentialsService();

const serviceTypes = [
  { value: 'openai', label: 'OpenAI', description: 'OpenAI API for GPT models', icon: '🤖', fields: ['api_key'] },
  { value: 'anthropic', label: 'Anthropic', description: 'Anthropic API for Claude models', icon: '🧠', fields: ['api_key'] },
  { value: 'gmail', label: 'Gmail', description: 'Gmail API for email sending', icon: '📧', fields: ['client_id', 'client_secret', 'refresh_token'] },
  { value: 'slack', label: 'Slack', description: 'Slack API for messaging', icon: '💬', fields: ['bot_token', 'signing_secret'] },
  { value: 'salesforce', label: 'Salesforce', description: 'Salesforce CRM integration', icon: '☁️', fields: ['client_id', 'client_secret', 'username', 'password', 'security_token'] },
  { value: 'hubspot', label: 'HubSpot', description: 'HubSpot CRM integration', icon: '🎯', fields: ['api_key'] },
  { value: 'webhook', label: 'Webhook', description: 'Custom webhook endpoints', icon: '🔗', fields: ['url', 'auth_header'] },
];

export default function Credentials() {
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  
  const [credentials, setCredentials] = useState<TenantCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<TenantCredential | null>(null);
  
  const [formData, setFormData] = useState<CreateCredentialRequest>({
    name: '',
    description: '',
    service_type: '',
    credentials: {}
  });

  useEffect(() => {
    if (currentTenant) {
      loadCredentials();
    }
  }, [currentTenant]);

  const loadCredentials = async () => {
    if (!currentTenant) return;
    
    try {
      setLoading(true);
      const data = await credentialsService.getCredentialsForTenant(currentTenant.id);
      setCredentials(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load credentials",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCredential = async () => {
    if (!currentTenant) return;
    
    try {
      await credentialsService.createCredential(currentTenant.id, formData);
      toast({
        title: "Success",
        description: "Credential created successfully"
      });
      setCreateDialogOpen(false);
      setFormData({ name: '', description: '', service_type: '', credentials: {} });
      loadCredentials();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create credential",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCredential = async (credentialId: string) => {
    try {
      await credentialsService.deleteCredential(credentialId);
      toast({
        title: "Success",
        description: "Credential deleted successfully"
      });
      loadCredentials();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete credential",
        variant: "destructive"
      });
    }
  };

  const handleTestCredential = async (credential: TenantCredential) => {
    try {
      const result = await credentialsService.testCredential(credential);
      toast({
        title: result.success ? "Test Successful" : "Test Failed",
        description: result.success ? "Credential is working correctly" : result.error || "Credential test failed",
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to test credential",
        variant: "destructive"
      });
    }
  };

  const getServiceTypeLabel = (serviceType: string) => {
    const service = serviceTypes.find(st => st.value === serviceType);
    return service ? `${service.icon} ${service.label}` : serviceType;
  };

  const renderCredentialFields = (serviceType: string) => {
    const service = serviceTypes.find(s => s.value === serviceType);
    if (!service) return null;

    const fieldLabels = {
      'api_key': 'API Key',
      'client_id': 'Client ID',
      'client_secret': 'Client Secret', 
      'refresh_token': 'Refresh Token',
      'bot_token': 'Bot Token',
      'signing_secret': 'Signing Secret',
      'username': 'Username',
      'password': 'Password',
      'security_token': 'Security Token',
      'url': 'Webhook URL',
      'auth_header': 'Authorization Header'
    };

    const fieldTypes = {
      'api_key': 'password',
      'client_secret': 'password',
      'refresh_token': 'password',
      'bot_token': 'password',
      'signing_secret': 'password',
      'password': 'password',
      'security_token': 'password',
      'auth_header': 'password'
    };

    return (
      <div className="space-y-4">
        {service.fields.map((field) => (
          <div key={field}>
            <Label htmlFor={field}>{fieldLabels[field] || field}</Label>
            <Input
              id={field}
              type={fieldTypes[field] || 'text'}
              placeholder={`Enter your ${fieldLabels[field]?.toLowerCase() || field}`}
              value={formData.credentials[field] || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                credentials: { ...prev.credentials, [field]: e.target.value }
              }))}
            />
          </div>
        ))}
        
        {serviceType === 'salesforce' && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> For Salesforce, you can find your security token in Setup → Personal Information → Reset My Security Token
            </p>
          </div>
        )}
        
        {serviceType === 'openai' && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" className="text-primary hover:underline">OpenAI Platform</a>
            </p>
          </div>
        )}
      </div>
    );
  };

  if (!currentTenant) {
    return <div className="flex items-center justify-center h-screen">Please select a tenant</div>;
  }

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <SidebarInset className="flex-1">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Credentials</h1>
              <p className="text-muted-foreground">Manage API keys and authentication credentials</p>
            </div>
            
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Credential
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Credential</DialogTitle>
                  <DialogDescription>
                    Add a new API credential for your automations
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="My OpenAI Key"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      placeholder="Production API key for GPT models"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="service_type">Service Type</Label>
                    <Select
                      value={formData.service_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, service_type: value, credentials: {} }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypes.map((service) => (
                          <SelectItem key={service.value} value={service.value}>
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{service.icon}</span>
                              <div>
                                <div className="font-medium">{service.label}</div>
                                <div className="text-sm text-muted-foreground">{service.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.service_type && renderCredentialFields(formData.service_type)}
                  
                  <Button 
                    onClick={handleCreateCredential} 
                    className="w-full"
                    disabled={!formData.name || !formData.service_type || Object.keys(formData.credentials).length === 0}
                  >
                    Create Credential
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : credentials.length === 0 ? (
            <Card className="text-center p-12">
              <CardContent>
                <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No credentials yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first API credential to start building automations
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Credential
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {credentials.map((credential) => (
                <Card key={credential.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{credential.name}</CardTitle>
                      <Badge variant="secondary">
                        {getServiceTypeLabel(credential.service_type)}
                      </Badge>
                    </div>
                    {credential.description && (
                      <CardDescription>{credential.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Created {new Date(credential.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTestCredential(credential)}
                        >
                          <TestTube className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingCredential(credential);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Credential</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{credential.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCredential(credential.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </div>
  );
}