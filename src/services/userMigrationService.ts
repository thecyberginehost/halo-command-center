import { supabase } from '@/integrations/supabase/client';

// User Migration Service - Phase 5
export interface MigrationPlan {
  id: string;
  name: string;
  description: string;
  source_system: string;
  target_system: string;
  migration_type: 'full' | 'incremental' | 'selective';
  status: 'draft' | 'planned' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  scheduled_start: string;
  estimated_duration: number; // minutes
  actual_duration?: number;
  tenant_id: string;
  steps: MigrationStep[];
  rollback_plan?: MigrationStep[];
  validation_rules: ValidationRule[];
}

export interface MigrationStep {
  id: string;
  name: string;
  description: string;
  type: 'export' | 'transform' | 'validate' | 'import' | 'verify' | 'cleanup';
  order: number;
  dependencies: string[]; // step IDs that must complete first
  config: {
    source_query?: string;
    transformation_rules?: any[];
    validation_checks?: string[];
    target_table?: string;
    batch_size?: number;
    parallel?: boolean;
  };
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  started_at?: string;
  completed_at?: string;
  error_details?: string;
  records_processed?: number;
  records_failed?: number;
}

export interface ValidationRule {
  id: string;
  name: string;
  type: 'data_integrity' | 'completeness' | 'consistency' | 'format' | 'business_logic';
  description: string;
  sql_query?: string;
  expected_result?: any;
  severity: 'error' | 'warning' | 'info';
}

export interface MigrationReport {
  plan_id: string;
  execution_id: string;
  started_at: string;
  completed_at: string;
  status: 'success' | 'partial_success' | 'failed';
  total_records: number;
  migrated_records: number;
  failed_records: number;
  validation_results: ValidationResult[];
  performance_metrics: {
    total_duration: number;
    average_throughput: number;
    peak_memory_usage: number;
    network_io: number;
  };
  issues: MigrationIssue[];
  recommendations: string[];
}

export interface ValidationResult {
  rule_id: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  affected_records?: number;
  details?: any;
}

export interface MigrationIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'data_loss' | 'data_corruption' | 'performance' | 'compatibility' | 'security';
  description: string;
  affected_records: number;
  resolution: string;
  auto_fixable: boolean;
}

export interface DataMapping {
  id: string;
  source_field: string;
  target_field: string;
  transformation: string; // JavaScript function or SQL expression
  required: boolean;
  default_value?: any;
  validation_pattern?: string;
}

class UserMigrationService {
  private static instance: UserMigrationService;

  static getInstance(): UserMigrationService {
    if (!UserMigrationService.instance) {
      UserMigrationService.instance = new UserMigrationService();
    }
    return UserMigrationService.instance;
  }

