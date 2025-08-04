import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Settings, 
  Code,
  TestTube,
  Info
} from 'lucide-react';
import { VisualWorkflowNode } from '@/types/visualWorkflow';

interface ConfigurationPanelProps {
  node: VisualWorkflowNode;
  onConfigChange: (nodeId: string, config: Record<string, any>) => void;
  onClose: () => void;
}

export function ConfigurationPanel({ node, onConfigChange, onClose }: ConfigurationPanelProps) {
  const [config, setConfig] = useState(node.data.config || {});
  const [activeTab, setActiveTab] = useState('basic');
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const { integration, haloNode, isConfigured, hasError, errorMessage } = node.data;
  const nodeData = haloNode || integration;
  const Icon = haloNode ? undefined : integration?.icon;
  const iconUrl = haloNode?.iconUrl;

  useEffect(() => {
    setConfig(node.data.config || {});
  }, [node.data.config]);

  const handleConfigSave = () => {
    onConfigChange(node.id, config);
  };

  const handleTestConnection = async () => {
    setIsTestRunning(true);
    setTestResult(null);

    // Simulate test
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isValid = Object.keys(config).length > 0;
      setTestResult({
        success: isValid,
        message: isValid 
          ? 'Configuration test passed successfully' 
          : 'Please configure required fields'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Test failed: ' + (error as Error).message
      });
    } finally {
      setIsTestRunning(false);
    }
  };

  const renderBasicConfig = () => {
    const fields = (nodeData as any).properties || [];
    
    return (
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-sm font-medium flex items-center">
              {field.displayName || field.name}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}

            {field.type === 'string' && field.options ? (
              <Select
                value={config[field.name] || ''}
                onValueChange={(value) => setConfig(prev => ({ ...prev, [field.name]: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder || `Select ${field.displayName}`} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === 'boolean' ? (
              <div className="flex items-center space-x-2">
                <Switch
                  id={field.name}
                  checked={config[field.name] || false}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, [field.name]: checked }))}
                />
                <Label htmlFor={field.name} className="text-sm">
                  {field.displayName || field.name}
                </Label>
              </div>
            ) : field.type === 'text' ? (
              <Textarea
                id={field.name}
                value={config[field.name] || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, [field.name]: e.target.value }))}
                placeholder={field.placeholder}
                rows={3}
              />
            ) : (
              <Input
                id={field.name}
                type={field.type === 'number' ? 'number' : field.type === 'password' ? 'password' : 'text'}
                value={config[field.name] || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, [field.name]: e.target.value }))}
                placeholder={field.placeholder}
              />
            )}
          </div>
        ))}

        {fields.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="h-8 w-8 mx-auto mb-2" />
            <p>No configuration required for this integration</p>
          </div>
        )}
      </div>
    );
  };

  const renderAdvancedConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="timeout">Timeout (seconds)</Label>
        <Input
          id="timeout"
          type="number"
          value={config.timeout || 30}
          onChange={(e) => setConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
          min="1"
          max="300"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="retries">Retry Attempts</Label>
        <Input
          id="retries"
          type="number"
          value={config.retries || 3}
          onChange={(e) => setConfig(prev => ({ ...prev, retries: parseInt(e.target.value) }))}
          min="0"
          max="10"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="enabled"
          checked={config.enabled !== false}
          onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
        />
        <Label htmlFor="enabled">Enable this step</Label>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={config.notes || ''}
          onChange={(e) => setConfig(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Add notes about this configuration..."
          rows={3}
        />
      </div>
    </div>
  );

  const renderCodeConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="customCode">Custom JavaScript Code</Label>
        <p className="text-xs text-muted-foreground">
          Write custom code to transform data or add custom logic
        </p>
        <Textarea
          id="customCode"
          value={config.customCode || ''}
          onChange={(e) => setConfig(prev => ({ ...prev, customCode: e.target.value }))}
          placeholder={`// Example:
async function transform(data) {
  // Your custom logic here
  return data;
}`}
          rows={10}
          className="font-mono text-sm"
        />
      </div>
    </div>
  );

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-background border-l shadow-xl z-50 animate-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="p-2 rounded-lg"
              style={{ 
                backgroundColor: (nodeData as any).color || (nodeData as any).defaults?.color + '20' || '#3B82F620',
                border: `1px solid ${(nodeData as any).color || (nodeData as any).defaults?.color + '40' || '#3B82F640'}`
              }}
            >
              {Icon && (
                <Icon 
                  className="h-5 w-5" 
                  style={{ color: (nodeData as any).color || (nodeData as any).defaults?.color || '#3B82F6' }}
                />
              )}
              {!Icon && iconUrl && (
                <img src={iconUrl} alt="" className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm">{(nodeData as any).displayName || (nodeData as any).name}</h3>
              <p className="text-xs text-muted-foreground">{(nodeData as any).description}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Status */}
        <div className="flex items-center space-x-2 mt-3">
          <Badge 
            variant={(nodeData as any).type === 'trigger' || (nodeData as any).group?.includes('trigger') ? 'default' : 'secondary'}
            className="text-xs"
          >
            {(nodeData as any).type || 'action'}
          </Badge>
          
          {isConfigured ? (
            <Badge variant="outline" className="text-xs text-green-600 border-green-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Configured
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              Needs Configuration
            </Badge>
          )}
        </div>

        {hasError && errorMessage && (
          <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Configuration Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4 mx-4 mt-4">
            <TabsTrigger value="basic" className="text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Basic
            </TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs">
              <Info className="h-3 w-3 mr-1" />
              Advanced
            </TabsTrigger>
            <TabsTrigger value="code" className="text-xs">
              <Code className="h-3 w-3 mr-1" />
              Code
            </TabsTrigger>
            <TabsTrigger value="test" className="text-xs">
              <TestTube className="h-3 w-3 mr-1" />
              Test
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="basic" className="h-full">
              <ScrollArea className="h-full px-4">
                <div className="py-4">
                  {renderBasicConfig()}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="advanced" className="h-full">
              <ScrollArea className="h-full px-4">
                <div className="py-4">
                  {renderAdvancedConfig()}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="code" className="h-full">
              <ScrollArea className="h-full px-4">
                <div className="py-4">
                  {renderCodeConfig()}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="test" className="h-full">
              <div className="p-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Test Configuration</CardTitle>
                    <CardDescription className="text-xs">
                      Test your configuration to ensure it works correctly
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={handleTestConnection}
                      disabled={isTestRunning}
                      className="w-full"
                    >
                      {isTestRunning ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <TestTube className="h-4 w-4 mr-2" />
                          Run Test
                        </>
                      )}
                    </Button>

                    {testResult && (
                      <div className={`mt-3 p-3 rounded border text-sm ${
                        testResult.success 
                          ? 'bg-green-50 border-green-200 text-green-800' 
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}>
                        <div className="flex items-center">
                          {testResult.success ? (
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                          ) : (
                            <AlertCircle className="h-4 w-4 mr-2" />
                          )}
                          {testResult.message}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex space-x-2">
          <Button onClick={handleConfigSave} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}