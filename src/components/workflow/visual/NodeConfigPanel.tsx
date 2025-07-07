import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Save, TestTube } from 'lucide-react';
import { VisualWorkflowNode } from '@/types/visualWorkflow';
import { IntegrationField } from '@/types/integrations';
import { useTenant } from '@/contexts/TenantContext';
import { CredentialsService, TenantCredential } from '@/services/credentialsService';

interface NodeConfigPanelProps {
  node: VisualWorkflowNode;
  onConfigChange: (nodeId: string, config: Record<string, any>) => void;
  onClose: () => void;
}

export function NodeConfigPanel({ node, onConfigChange, onClose }: NodeConfigPanelProps) {
  const { currentTenant } = useTenant();
  const [config, setConfig] = useState(node.data.config || {});
  const [isValid, setIsValid] = useState(false);
  const [availableCredentials, setAvailableCredentials] = useState<TenantCredential[]>([]);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const Icon = node.data.integration.icon;
  const credentialsService = new CredentialsService();

  useEffect(() => {
    // Validate configuration
    const requiredFields = node.data.integration.fields.filter(field => field.required);
    const hasAllRequired = requiredFields.every(field => 
      config[field.name] !== undefined && config[field.name] !== ''
    );
    setIsValid(hasAllRequired);
  }, [config, node.data.integration.fields]);

  useEffect(() => {
    // Load available credentials for this integration
    const loadCredentials = async () => {
      if (!currentTenant) return;
      
      setLoadingCredentials(true);
      try {
        const serviceTypeMap: Record<string, string> = {
          'openai-agent': 'openai',
          'openai-llm': 'openai',
          'claude-agent': 'anthropic',
          'claude-llm': 'anthropic',
          'ai-tool': 'openai', // Default to OpenAI for AI tools
        };

        const serviceType = serviceTypeMap[node.data.integration.id];
        if (serviceType) {
          const credentials = await credentialsService.getCredentialsByService(currentTenant.id, serviceType);
          setAvailableCredentials(credentials);
        }
      } catch (error) {
        console.error('Failed to load credentials:', error);
      } finally {
        setLoadingCredentials(false);
      }
    };

    loadCredentials();
  }, [currentTenant, node.data.integration.id]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSave = () => {
    onConfigChange(node.id, config);
    onClose();
  };

  const handleTest = async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('execute-integration', {
        body: {
          integration: node.data.integration.id,
          config,
          context: {
            workflowId: 'test-workflow',
            stepId: node.id,
            input: { test: true },
            credentials: {},
            previousStepOutputs: {}
          }
        }
      });

      if (error) throw error;

      console.log('Test result:', data);
      
      // Show success/error feedback
      const { toast } = await import('@/hooks/use-toast');
      toast({
        title: data.success ? "Test Successful" : "Test Failed",
        description: data.success 
          ? `Integration executed successfully: ${data.logs?.join(', ')}` 
          : `Error: ${data.error}`,
        variant: data.success ? "default" : "destructive"
      });
      
    } catch (error) {
      console.error('Test failed:', error);
      const { toast } = await import('@/hooks/use-toast');
      toast({
        title: "Test Failed",
        description: `Could not test integration: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const renderField = (field: IntegrationField) => {
    const value = config[field.name] || field.defaultValue || '';

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
        const isCredentialField = field.name === 'credential';
        const options = isCredentialField ? 
          availableCredentials.map(cred => ({ label: cred.name, value: cred.name })) :
          field.options || [];

        return (
          <div>
            <Select
              value={value}
              onValueChange={(newValue) => handleFieldChange(field.name, newValue)}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {loadingCredentials && isCredentialField ? (
                  <SelectItem value="" disabled>Loading credentials...</SelectItem>
                ) : options.length === 0 && isCredentialField ? (
                  <SelectItem value="" disabled>No credentials available</SelectItem>
                ) : (
                  options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {isCredentialField && options.length === 0 && !loadingCredentials && (
              <p className="text-xs text-muted-foreground mt-1">
                No credentials found. <span className="text-primary cursor-pointer">Add a credential</span> to continue.
              </p>
            )}
          </div>
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

        <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {node.data.integration.fields.map((field) => (
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
          
          {/* Show selected credential */}
          {config.credential && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-primary rounded-full" />
                <span className="text-sm font-medium">Credential:</span>
                <Badge variant="outline">{config.credential}</Badge>
              </div>
            </div>
          )}
        </div>
        </ScrollArea>

        <div className="flex space-x-2 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleTest}
            disabled={!isValid}
            className="flex-1"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Test
          </Button>
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