  // Create migration plan
  async createMigrationPlan(plan: Omit<MigrationPlan, 'id'>): Promise<MigrationPlan> {
    const { data, error } = await supabase
      .from('migration_plans')
      .insert({
        name: plan.name,
        description: plan.description,
        source_system: plan.source_system,
        target_system: plan.target_system,
        migration_type: plan.migration_type,
        scheduled_start: plan.scheduled_start,
        estimated_duration: plan.estimated_duration,
        tenant_id: plan.tenant_id,
        steps: plan.steps as any,
        rollback_plan: plan.rollback_plan as any,
        validation_rules: plan.validation_rules as any
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      migration_type: data.migration_type as MigrationPlan['migration_type'],
      steps: Array.isArray(data.steps) ? data.steps as unknown as MigrationStep[] : [],
      rollback_plan: Array.isArray(data.rollback_plan) ? data.rollback_plan as unknown as MigrationStep[] : undefined,
      validation_rules: Array.isArray(data.validation_rules) ? data.validation_rules as unknown as ValidationRule[] : []
    } as MigrationPlan;
  }

  // Generate migration plan from system analysis
  async generateMigrationPlan(
    sourceSystem: string,
    targetSystem: string,
    tenantId: string,
    options: {
      migrationType: 'full' | 'incremental' | 'selective';
      includeData: boolean;
      includeConfigs: boolean;
      includeUsers: boolean;
      includeWorkflows: boolean;
    }
  ): Promise<MigrationPlan> {
    // Analyze source system
    const sourceAnalysis = await this.analyzeSourceSystem(sourceSystem, tenantId);
    
    // Generate migration steps
    const steps: MigrationStep[] = [];
    let stepOrder = 1;

    // Step 1: Export data from source
    if (options.includeData) {
      steps.push({
        id: `export_data_${stepOrder}`,
        name: 'Export Data',
        description: 'Export data from source system',
        type: 'export',
        order: stepOrder++,
        dependencies: [],
        config: {
          source_query: this.generateExportQuery(sourceAnalysis),
          batch_size: 1000
        },
        status: 'pending'
      });
    }

    // Step 2: Transform data
    steps.push({
      id: `transform_data_${stepOrder}`,
      name: 'Transform Data',
      description: 'Transform data to target format',
      type: 'transform',
      order: stepOrder++,
      dependencies: options.includeData ? [`export_data_${stepOrder - 1}`] : [],
      config: {
        transformation_rules: this.generateTransformationRules(sourceAnalysis, targetSystem)
      },
      status: 'pending'
    });

    // Step 3: Validate data
    steps.push({
      id: `validate_data_${stepOrder}`,
      name: 'Validate Data',
      description: 'Validate transformed data',
      type: 'validate',
      order: stepOrder++,
      dependencies: [`transform_data_${stepOrder - 1}`],
      config: {
        validation_checks: this.generateValidationChecks(targetSystem)
      },
      status: 'pending'
    });

    // Step 4: Import to target
    steps.push({
      id: `import_data_${stepOrder}`,
      name: 'Import Data',
      description: 'Import data to target system',
      type: 'import',
      order: stepOrder++,
      dependencies: [`validate_data_${stepOrder - 1}`],
      config: {
        target_table: 'migrated_data',
        batch_size: 500
      },
      status: 'pending'
    });

    // Step 5: Verify migration
    steps.push({
      id: `verify_migration_${stepOrder}`,
      name: 'Verify Migration',
      description: 'Verify migration completeness and accuracy',
      type: 'verify',
      order: stepOrder++,
      dependencies: [`import_data_${stepOrder - 1}`],
      config: {
        validation_checks: ['record_count', 'data_integrity', 'referential_integrity']
      },
      status: 'pending'
    });

    // Generate validation rules
    const validationRules: ValidationRule[] = [
      {
        id: 'record_count_validation',
        name: 'Record Count Validation',
        type: 'completeness',
        description: 'Verify all records were migrated',
        sql_query: 'SELECT COUNT(*) FROM source_table = COUNT(*) FROM target_table',
        severity: 'error'
      },
      {
        id: 'data_integrity_validation',
        name: 'Data Integrity Validation',
        type: 'data_integrity',
        description: 'Verify data integrity constraints',
        sql_query: 'SELECT * FROM target_table WHERE id IS NULL OR name IS NULL',
        expected_result: 0,
        severity: 'error'
      }
    ];

    const plan: MigrationPlan = {
      id: `plan_${Date.now()}`,
      name: `Migration from ${sourceSystem} to ${targetSystem}`,
      description: `Automated migration plan generated for ${options.migrationType} migration`,
      source_system: sourceSystem,
      target_system: targetSystem,
      migration_type: options.migrationType,
      status: 'draft',
      scheduled_start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      estimated_duration: steps.length * 30, // 30 minutes per step estimate
      tenant_id: tenantId,
      steps,
      validation_rules: validationRules
    };

    return await this.createMigrationPlan(plan);
  }

  // Execute migration plan
  async executeMigrationPlan(planId: string): Promise<MigrationReport> {
    const { data: plan, error } = await supabase
      .from('migration_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error) throw error;

    const executionId = `exec_${Date.now()}`;
    const startTime = new Date().toISOString();

    // Update plan status
    await supabase
      .from('migration_plans')
      .update({ status: 'in_progress' })
      .eq('id', planId);

    const report: MigrationReport = {
      plan_id: planId,
      execution_id: executionId,
      started_at: startTime,
      completed_at: '',
      status: 'success',
      total_records: 0,
      migrated_records: 0,
      failed_records: 0,
      validation_results: [],
      performance_metrics: {
        total_duration: 0,
        average_throughput: 0,
        peak_memory_usage: 0,
        network_io: 0
      },
      issues: [],
      recommendations: []
    };

    try {
      // Execute steps in order
      const steps = Array.isArray(plan.steps) ? plan.steps as unknown as MigrationStep[] : [];
      const sortedSteps = steps.sort((a: MigrationStep, b: MigrationStep) => a.order - b.order);
      
      for (const step of sortedSteps) {
        // Check dependencies
        if (!await this.checkStepDependencies(step, sortedSteps)) {
          step.status = 'skipped';
          continue;
        }

        // Execute step
        const typedPlan: MigrationPlan = {
          ...plan,
          migration_type: plan.migration_type as MigrationPlan['migration_type'],
          status: plan.status as MigrationPlan['status'],
          steps: Array.isArray(plan.steps) ? plan.steps as unknown as MigrationStep[] : [],
          rollback_plan: Array.isArray(plan.rollback_plan) ? plan.rollback_plan as unknown as MigrationStep[] : undefined,
          validation_rules: Array.isArray(plan.validation_rules) ? plan.validation_rules as unknown as ValidationRule[] : []
        };
        const stepResult = await this.executeStep(step, typedPlan);
        
        if (stepResult.status === 'failed') {
          report.status = 'failed';
          report.issues.push({
            severity: 'critical',
            category: 'data_corruption',
            description: `Step ${step.name} failed: ${stepResult.error}`,
            affected_records: stepResult.records_failed || 0,
            resolution: 'Review step configuration and retry',
            auto_fixable: false
          });
          break;
        }

        report.total_records += stepResult.records_processed || 0;
        report.migrated_records += stepResult.records_processed || 0;
        report.failed_records += stepResult.records_failed || 0;
      }

      // Run validation
      const validationRules = Array.isArray(plan.validation_rules) ? plan.validation_rules as unknown as ValidationRule[] : [];
      for (const rule of validationRules) {
        const validationResult = await this.executeValidationRule(rule);
        report.validation_results.push(validationResult);
        
        if (validationResult.status === 'failed' && rule.severity === 'error') {
          report.status = 'failed';
        }
      }

      // Generate recommendations
      report.recommendations = this.generateRecommendations(report);

    } catch (error) {
      report.status = 'failed';
      report.issues.push({
        severity: 'critical',
        category: 'data_corruption',
        description: `Migration failed: ${error}`,
        affected_records: 0,
        resolution: 'Review migration plan and system status',
        auto_fixable: false
      });
    }

    const endTime = new Date().toISOString();
    report.completed_at = endTime;
    report.performance_metrics.total_duration = 
      new Date(endTime).getTime() - new Date(startTime).getTime();

    // Update plan status
    await supabase
      .from('migration_plans')
      .update({ 
        status: report.status === 'success' ? 'completed' : 'failed',
        actual_duration: report.performance_metrics.total_duration / 1000 / 60 // minutes
      })
      .eq('id', planId);

    // Store migration report - using system_knowledge_base as temporary storage
    await supabase
      .from('system_knowledge_base')
      .insert({
        title: `Migration Report: ${executionId}`,
        content: JSON.stringify(report),
        category: 'migration_report'
      });

    return report;
  }

  // Create data mapping
  async createDataMapping(
    sourceSystem: string,
    targetSystem: string,
    tenantId: string
  ): Promise<DataMapping[]> {
    // Analyze source and target schemas
    const sourceSchema = await this.analyzeSchema(sourceSystem);
    const targetSchema = await this.analyzeSchema(targetSystem);

    const mappings: DataMapping[] = [];

    // Auto-generate mappings based on field names and types
    for (const sourceField of sourceSchema.fields) {
      const targetField = this.findMatchingField(sourceField, targetSchema.fields);
      
      if (targetField) {
        mappings.push({
          id: `mapping_${sourceField.name}_${targetField.name}`,
          source_field: sourceField.name,
          target_field: targetField.name,
          transformation: this.generateTransformation(sourceField, targetField),
          required: targetField.required,
          validation_pattern: targetField.validation_pattern
        });
      }
    }

    // Store mappings
    await supabase
      .from('data_mappings')
      .insert({
        source_integration: sourceSystem,
        target_integration: targetSystem,
        mappings: mappings as any,
        tenant_id: tenantId
      });

    return mappings;
  }

  // Rollback migration
  async rollbackMigration(planId: string): Promise<boolean> {
    const { data: plan, error } = await supabase
      .from('migration_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error) throw error;

    if (!plan.rollback_plan) {
      throw new Error('No rollback plan available');
    }

    try {
      // Execute rollback steps
      const rollbackSteps = Array.isArray(plan.rollback_plan) ? plan.rollback_plan as unknown as MigrationStep[] : [];
      const typedPlan: MigrationPlan = {
        ...plan,
        migration_type: plan.migration_type as MigrationPlan['migration_type'],
        status: plan.status as MigrationPlan['status'],
        steps: Array.isArray(plan.steps) ? plan.steps as unknown as MigrationStep[] : [],
        rollback_plan: rollbackSteps,
        validation_rules: Array.isArray(plan.validation_rules) ? plan.validation_rules as unknown as ValidationRule[] : []
      };
      for (const step of rollbackSteps.sort((a: MigrationStep, b: MigrationStep) => a.order - b.order)) {
        await this.executeStep(step, typedPlan);
      }

      // Update plan status
      await supabase
        .from('migration_plans')
        .update({ status: 'cancelled' })
        .eq('id', planId);

      return true;
    } catch (error) {
      console.error('Rollback failed:', error);
      return false;
    }
  }

  // Get migration status
  async getMigrationStatus(planId: string): Promise<any> {
    const { data: plan, error } = await supabase
      .from('migration_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error) throw error;

    const { data: reports } = await supabase
      .from('migration_reports')
      .select('*')
      .eq('plan_id', planId)
      .order('created_at', { ascending: false })
      .limit(1);

    const planSteps = Array.isArray(plan.steps) ? plan.steps as unknown as MigrationStep[] : [];
    return {
      plan: plan,
      latest_report: reports?.[0] || null,
      progress: this.calculateProgress(planSteps)
    };
  }

  // Helper methods
  private async analyzeSourceSystem(sourceSystem: string, tenantId: string): Promise<any> {
    // Mock analysis - would perform real system analysis
    return {
      system_type: sourceSystem,
      version: '1.0.0',
      tables: ['users', 'workflows', 'integrations'],
      record_counts: { users: 1000, workflows: 50, integrations: 25 },
      schema_version: '2024-01-01',
      constraints: ['foreign_keys', 'unique_constraints']
    };
  }

  private generateExportQuery(sourceAnalysis: any): string {
    return `SELECT * FROM ${sourceAnalysis.tables.join(' UNION ALL SELECT * FROM ')}`;
  }

  private generateTransformationRules(sourceAnalysis: any, targetSystem: string): any[] {
    return [
      { field: 'created_at', rule: 'format_timestamp' },
      { field: 'user_id', rule: 'generate_uuid' },
      { field: 'status', rule: 'map_status_values' }
    ];
  }

  private generateValidationChecks(targetSystem: string): string[] {
    return [
      'check_not_null',
      'check_data_types',
      'check_referential_integrity',
      'check_business_rules'
    ];
  }

  private async checkStepDependencies(step: MigrationStep, allSteps: MigrationStep[]): Promise<boolean> {
    for (const depId of step.dependencies) {
      const depStep = allSteps.find(s => s.id === depId);
      if (!depStep || depStep.status !== 'completed') {
        return false;
      }
    }
    return true;
  }

  private async executeStep(step: MigrationStep, plan: MigrationPlan): Promise<any> {
    const startTime = new Date().toISOString();
    
    try {
      // Mock step status update - migration_steps table doesn't exist
      console.log(`Starting step ${step.id}: ${step.name}`);

      let result;
      
      switch (step.type) {
        case 'export':
          result = await this.executeExportStep(step, plan);
          break;
        case 'transform':
          result = await this.executeTransformStep(step, plan);
          break;
        case 'validate':
          result = await this.executeValidateStep(step, plan);
          break;
        case 'import':
          result = await this.executeImportStep(step, plan);
          break;
        case 'verify':
          result = await this.executeVerifyStep(step, plan);
          break;
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      const endTime = new Date().toISOString();
      
      // Mock step completion update
      console.log(`Completed step ${step.id}: ${step.name}`);

      return { status: 'completed', ...result };
    } catch (error) {
      const endTime = new Date().toISOString();
      
      // Mock step failure update
      console.log(`Failed step ${step.id}: ${step.name}`, error);

      return { status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async executeExportStep(step: MigrationStep, plan: MigrationPlan): Promise<any> {
    // Mock export - would perform real data export
    return { records_processed: 1000 };
  }

  private async executeTransformStep(step: MigrationStep, plan: MigrationPlan): Promise<any> {
    // Mock transform - would perform real data transformation
    return { records_processed: 1000 };
  }

  private async executeValidateStep(step: MigrationStep, plan: MigrationPlan): Promise<any> {
    // Mock validation - would perform real data validation
    return { records_processed: 1000, validation_errors: 0 };
  }

  private async executeImportStep(step: MigrationStep, plan: MigrationPlan): Promise<any> {
    // Mock import - would perform real data import
    return { records_processed: 1000 };
  }

  private async executeVerifyStep(step: MigrationStep, plan: MigrationPlan): Promise<any> {
    // Mock verification - would perform real verification
    return { records_processed: 1000, verification_passed: true };
  }

  private async executeValidationRule(rule: ValidationRule): Promise<ValidationResult> {
    // Mock validation - would execute real validation rules
    return {
      rule_id: rule.id,
      status: 'passed',
      message: 'Validation passed successfully'
    };
  }

  private generateRecommendations(report: MigrationReport): string[] {
    const recommendations: string[] = [];

    if (report.failed_records > 0) {
      recommendations.push('Review failed records and consider data cleanup');
    }

    if (report.performance_metrics.total_duration > 60 * 60 * 1000) { // > 1 hour
      recommendations.push('Consider increasing batch sizes or parallelization for better performance');
    }

    if (report.validation_results.some(r => r.status === 'warning')) {
      recommendations.push('Address validation warnings to ensure data quality');
    }

    return recommendations;
  }

  private async analyzeSchema(system: string): Promise<any> {
    // Mock schema analysis
    return {
      fields: [
        { name: 'id', type: 'uuid', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'string', required: false, validation_pattern: '^[^@]+@[^@]+\.[^@]+$' },
        { name: 'created_at', type: 'timestamp', required: true }
      ]
    };
  }

  private findMatchingField(sourceField: any, targetFields: any[]): any {
    // Simple name matching - would use more sophisticated matching in production
    return targetFields.find(tf => tf.name.toLowerCase() === sourceField.name.toLowerCase());
  }

  private generateTransformation(sourceField: any, targetField: any): string {
    if (sourceField.type !== targetField.type) {
      return `CAST(${sourceField.name} AS ${targetField.type})`;
    }
    return sourceField.name;
  }

  private calculateProgress(steps: MigrationStep[]): number {
    const completedSteps = steps.filter(s => s.status === 'completed').length;
    return (completedSteps / steps.length) * 100;
  }
}

export const userMigrationService = UserMigrationService.getInstance();