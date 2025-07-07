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

interface NodeConfigPanelProps {
  node: VisualWorkflowNode;
  onConfigChange: (nodeId: string, config: Record<string, any>) => void;
  onClose: () => void;
}

export function NodeConfigPanel({ node, onConfigChange, onClose }: NodeConfigPanelProps) {
  const [config, setConfig] = useState(node.data.config || {});
  const [isValid, setIsValid] = useState(false);
  const Icon = node.data.integration.icon;

  useEffect(() => {
    // Validate configuration
    const requiredFields = node.data.integration.fields.filter(field => field.required);
    const hasAllRequired = requiredFields.every(field => 
      config[field.name] !== undefined && config[field.name] !== ''
    );
    setIsValid(hasAllRequired);
  }, [config, node.data.integration.fields]);

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

  const handleTest = () => {
    // TODO: Implement node testing
    console.log('Testing node with config:', config);
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
        return (
          <Select
            value={value}
            onValueChange={(newValue) => handleFieldChange(field.name, newValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
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