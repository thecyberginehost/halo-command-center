import { supabase } from '@/integrations/supabase/client';

export interface IntegrationMigration {
  id: string;
  tenant_id: string;
  migration_batch_id: string;
  source_integration_id: string;
  target_integration_id: string;
  migration_type: string;
  workflow_count: number;
  credentials_count: number;
  migration_status: string;
  migration_config: any;
  migration_log: any[];
  error_details?: any;
  backup_data?: any;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowConversion {
  id: string;
  tenant_id: string;
  migration_id: string;
  workflow_id: string;
  original_steps: any;
  converted_steps?: any;
  conversion_status: string;
  conversion_notes?: string;
  validation_results?: any;
  manual_review_required: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MigrationPlan {
  migration_batch_id: string;
  migrations: {
    source_integration_id: string;
    target_integration_id: string;
    affected_workflows: string[];
    affected_credentials: string[];
    estimated_duration: number;
    complexity_score: number;
    risks: string[];
  }[];
  total_workflows: number;
  total_credentials: number;
  estimated_total_duration: number;
  recommended_schedule: string;
}

export class MigrationService {

  /**
   * Analyze what needs to be migrated
   */
  async analyzeMigrationNeeds(tenantId: string): Promise<{
    stub_integrations: string[];
    outdated_integrations: string[];
    migration_opportunities: any[];
  }> {
    // Get all workflows for the tenant
    const { data: workflows, error: workflowsError } = await supabase
      .from('workflows')
      .select('id, name, steps')
      .eq('tenant_id', tenantId);

    if (workflowsError) {
      console.error('Error fetching workflows:', workflowsError);
      throw workflowsError;
    }

    const stubIntegrations = new Set<string>();
    const outdatedIntegrations = new Set<string>();
    const migrationOpportunities: any[] = [];

    // Analyze workflows for integration usage
    workflows?.forEach(workflow => {
      const steps = workflow.steps as any[];
      (steps as any[])?.forEach(step => {
        if (step.type === 'integration') {
          const integrationId = step.integrationId;
          
          // Check if this is a stub integration (basic implementation)
          if (this.isStubIntegration(integrationId)) {
            stubIntegrations.add(integrationId);
            migrationOpportunities.push({
              type: 'stub_to_full',
              source: integrationId,
              target: this.getFullIntegrationId(integrationId),
              workflow_id: workflow.id,
              workflow_name: workflow.name,
              estimated_effort: 'low'
            });
          }
          
          // Check if this integration has a newer version
          const newerVersion = this.checkForNewerVersion(integrationId);
          if (newerVersion) {
            outdatedIntegrations.add(integrationId);
            migrationOpportunities.push({
              type: 'version_upgrade',
              source: integrationId,
              target: newerVersion,
              workflow_id: workflow.id,
              workflow_name: workflow.name,
              estimated_effort: 'medium'
            });
          }
        }
      });
    });

    return {
      stub_integrations: Array.from(stubIntegrations),
      outdated_integrations: Array.from(outdatedIntegrations),
      migrationOpportunities
    };
  }

  /**
   * Create a migration plan
   */
  async createMigrationPlan(
    tenantId: string,
    migrationRequests: {
      source_integration_id: string;
      target_integration_id: string;
      migration_type: IntegrationMigration['migration_type'];
    }[]
  ): Promise<MigrationPlan> {
    const migrationBatchId = crypto.randomUUID();
    const migrations: MigrationPlan['migrations'] = [];
    
    let totalWorkflows = 0;
    let totalCredentials = 0;
    let estimatedTotalDuration = 0;

    for (const request of migrationRequests) {
      // Find affected workflows
      const { data: workflows } = await supabase
        .from('workflows')
        .select('id, name, steps')
        .eq('tenant_id', tenantId);

      const affectedWorkflows = workflows?.filter(workflow => {
        const steps = workflow.steps as any[];
        return steps?.some(step => 
          step.type === 'integration' && 
          step.integrationId === request.source_integration_id
        );
      }).map(w => w.id) || [];

      // Find affected credentials
      const { data: credentials } = await supabase
        .from('tenant_credentials')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('service_type', request.source_integration_id);

      const affectedCredentials = credentials?.map(c => c.id) || [];

      // Calculate complexity and risks
      const complexityScore = this.calculateComplexityScore(
        request.migration_type,
        affectedWorkflows.length,
        affectedCredentials.length
      );

      const risks = this.identifyMigrationRisks(
        request.source_integration_id,
        request.target_integration_id,
        request.migration_type
      );

      const estimatedDuration = this.estimateMigrationDuration(
        request.migration_type,
        affectedWorkflows.length,
        complexityScore
      );

      migrations.push({
        source_integration_id: request.source_integration_id,
        target_integration_id: request.target_integration_id,
        affected_workflows: affectedWorkflows,
        affected_credentials: affectedCredentials,
        estimated_duration: estimatedDuration,
        complexity_score: complexityScore,
        risks
      });

      totalWorkflows += affectedWorkflows.length;
      totalCredentials += affectedCredentials.length;
      estimatedTotalDuration += estimatedDuration;
    }

    return {
      migration_batch_id: migrationBatchId,
      migrations,
      total_workflows: totalWorkflows,
      total_credentials: totalCredentials,
      estimated_total_duration: estimatedTotalDuration,
      recommended_schedule: this.recommendSchedule(estimatedTotalDuration, migrations.length)
    };
  }

  /**
   * Execute migration plan
   */
  async executeMigrationPlan(
    tenantId: string,
    migrationPlan: MigrationPlan,
    options?: {
      dry_run?: boolean;
      auto_approve?: boolean;
    }
  ): Promise<IntegrationMigration[]> {
    const migrations: IntegrationMigration[] = [];

    for (const migration of migrationPlan.migrations) {
      // Create migration record
      const { data: migrationRecord, error } = await supabase
        .from('integration_migrations')
        .insert({
          tenant_id: tenantId,
          migration_batch_id: migrationPlan.migration_batch_id,
          source_integration_id: migration.source_integration_id,
          target_integration_id: migration.target_integration_id,
          migration_type: this.inferMigrationType(migration.source_integration_id, migration.target_integration_id),
          workflow_count: migration.affected_workflows.length,
          credentials_count: migration.affected_credentials.length,
          migration_config: {
            dry_run: options?.dry_run || false,
            auto_approve: options?.auto_approve || false,
            complexity_score: migration.complexity_score,
            risks: migration.risks
          },
          migration_log: [
            {
              timestamp: new Date().toISOString(),
              level: 'info',
              message: 'Migration created',
              details: { estimated_duration: migration.estimated_duration }
            }
          ]
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating migration record:', error);
        throw error;
      }

      migrations.push(migrationRecord);

      // Create workflow conversion records
      for (const workflowId of migration.affected_workflows) {
        await this.createWorkflowConversion(tenantId, migrationRecord.id, workflowId);
      }

      // Start migration if not dry run
      if (!options?.dry_run) {
        await this.startMigration(migrationRecord.id);
      }
    }

    return migrations;
  }

  /**
   * Create workflow conversion record
   */
  private async createWorkflowConversion(
    tenantId: string,
    migrationId: string,
    workflowId: string
  ): Promise<WorkflowConversion> {
    // Get original workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('steps')
      .eq('id', workflowId)
      .single();

    if (workflowError) {
      throw workflowError;
    }

    const { data, error } = await supabase
      .from('workflow_conversions')
      .insert({
        tenant_id: tenantId,
        migration_id: migrationId,
        workflow_id: workflowId,
        original_steps: workflow.steps,
        conversion_status: 'pending',
        manual_review_required: this.requiresManualReview(workflow.steps)
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating workflow conversion:', error);
      throw error;
    }

    return data;
  }

  /**
   * Start migration execution
   */
  private async startMigration(migrationId: string): Promise<void> {
    await supabase
      .from('integration_migrations')
      .update({
        migration_status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .eq('id', migrationId);

    // TODO: Implement actual migration logic
    // This would involve:
    // 1. Converting workflow steps
    // 2. Migrating credentials
    // 3. Testing converted workflows
    // 4. Updating integration references
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(
    tenantId: string,
    migrationBatchId?: string
  ): Promise<IntegrationMigration[]> {
    let query = supabase
      .from('integration_migrations')
      .select('*')
      .eq('tenant_id', tenantId);

    if (migrationBatchId) {
      query = query.eq('migration_batch_id', migrationBatchId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching migration status:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get workflow conversions for migration
   */
  async getWorkflowConversions(migrationId: string): Promise<WorkflowConversion[]> {
    const { data, error } = await supabase
      .from('workflow_conversions')
      .select('*')
      .eq('migration_id', migrationId)
      .order('created_at');

    if (error) {
      console.error('Error fetching workflow conversions:', error);
      throw error;
    }

    return data || [];
  }

  // Helper methods
  private isStubIntegration(integrationId: string): boolean {
    // List of known stub integrations
    const stubIntegrations = [
      'basic_http', 'simple_webhook', 'basic_email', 'csv_processor'
    ];
    return stubIntegrations.includes(integrationId);
  }

  private getFullIntegrationId(stubIntegrationId: string): string {
    const mappings: { [key: string]: string } = {
      'basic_http': 'advanced_http',
      'simple_webhook': 'advanced_webhook',
      'basic_email': 'smtp_email',
      'csv_processor': 'advanced_csv'
    };
    return mappings[stubIntegrationId] || stubIntegrationId;
  }

  private checkForNewerVersion(integrationId: string): string | null {
    // Mock version checking - in real implementation, 
    // this would check against marketplace or integration registry
    const versionMappings: { [key: string]: string } = {
      'salesforce_v1': 'salesforce_v2',
      'slack_v1': 'slack_v2',
      'gmail_v1': 'gmail_v2'
    };
    return versionMappings[integrationId] || null;
  }

  private calculateComplexityScore(
    migrationType: IntegrationMigration['migration_type'],
    workflowCount: number,
    credentialCount: number
  ): number {
    let baseScore = 1;
    
    switch (migrationType) {
      case 'stub_to_full':
        baseScore = 2;
        break;
      case 'version_upgrade':
        baseScore = 3;
        break;
      case 'provider_change':
        baseScore = 5;
        break;
    }

    return baseScore + (workflowCount * 0.5) + (credentialCount * 0.3);
  }

  private identifyMigrationRisks(
    sourceIntegrationId: string,
    targetIntegrationId: string,
    migrationType: IntegrationMigration['migration_type']
  ): string[] {
    const risks: string[] = [];
    
    if (migrationType === 'provider_change') {
      risks.push('Data structure changes may require manual mapping');
      risks.push('Authentication methods may differ');
    }
    
    if (migrationType === 'version_upgrade') {
      risks.push('Deprecated fields may need updating');
      risks.push('API rate limits may have changed');
    }

    return risks;
  }

  private estimateMigrationDuration(
    migrationType: IntegrationMigration['migration_type'],
    workflowCount: number,
    complexityScore: number
  ): number {
    let baseDuration = 30; // minutes
    
    switch (migrationType) {
      case 'stub_to_full':
        baseDuration = 15;
        break;
      case 'version_upgrade':
        baseDuration = 30;
        break;
      case 'provider_change':
        baseDuration = 60;
        break;
    }

    return baseDuration + (workflowCount * 5) + (complexityScore * 2);
  }

  private recommendSchedule(totalDuration: number, migrationCount: number): string {
    if (totalDuration < 60) {
      return 'Can be completed in a single session';
    } else if (totalDuration < 240) {
      return 'Recommend splitting into 2-3 sessions';
    } else {
      return 'Recommend scheduling over multiple days during low-usage periods';
    }
  }

  private inferMigrationType(
    sourceId: string,
    targetId: string
  ): IntegrationMigration['migration_type'] {
    if (this.isStubIntegration(sourceId)) {
      return 'stub_to_full';
    }
    if (sourceId.includes('_v') && targetId.includes('_v')) {
      return 'version_upgrade';
    }
    return 'provider_change';
  }

  private requiresManualReview(steps: any[]): boolean {
    // Check if workflow has complex configurations that need manual review
    return steps.some(step => 
      step.type === 'integration' && 
      (step.config?.advanced_mapping || step.config?.custom_transformations)
    );
  }
}

export const migrationService = new MigrationService();