import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { X, TestTube, Key } from 'lucide-react';
import { IntegrationNode, ConfigField } from '@/types/integrations';
import * as Icons from 'lucide-react';

interface NodeConfigurationPanelProps {
  integration: IntegrationNode | null;
  onClose: () => void;
  onSave: (config: Record<string, any>) => void;
  onTest?: (config: Record<string, any>) => Promise<boolean>;
}

export const NodeConfigurationPanel = ({ 
  integration, 
  onClose, 
  onSave, 
  onTest 
}: NodeConfigurationPanelProps) => {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  if (!integration) return null;

  const IconComponent = Icons[integration.icon as keyof typeof Icons] as any;

  const handleInputChange = (fieldKey: string, value: any) => {
    setConfig(prev => ({ ...prev, [fieldKey]: value }));
    // Clear error when user starts typing
    if (errors[fieldKey]) {
      setErrors(prev => ({ ...prev, [fieldKey]: '' }));
    }
  };

  const validateField = (fieldKey: string, field: ConfigField, value: any): string => {
    if (field.required && (!value || value.toString().trim() === '')) {
      return `${field.label} is required`;
    }

    if (field.validation) {
      if (field.validation.pattern && value) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(value)) {
          return `${field.label} format is invalid`;
        }
      }

      if (field.validation.minLength && value && value.length < field.validation.minLength) {
        return `${field.label} must be at least ${field.validation.minLength} characters`;
      }

      if (field.validation.maxLength && value && value.length > field.validation.maxLength) {
        return `${field.label} must be no more than ${field.validation.maxLength} characters`;
      }
    }

    return '';
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    
    Object.entries(integration.configSchema).forEach(([fieldKey, field]) => {
      const error = validateField(fieldKey, field, config[fieldKey]);
      if (error) {
        newErrors[fieldKey] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSave(config);
      onClose();
    }
  };

  const handleTest = async () => {
    if (!onTest) return;

    setIsTesting(true);
    setTestResult(null);

    try {
      const success = await onTest(config);
      setTestResult(success ? 'success' : 'error');
    } catch (error) {
      setTestResult('error');
    } finally {
      setIsTesting(false);
    }
  };

  const renderField = (fieldKey: string, field: ConfigField) => {
    const value = config[fieldKey] || '';
    const error = errors[fieldKey];

    const commonProps = {
      id: fieldKey,
      value,
      placeholder: field.placeholder,
      className: error ? 'border-red-500' : ''
    };

    return (
      <div key={fieldKey} className="space-y-2">
        <Label htmlFor={fieldKey} className="text-sm font-medium flex items-center gap-2">
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
        </Label>
        
        {field.type === 'text' && (
          <Input
            {...commonProps}
            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
          />
        )}
        
        {field.type === 'email' && (
          <Input
            {...commonProps}
            type="email"
            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
          />
        )}
        
        {field.type === 'password' && (
          <div className="relative">
            <Input
              {...commonProps}
              type="password"
              onChange={(e) => handleInputChange(fieldKey, e.target.value)}
            />
            <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        )}
        
        {field.type === 'number' && (
          <Input
            {...commonProps}
            type="number"
            onChange={(e) => handleInputChange(fieldKey, parseFloat(e.target.value) || 0)}
          />
        )}
        
        {field.type === 'textarea' && (
          <Textarea
            {...commonProps}
            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
            rows={3}
          />
        )}
        
        {field.type === 'select' && (
          <Select value={value} onValueChange={(val) => handleInputChange(fieldKey, val)}>
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        {field.type === 'boolean' && (
          <div className="flex items-center space-x-2">
            <Switch
              id={fieldKey}
              checked={value}
              onCheckedChange={(checked) => handleInputChange(fieldKey, checked)}
            />
            <Label htmlFor={fieldKey} className="text-sm">
              {field.placeholder || field.label}
            </Label>
          </div>
        )}
        
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l shadow-lg z-50">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${integration.color}`}>
            <IconComponent className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-halo-text">{integration.name}</h3>
            <Badge variant={integration.type === 'trigger' ? 'default' : 'secondary'}>
              {integration.type}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-halo-textSecondary mb-4">
              {integration.description}
            </p>
            
            {integration.requiresAuth && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <Key className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Authentication Required</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  This integration requires {integration.authType?.replace('_', ' ')} authentication.
                </p>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-halo-text">Configuration</h4>
            {Object.entries(integration.configSchema).map(([fieldKey, field]) =>
              renderField(fieldKey, field)
            )}
          </div>

          {testResult && (
            <div className={`p-3 rounded-lg ${
              testResult === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm ${
                testResult === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult === 'success' ? 'Connection test successful!' : 'Connection test failed. Please check your configuration.'}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t space-y-2">
        {onTest && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleTest}
            disabled={isTesting}
          >
            {isTesting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2" />
                Testing...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Test Connection
              </>
            )}
          </Button>
        )}
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-halo-primary hover:bg-halo-primary/90">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};