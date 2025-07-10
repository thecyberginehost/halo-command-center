import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Save, TestTube, Settings, Code, Zap, AlertCircle } from 'lucide-react';
import { VisualWorkflowNode } from '@/types/visualWorkflow';
import { IntegrationField } from '@/types/integrations';
import { useTenant } from '@/contexts/TenantContext';
import { EnterpriseCredentialsService, CredentialTemplate } from '@/services/enterpriseCredentialsService';
import { DynamicPropertiesService, DynamicProperty } from '@/services/dynamicPropertiesService';
import { useToast } from '@/hooks/use-toast';

interface EnhancedNodeConfigPanelProps {
  node: VisualWorkflowNode;
  onConfigChange: (nodeId: string, config: Record<string, any>) => void;
  onClose: () => void;
}

export function EnhancedNodeConfigPanel({ node, onConfigChange, onClose }: EnhancedNodeConfigPanelProps) {
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  
  const [config, setConfig] = useState(node.data.config || {});
  const [isValid, setIsValid] = useState(false);
  const [availableCredentials, setAvailableCredentials] = useState<any[]>([]);
  const [credentialTemplates, setCredentialTemplates] = useState<CredentialTemplate[]>([]);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [selectedOperation, setSelectedOperation] = useState<string>('');
  const [dynamicProperties, setDynamicProperties] = useState<DynamicProperty[]>([]);
  const [testResults, setTestResults] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const Icon = node.data.integration.icon;
  const credentialsService = new EnterpriseCredentialsService();
  const dynamicPropertiesService = new DynamicPropertiesService();

  // Enhanced integration with dynamic properties
  const enhancedIntegration = useMemo(() => {
    return dynamicPropertiesService.enhanceIntegrationWithDynamicProperties(node.data.integration);
  }, [node.data.integration, dynamicPropertiesService]);

  useEffect(() => {
    // Load credentials and templates
    const loadCredentials = async () => {
      if (!currentTenant) return;
      
      setLoadingCredentials(true);
      try {
        const [credentials, templates] = await Promise.all([
          credentialsService.getCredentialsForTenant(currentTenant.id),
          Promise.resolve(credentialsService.getCredentialTemplates())
        ]);
        
        setAvailableCredentials(credentials);
        setCredentialTemplates(templates);
      } catch (error) {
        console.error('Failed to load credentials:', error);
        toast({
          title: "Error Loading Credentials",
          description: "Failed to load available credentials",
          variant: "destructive"
        });
      } finally {
        setLoadingCredentials(false);
      }
    };

    loadCredentials();
  }, [currentTenant]);

  useEffect(() => {
    // Load dynamic properties when resource/operation changes
    if (selectedResource && selectedOperation) {
      const properties = dynamicPropertiesService.getDynamicProperties(
        node.data.integration.id,
        selectedResource,
        selectedOperation
      );
      setDynamicProperties(properties);
    }
  }, [selectedResource, selectedOperation, node.data.integration.id]);

  useEffect(() => {
    // Validate configuration
    const integrationFields = enhancedIntegration.fields || [];
    const requiredFields = integrationFields.filter(field => field.required);
    const hasAllRequired = requiredFields.every(field => 
      config[field.name] !== undefined && config[field.name] !== ''
    );
    setIsValid(hasAllRequired);
  }, [config, enhancedIntegration.fields]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev, [fieldName]: value };
      
      // Handle resource/operation changes
      if (fieldName === 'resource') {
        setSelectedResource(value);
        setSelectedOperation('');
        newConfig.operation = '';
      } else if (fieldName === 'operation') {
        setSelectedOperation(value);
      }
      
      return newConfig;
    });
  };

  const handleSave = () => {
    onConfigChange(node.id, {
      ...config,
      resource: selectedResource,
      operation: selectedOperation
    });
    toast({
      title: "Configuration Saved",
      description: `${node.data.integration.name} node has been configured successfully`,
    });
    onClose();
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResults(null);
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('execute-integration', {
        body: {
          action: 'test_node',
          integration: node.data.integration.id,
          config: {
            ...config,
            resource: selectedResource,
            operation: selectedOperation
          },
          context: {
            workflowId: 'test-workflow',
            stepId: node.id,
            input: { test: true },
            credentials: {},
            previousStepOutputs: {},
            tenantId: currentTenant?.id
          }
        }
      });

      if (error) throw error;

      setTestResults(data);
      
      toast({
        title: data.success ? "Test Successful" : "Test Failed",
        description: data.success 
          ? `Integration test completed successfully` 
          : `Test failed: ${data.error}`,
        variant: data.success ? "default" : "destructive"
      });
      
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults({ success: false, error: error.message });
      toast({
        title: "Test Failed",
        description: `Could not test integration: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const renderField = (field: IntegrationField) => {
    const value = config[field.name] || field.defaultValue || '';

    // Handle dynamic credential selection
    if (field.name === 'credential') {
      const relevantCredentials = availableCredentials.filter(cred => {
        const template = credentialTemplates.find(t => t.serviceType === cred.service_type);
        return template && template.serviceType.includes(node.data.integration.id.split('-')[0]);
      });

      return (
        <div className="space-y-2">
          <Select
            value={value}
            onValueChange={(newValue) => handleFieldChange(field.name, newValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select credential..." />
            </SelectTrigger>
            <SelectContent>
              {loadingCredentials ? (
                <SelectItem value="" disabled>Loading credentials...</SelectItem>
              ) : relevantCredentials.length === 0 ? (
                <SelectItem value="" disabled>No credentials available</SelectItem>
              ) : (
                relevantCredentials.map((cred) => (
                  <SelectItem key={cred.id} value={cred.name}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: credentialTemplates.find(t => t.serviceType === cred.service_type)?.color || '#6B7280' }}
                      />
                      <span>{cred.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {cred.service_type}
                      </Badge>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          
          {relevantCredentials.length === 0 && !loadingCredentials && (
            <p className="text-xs text-muted-foreground">
              No {node.data.integration.name} credentials found. 
              <Button variant="link" className="h-auto p-0 ml-1 text-primary">
                Add credential
              </Button>
            </p>
          )}
        </div>
      );
    }

    // Handle resource selection with dynamic operations
    if (field.name === 'operation' && selectedResource) {
      const resourceOps = dynamicPropertiesService.getResourceOperations(node.data.integration.id);
      const operations = resourceOps.find(r => r.resource === selectedResource)?.operations || [];

      return (
        <Select
          value={value}
          onValueChange={(newValue) => handleFieldChange(field.name, newValue)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select operation..." />
          </SelectTrigger>
          <SelectContent>
            {operations.map((operation) => (
              <SelectItem key={operation} value={operation}>
                {operation.charAt(0).toUpperCase() + operation.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Standard field types
    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.name, Number(e.target.value))}
            placeholder={field.placeholder}
          />
        );

      case 'boolean':
        return (
          <Switch
            checked={Boolean(value)}
            onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
          />
        );

      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(newValue) => handleFieldChange(field.name, newValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {(field.options || []).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'password':
        return (
          <Input
            type="password"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );

      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );
    }
  };

  const renderDynamicProperties = () => {
    if (dynamicProperties.length === 0) return null;

    const convertedFields = dynamicPropertiesService.convertToIntegrationFields(dynamicProperties);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 pt-4 border-t">
          <Zap className="h-4 w-4 text-primary" />
          <h4 className="font-medium">Dynamic Properties</h4>
        </div>
        {convertedFields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="flex items-center gap-2">
              {field.label}
              {field.required && <span className="text-destructive">*</span>}
            </Label>
            {renderField(field)}
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="w-96 h-full shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div 
            className="p-2 rounded flex items-center justify-center"
            style={{ backgroundColor: node.data.integration.color + '20' }}
          >
            {Icon && (
              <Icon 
                className="h-4 w-4" 
                style={{ color: node.data.integration.color }}
              />
            )}
          </div>
          <div>
            <CardTitle className="text-lg">{node.data.integration.name}</CardTitle>
            <Badge variant={node.data.integration.type === 'trigger' ? 'default' : 'secondary'}>
              {node.data.integration.type}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex flex-col h-full">
        <p className="text-sm text-muted-foreground mb-4">
          {node.data.integration.description}
        </p>

        <Tabs defaultValue="config" className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config" className="flex items-center gap-1">
              <Settings className="h-3 w-3" />
              Config
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-1">
              <Code className="h-3 w-3" />
              Advanced
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-1">
              <TestTube className="h-3 w-3" />
              Test
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="flex-1">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {(enhancedIntegration.fields || []).map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name} className="flex items-center gap-2">
                      {field.label}
                      {field.required && <span className="text-destructive">*</span>}
                    </Label>
                    {renderField(field)}
                    {field.helpText && (
                      <p className="text-xs text-muted-foreground">{field.helpText}</p>
                    )}
                  </div>
                ))}
                
                {renderDynamicProperties()}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="advanced" className="flex-1">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Raw Configuration</h4>
                  <Textarea
                    value={JSON.stringify(config, null, 2)}
                    onChange={(e) => {
                      try {
                        setConfig(JSON.parse(e.target.value));
                      } catch (error) {
                        // Invalid JSON, ignore
                      }
                    }}
                    rows={10}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="test" className="flex-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Test Configuration</h4>
                <Button 
                  onClick={handleTest}
                  disabled={!isValid || testing}
                  size="sm"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {testing ? 'Testing...' : 'Test'}
                </Button>
              </div>
              
              {testResults && (
                <div className={`p-3 rounded-lg border ${
                  testResults.success 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {testResults.success ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium">
                      {testResults.success ? 'Test Passed' : 'Test Failed'}
                    </span>
                  </div>
                  {testResults.error && (
                    <p className="text-sm">{testResults.error}</p>
                  )}
                  {testResults.logs && (
                    <div className="mt-2 text-xs">
                      <strong>Logs:</strong>
                      <pre className="mt-1 p-2 bg-background/50 rounded text-xs overflow-auto">
                        {testResults.logs.join('\n')}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex space-x-2 pt-4 border-t">
          <Button 
            onClick={handleSave}
            disabled={!isValid}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}