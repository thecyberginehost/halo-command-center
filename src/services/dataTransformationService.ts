export interface DataTransformation {
  type: 'map' | 'filter' | 'sort' | 'group' | 'aggregate' | 'format' | 'validate';
  config: Record<string, any>;
}

export interface TransformationContext {
  input: any;
  previousStepOutputs: Record<string, any>;
  variables: Record<string, any>;
}

export class DataTransformationService {
  
  /**
   * Apply transformations to data
   */
  transform(data: any, transformations: DataTransformation[], context: TransformationContext): any {
    let result = data;
    
    for (const transformation of transformations) {
      result = this.applyTransformation(result, transformation, context);
    }
    
    return result;
  }

  /**
   * Map data using field mappings
   */
  mapData(data: any, mapping: Record<string, string | ((value: any, item: any, context: TransformationContext) => any)>): any {
    if (Array.isArray(data)) {
      return data.map(item => this.mapSingleItem(item, mapping));
    }
    return this.mapSingleItem(data, mapping);
  }

  /**
   * Filter data based on conditions
   */
  filterData(data: any[], conditions: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte' | 'exists';
    value: any;
  }>): any[] {
    return data.filter(item => {
      return conditions.every(condition => {
        const fieldValue = this.getNestedValue(item, condition.field);
        return this.evaluateCondition(fieldValue, condition.operator, condition.value);
      });
    });
  }

  /**
   * Sort data by specified criteria
   */
  sortData(data: any[], sortBy: Array<{ field: string; direction: 'asc' | 'desc' }>): any[] {
    return [...data].sort((a, b) => {
      for (const sort of sortBy) {
        const aValue = this.getNestedValue(a, sort.field);
        const bValue = this.getNestedValue(b, sort.field);
        
        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        if (aValue > bValue) comparison = 1;
        
        if (comparison !== 0) {
          return sort.direction === 'desc' ? -comparison : comparison;
        }
      }
      return 0;
    });
  }

  /**
   * Group data by specified fields
   */
  groupData(data: any[], groupBy: string[]): Record<string, any[]> {
    return data.reduce((groups, item) => {
      const key = groupBy.map(field => this.getNestedValue(item, field)).join('|');
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<string, any[]>);
  }

  /**
   * Aggregate data with functions like sum, count, avg, etc.
   */
  aggregateData(data: any[], aggregations: Array<{
    field: string;
    function: 'sum' | 'count' | 'avg' | 'min' | 'max' | 'first' | 'last';
    alias?: string;
  }>): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const agg of aggregations) {
      const fieldName = agg.alias || `${agg.function}_${agg.field}`;
      const values = data.map(item => this.getNestedValue(item, agg.field)).filter(v => v != null);
      
      switch (agg.function) {
        case 'sum':
          result[fieldName] = values.reduce((sum, val) => sum + (Number(val) || 0), 0);
          break;
        case 'count':
          result[fieldName] = values.length;
          break;
        case 'avg':
          result[fieldName] = values.reduce((sum, val) => sum + (Number(val) || 0), 0) / values.length;
          break;
        case 'min':
          result[fieldName] = Math.min(...values.map(v => Number(v) || 0));
          break;
        case 'max':
          result[fieldName] = Math.max(...values.map(v => Number(v) || 0));
          break;
        case 'first':
          result[fieldName] = values[0];
          break;
        case 'last':
          result[fieldName] = values[values.length - 1];
          break;
      }
    }
    
    return result;
  }

  /**
   * Format data values (dates, numbers, strings)
   */
  formatData(data: any, formatters: Record<string, {
    type: 'date' | 'number' | 'string' | 'currency';
    format: string;
  }>): any {
    if (Array.isArray(data)) {
      return data.map(item => this.formatSingleItem(item, formatters));
    }
    return this.formatSingleItem(data, formatters);
  }

  /**
   * Validate data against schema
   */
  validateData(data: any, schema: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    required?: boolean;
    pattern?: string;
    min?: number;
    max?: number;
  }>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = this.getNestedValue(data, field);
      
      if (rules.required && (value === undefined || value === null)) {
        errors.push(`Field '${field}' is required`);
        continue;
      }
      
      if (value !== undefined && value !== null) {
        if (rules.type && typeof value !== rules.type) {
          errors.push(`Field '${field}' must be of type ${rules.type}`);
        }
        
        if (rules.pattern && typeof value === 'string' && !new RegExp(rules.pattern).test(value)) {
          errors.push(`Field '${field}' does not match pattern ${rules.pattern}`);
        }
        
        if (rules.min !== undefined && Number(value) < rules.min) {
          errors.push(`Field '${field}' must be at least ${rules.min}`);
        }
        
        if (rules.max !== undefined && Number(value) > rules.max) {
          errors.push(`Field '${field}' must be at most ${rules.max}`);
        }
      }
    }
    
    return { valid: errors.length === 0, errors };
  }

  private applyTransformation(data: any, transformation: DataTransformation, context: TransformationContext): any {
    switch (transformation.type) {
      case 'map':
        return this.mapData(data, transformation.config.mapping);
      case 'filter':
        return this.filterData(Array.isArray(data) ? data : [data], transformation.config.conditions);
      case 'sort':
        return this.sortData(Array.isArray(data) ? data : [data], transformation.config.sortBy);
      case 'group':
        return this.groupData(Array.isArray(data) ? data : [data], transformation.config.groupBy);
      case 'aggregate':
        return this.aggregateData(Array.isArray(data) ? data : [data], transformation.config.aggregations);
      case 'format':
        return this.formatData(data, transformation.config.formatters);
      case 'validate':
        const validation = this.validateData(data, transformation.config.schema);
        if (!validation.valid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }
        return data;
      default:
        return data;
    }
  }

  private mapSingleItem(item: any, mapping: Record<string, string | Function>): any {
    const result: any = {};
    
    for (const [targetField, source] of Object.entries(mapping)) {
      if (typeof source === 'function') {
        result[targetField] = source(item[targetField], item, {});
      } else if (typeof source === 'string') {
        result[targetField] = this.getNestedValue(item, source);
      }
    }
    
    return result;
  }

  private formatSingleItem(item: any, formatters: Record<string, any>): any {
    const result = { ...item };
    
    for (const [field, formatter] of Object.entries(formatters)) {
      const value = this.getNestedValue(result, field);
      if (value !== undefined) {
        this.setNestedValue(result, field, this.formatValue(value, formatter));
      }
    }
    
    return result;
  }

  private formatValue(value: any, formatter: { type: string; format: string }): any {
    switch (formatter.type) {
      case 'date':
        return new Date(value).toLocaleDateString(undefined, { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'number':
        return Number(value).toFixed(parseInt(formatter.format) || 0);
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: formatter.format || 'USD'
        }).format(Number(value));
      case 'string':
        return String(value);
      default:
        return value;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!(key in current)) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  private evaluateCondition(value: any, operator: string, target: any): boolean {
    switch (operator) {
      case 'equals':
        return value === target;
      case 'contains':
        return String(value).includes(String(target));
      case 'startsWith':
        return String(value).startsWith(String(target));
      case 'endsWith':
        return String(value).endsWith(String(target));
      case 'gt':
        return Number(value) > Number(target);
      case 'lt':
        return Number(value) < Number(target);
      case 'gte':
        return Number(value) >= Number(target);
      case 'lte':
        return Number(value) <= Number(target);
      case 'exists':
        return value !== undefined && value !== null;
      default:
        return false;
    }
  }
}

export const dataTransformationService = new DataTransformationService();