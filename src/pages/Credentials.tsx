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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Key, Edit, Trash2, TestTube, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const credentialsService = new CredentialsService();

const serviceTypes = [
  { 
    value: 'openai', 
    label: 'OpenAI', 
    description: 'OpenAI API for GPT models', 
    icon: '🤖', 
    authTypes: {
      api_key: ['api_key'],
      oauth: ['client_id', 'client_secret']
    }
  },
  { 
    value: 'anthropic', 
    label: 'Anthropic', 
    description: 'Anthropic API for Claude models', 
    icon: '🧠', 
    authTypes: {
      api_key: ['api_key'],
      oauth: ['client_id', 'client_secret']
    }
  },
  { 
    value: 'gmail', 
    label: 'Gmail', 
    description: 'Gmail API for email sending', 
    icon: '📧', 
    authTypes: {
      api_key: ['api_key'],
      oauth: ['email', 'password', 'client_id', 'client_secret', 'refresh_token']
    }
  },
  { 
    value: 'slack', 
    label: 'Slack', 
    description: 'Slack API for messaging', 
    icon: '💬', 
    authTypes: {
      api_key: ['bot_token'],
      oauth: ['email', 'password', 'workspace_url', 'client_id', 'client_secret']
    }
  },
  { 
    value: 'salesforce', 
    label: 'Salesforce', 
    description: 'Salesforce CRM integration', 
    icon: '☁️', 
    authTypes: {
      api_key: ['consumer_key', 'consumer_secret', 'security_token'],
      oauth: ['email', 'password', 'instance_url', 'client_id', 'client_secret']
    }
  },
  { 
    value: 'hubspot', 
    label: 'HubSpot', 
    description: 'HubSpot CRM integration', 
    icon: '🎯', 
    authTypes: {
      api_key: ['api_key'],
      oauth: ['email', 'password', 'client_id', 'client_secret']
    }
  },
  { 
    value: 'webhook', 
    label: 'Webhook', 
    description: 'Custom webhook endpoints', 
    icon: '🔗', 
    authTypes: {
      api_key: ['url', 'auth_header'],
      oauth: ['url', 'client_id', 'client_secret']
    }
  },
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
  const [authType, setAuthType] = useState<'api_key' | 'oauth'>('api_key');
  const [isInitiatingOAuth, setIsInitiatingOAuth] = useState(false);

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
      // Add auth_type to the credential data
      const credentialData = {
        ...formData,
        auth_type: authType
      };
      
      await credentialsService.createCredential(currentTenant.id, credentialData);
      toast({
        title: "Success",
        description: "Credential created successfully"
      });
      setCreateDialogOpen(false);
      setFormData({ name: '', description: '', service_type: '', credentials: {} });
      setAuthType('api_key');
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

  const handleOAuthConnect = async () => {
    if (!currentTenant || !formData.service_type) return;
    
    try {
      setIsInitiatingOAuth(true);
      
      const { data, error } = await supabase.functions.invoke('oauth-initiate', {
        body: {
          serviceType: formData.service_type,
          tenantId: currentTenant.id,
          credentialName: formData.name || `${formData.service_type} OAuth Connection`
        }
      });

      if (error) throw error;

      // Store OAuth config in sessionStorage for callback
      sessionStorage.setItem(`oauth_state_${data.state}`, JSON.stringify({
        serviceType: formData.service_type,
        config: data.config,
        credentialName: formData.name || `${formData.service_type} OAuth Connection`
      }));

      // Redirect to OAuth provider
      window.location.href = data.authorizationUrl;
      
    } catch (error) {
      console.error('OAuth initiation error:', error);
      toast({
        title: "OAuth Error",
        description: error.message || "Failed to initiate OAuth flow",
        variant: "destructive"
      });
    } finally {
      setIsInitiatingOAuth(false);
    }
  };

  const renderCredentialFields = (serviceType: string, selectedAuthType: 'api_key' | 'oauth') => {
    const service = serviceTypes.find(s => s.value === serviceType);
    if (!service) return null;

    const fields = service.authTypes[selectedAuthType];
    if (!fields) return null;

    const fieldLabels = {
      'api_key': 'API Key',
      'client_id': 'Client ID',
      'client_secret': 'Client Secret', 
      'refresh_token': 'Refresh Token',
      'bot_token': 'Bot Token',
      'signing_secret': 'Signing Secret',
      'email': 'Email',
      'password': 'Password',
      'username': 'Username',
      'security_token': 'Security Token',
      'consumer_key': 'Consumer Key',
      'consumer_secret': 'Consumer Secret',
      'instance_url': 'Instance URL',
      'workspace_url': 'Workspace URL',
      'url': 'URL',
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
      'auth_header': 'password',
      'consumer_secret': 'password',
      'email': 'email',
      'url': 'url',
      'instance_url': 'url',
      'workspace_url': 'url'
    };

    const fieldPlaceholders = {
      'email': 'your-email@example.com',
      'password': 'Your account password',
      'instance_url': 'https://yourcompany.salesforce.com',
      'workspace_url': 'https://yourworkspace.slack.com',
      'url': 'https://api.example.com/webhook',
      'client_id': 'Your app client ID',
      'client_secret': 'Your app client secret'
    };

    if (selectedAuthType === 'oauth') {
      // Show OAuth connect button instead of manual fields
      return (
        <div className="space-y-4">
          <div className="text-center p-6 border-2 border-dashed border-muted rounded-lg">
            <div className="mb-4">
              <div className="text-lg font-semibold mb-2">
                Connect with {service.label}
              </div>
              <p className="text-sm text-muted-foreground">
                You'll be redirected to {service.label} to authorize this connection
              </p>
            </div>
            
            <Button 
              onClick={handleOAuthConnect}
              disabled={isInitiatingOAuth || !formData.name}
              className="w-full"
            >
              {isInitiatingOAuth ? (
                <>
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect with {service.label}
                </>
              )}
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>OAuth Flow:</strong> Click the button above to securely connect your {service.label} account. 
              You'll be redirected to {service.label} to authorize the connection, then returned here automatically.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field}>
            <Label htmlFor={field}>{fieldLabels[field] || field}</Label>
            <Input
              id={field}
              type={fieldTypes[field] || 'text'}
              placeholder={fieldPlaceholders[field] || `Enter your ${fieldLabels[field]?.toLowerCase() || field}`}
              value={formData.credentials[field] || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                credentials: { ...prev.credentials, [field]: e.target.value }
              }))}
            />
          </div>
        ))}
        
        {/* Service-specific tips */}
        {serviceType === 'salesforce' && selectedAuthType === 'api_key' && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> For Salesforce API access, get your Consumer Key/Secret from a Connected App in Setup → App Manager
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
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, service_type: value, credentials: {} }));
                        setAuthType('api_key'); // Reset to API key when service changes
                      }}
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
                  
                  {formData.service_type && (
                    <div>
                      <Label>Authentication Method</Label>
                      <RadioGroup
                        value={authType}
                        onValueChange={(value: 'api_key' | 'oauth') => {
                          setAuthType(value);
                          setFormData(prev => ({ ...prev, credentials: {} })); // Clear credentials when auth type changes
                        }}
                        className="flex space-x-6 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="api_key" id="api_key" />
                          <Label htmlFor="api_key" className="text-sm">API Key / Token</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="oauth" id="oauth" />
                          <Label htmlFor="oauth" className="text-sm">Email / Password (OAuth)</Label>
                        </div>
                      </RadioGroup>
                      <p className="text-xs text-muted-foreground mt-1">
                        {authType === 'api_key' 
                          ? 'Use API keys or tokens for direct API access'
                          : 'Use your account credentials for OAuth-based authentication'
                        }
                      </p>
                    </div>
                  )}
                  
                  {formData.service_type && renderCredentialFields(formData.service_type, authType)}
                  
                  {authType === 'api_key' && (
                    <Button 
                      onClick={handleCreateCredential} 
                      className="w-full"
                      disabled={!formData.name || !formData.service_type || Object.keys(formData.credentials).length === 0}
                    >
                      Create Credential
                    </Button>
                  )}
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
                    <div className="flex items-center gap-2">
                      <Badge variant={credential.auth_type === 'api_key' ? 'default' : 'outline'} className="text-xs">
                        {credential.auth_type === 'api_key' ? '🔑 API Key' : '📧 OAuth'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {Object.keys(credential.credentials || {}).length} fields configured
                      </span>
                    </div>
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