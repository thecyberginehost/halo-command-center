export interface HaloNodeProperty {
  displayName: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'options' | 'json' | 'collection';
  default?: any;
  required?: boolean;
  description?: string;
  placeholder?: string;
  options?: Array<{
    name: string;
    value: string | number;
    displayName?: string;
  }>;
  typeOptions?: {
    multipleValues?: boolean;
    multipleValueButtonText?: string;
    rows?: number;
    readOnly?: boolean;
  };
  displayOptions?: {
    show?: Record<string, any>;
    hide?: Record<string, any>;
  };
}

export interface HaloNodeCredential {
  name: string;
  required?: boolean;
  displayOptions?: {
    show?: Record<string, any>;
    hide?: Record<string, any>;
  };
}

export interface HaloNodeExecutionData {
  json: Record<string, any>;
  binary?: Record<string, any>;
}

export interface HaloNodeExecuteContext {
  getInputData(): HaloNodeExecutionData[];
  getNodeParameter(parameterName: string, itemIndex?: number): any;
  getCredentials(type: string): Record<string, any> | undefined;
  helpers: {
    request: (options: any) => Promise<any>;
  };
}

export interface HaloNodeDefinition {
  displayName: string;
  name: string;
  icon: string;
  darkIcon?: string;
  group: string[];
  version: number;
  description: string;
  defaults: {
    name: string;
    color: string;
  };
  inputs: string[];
  outputs: string[];
  credentials?: HaloNodeCredential[];
  properties: HaloNodeProperty[];
  execute(context: HaloNodeExecuteContext): Promise<HaloNodeExecutionData[][]>;
}

export interface NodeRegistryEntry extends HaloNodeDefinition {
  iconUrl: string;
  darkIconUrl?: string;
}