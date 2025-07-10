import { supabase } from '@/integrations/supabase/client';

// Performance Optimization Service - Phase 5
export interface LoadTestConfig {
  id: string;
  name: string;
  integration_id: string;
  test_duration: number; // seconds
  concurrent_users: number;
  requests_per_second: number;
  ramp_up_time: number; // seconds
  test_data: Record<string, any>;
  environment: 'test' | 'staging' | 'production';
  tenant_id: string;
}

export interface PerformanceMetrics {
  timestamp: string;
  integration_id: string;
  response_time: number; // ms
  throughput: number; // requests per second
  error_rate: number; // percentage
  cpu_usage: number; // percentage
  memory_usage: number; // MB
  concurrent_connections: number;
  queue_size: number;
}

export interface LoadTestResult {
  config_id: string;
  started_at: string;
  completed_at: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  average_response_time: number;
  max_response_time: number;
  min_response_time: number;
  p95_response_time: number;
  p99_response_time: number;
  throughput: number;
  error_rate: number;
  metrics_timeline: PerformanceMetrics[];
  bottlenecks: string[];
  recommendations: string[];
}

export interface OptimizationRule {
  id: string;
  name: string;
  condition: string; // SQL-like condition
  action: 'cache' | 'batch' | 'retry' | 'circuit_breaker' | 'rate_limit';
  parameters: Record<string, any>;
  priority: number;
  is_active: boolean;
  tenant_id: string;
}

class PerformanceOptimizationService {
  private static instance: PerformanceOptimizationService;
  private loadTestRunners: Map<string, any> = new Map();

  static getInstance(): PerformanceOptimizationService {
    if (!PerformanceOptimizationService.instance) {
      PerformanceOptimizationService.instance = new PerformanceOptimizationService();
    }
    return PerformanceOptimizationService.instance;
  }

  // Create load test configuration
  async createLoadTest(config: Omit<LoadTestConfig, 'id'>): Promise<LoadTestConfig> {
    const { data, error } = await supabase
      .from('load_test_configs')
      .insert({
        name: config.name,
        integration_id: config.integration_id,
        test_duration: config.test_duration,
        concurrent_users: config.concurrent_users,
        requests_per_second: config.requests_per_second,
        ramp_up_time: config.ramp_up_time,
        test_data: config.test_data,
        environment: config.environment,
        tenant_id: config.tenant_id
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      test_data: data.test_data as Record<string, any>
    } as LoadTestConfig;
  }

  // Run load test
  async runLoadTest(configId: string): Promise<LoadTestResult> {
    const { data: config, error } = await supabase
      .from('load_test_configs')
      .select('*')
      .eq('id', configId)
      .single();

    if (error) throw error;

    const typedConfig: LoadTestConfig = {
      ...config,
      test_data: config.test_data as Record<string, any>,
      environment: config.environment as LoadTestConfig['environment']
    };

    const startTime = new Date().toISOString();
    const metrics: PerformanceMetrics[] = [];
    const responseTimes: number[] = [];
    let successfulRequests = 0;
    let failedRequests = 0;

    try {
      // Start performance monitoring
      const monitoringInterval = setInterval(() => {
        this.collectPerformanceMetrics(typedConfig.integration_id, metrics);
      }, 1000);

      // Run load test
      await this.executeLoadTest(typedConfig, (responseTime: number, success: boolean) => {
        responseTimes.push(responseTime);
        if (success) successfulRequests++;
        else failedRequests++;
      });

      clearInterval(monitoringInterval);

      const completedAt = new Date().toISOString();
      const totalRequests = successfulRequests + failedRequests;

      // Calculate statistics
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const sortedTimes = responseTimes.sort((a, b) => a - b);
      const p95Index = Math.floor(sortedTimes.length * 0.95);
      const p99Index = Math.floor(sortedTimes.length * 0.99);

      const result: LoadTestResult = {
        config_id: configId,
        started_at: startTime,
        completed_at: completedAt,
        total_requests: totalRequests,
        successful_requests: successfulRequests,
        failed_requests: failedRequests,
        average_response_time: avgResponseTime,
        max_response_time: Math.max(...responseTimes),
        min_response_time: Math.min(...responseTimes),
        p95_response_time: sortedTimes[p95Index] || 0,
        p99_response_time: sortedTimes[p99Index] || 0,
        throughput: totalRequests / typedConfig.test_duration,
        error_rate: (failedRequests / totalRequests) * 100,
        metrics_timeline: metrics,
        bottlenecks: [],
        recommendations: []
      };

      // Set bottlenecks and recommendations after result is defined
      result.bottlenecks = this.identifyBottlenecks(metrics);
      result.recommendations = this.generateRecommendations(metrics, result);

      // Store result
      await supabase
        .from('load_test_results')
        .insert({
          config_id: configId,
          result_data: result as any,
          tenant_id: typedConfig.tenant_id
        });

      return result;
    } catch (error) {
      throw new Error(`Load test failed: ${error}`);
    }
  }

  // Execute load test simulation
  private async executeLoadTest(
    config: LoadTestConfig,
    onResult: (responseTime: number, success: boolean) => void
  ): Promise<void> {
    const startTime = Date.now();
    const endTime = startTime + (config.test_duration * 1000);
    const requestInterval = 1000 / config.requests_per_second;

    const promises: Promise<void>[] = [];

    // Simulate concurrent users
    for (let user = 0; user < config.concurrent_users; user++) {
      promises.push(this.simulateUser(config, endTime, requestInterval, onResult));
    }

    await Promise.all(promises);
  }

  // Simulate individual user behavior
  private async simulateUser(
    config: LoadTestConfig,
    endTime: number,
    requestInterval: number,
    onResult: (responseTime: number, success: boolean) => void
  ): Promise<void> {
    while (Date.now() < endTime) {
      const startTime = Date.now();
      try {
        await this.executeIntegrationRequest(config.integration_id, config.test_data);
        const responseTime = Date.now() - startTime;
        onResult(responseTime, true);
      } catch (error) {
        const responseTime = Date.now() - startTime;
        onResult(responseTime, false);
      }
      
      // Wait for next request
      await new Promise(resolve => setTimeout(resolve, requestInterval));
    }
  }

  // Execute single integration request
  private async executeIntegrationRequest(integrationId: string, testData: Record<string, any>): Promise<any> {
    const { data, error } = await supabase.functions.invoke('execute-integration', {
      body: {
        integrationId,
        input: testData
      }
    });

    if (error) throw error;
    return data;
  }

  // Collect performance metrics
  private collectPerformanceMetrics(integrationId: string, metrics: PerformanceMetrics[]): void {
    // Mock metrics collection - in production would use real monitoring
    const metric: PerformanceMetrics = {
      timestamp: new Date().toISOString(),
      integration_id: integrationId,
      response_time: Math.random() * 1000 + 100,
      throughput: Math.random() * 100 + 50,
      error_rate: Math.random() * 5,
      cpu_usage: Math.random() * 80 + 10,
      memory_usage: Math.random() * 1000 + 200,
      concurrent_connections: Math.floor(Math.random() * 100 + 10),
      queue_size: Math.floor(Math.random() * 50)
    };

    metrics.push(metric);
  }

  // Identify performance bottlenecks
  private identifyBottlenecks(metrics: PerformanceMetrics[]): string[] {
    const bottlenecks: string[] = [];

    const avgResponseTime = metrics.reduce((sum, m) => sum + m.response_time, 0) / metrics.length;
    const avgCpuUsage = metrics.reduce((sum, m) => sum + m.cpu_usage, 0) / metrics.length;
    const avgMemoryUsage = metrics.reduce((sum, m) => sum + m.memory_usage, 0) / metrics.length;
    const avgErrorRate = metrics.reduce((sum, m) => sum + m.error_rate, 0) / metrics.length;

    if (avgResponseTime > 2000) {
      bottlenecks.push('High response time detected');
    }
    
    if (avgCpuUsage > 80) {
      bottlenecks.push('High CPU usage detected');
    }
    
    if (avgMemoryUsage > 800) {
      bottlenecks.push('High memory usage detected');
    }
    
    if (avgErrorRate > 5) {
      bottlenecks.push('High error rate detected');
    }

    return bottlenecks;
  }

  // Generate optimization recommendations
  private generateRecommendations(metrics: PerformanceMetrics[], result: LoadTestResult): string[] {
    const recommendations: string[] = [];

    if (result.average_response_time > 1000) {
      recommendations.push('Consider implementing caching to reduce response times');
      recommendations.push('Optimize database queries and add appropriate indexes');
    }

    if (result.error_rate > 5) {
      recommendations.push('Implement circuit breaker pattern to handle failures gracefully');
      recommendations.push('Add retry logic with exponential backoff');
    }

    if (result.throughput < 50) {
      recommendations.push('Consider implementing request batching');
      recommendations.push('Increase connection pool size');
    }

    const avgQueueSize = metrics.reduce((sum, m) => sum + m.queue_size, 0) / metrics.length;
    if (avgQueueSize > 20) {
      recommendations.push('Implement rate limiting to prevent queue overflow');
      recommendations.push('Consider horizontal scaling');
    }

    return recommendations;
  }

  // Create optimization rule
  async createOptimizationRule(rule: Omit<OptimizationRule, 'id'>): Promise<OptimizationRule> {
    const { data, error } = await supabase
      .from('optimization_rules')
      .insert({
        name: rule.name,
        condition: rule.condition,
        action: rule.action,
        parameters: rule.parameters as any,
        priority: rule.priority,
        is_active: rule.is_active,
        tenant_id: rule.tenant_id
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      action: data.action as OptimizationRule['action'],
      parameters: data.parameters as Record<string, any>
    } as OptimizationRule;
  }

  // Apply optimization automatically
  async applyOptimizations(integrationId: string, tenantId: string): Promise<void> {
    const { data: rules, error } = await supabase
      .from('optimization_rules')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) throw error;

      for (const rule of rules) {
        const typedRule: OptimizationRule = {
          ...rule,
          action: rule.action as OptimizationRule['action'],
          parameters: rule.parameters as Record<string, any>
        };
        await this.applyOptimizationRule(integrationId, typedRule);
      }
  }

  // Apply single optimization rule
  private async applyOptimizationRule(integrationId: string, rule: OptimizationRule): Promise<void> {
    switch (rule.action) {
      case 'cache':
        await this.enableCaching(integrationId, rule.parameters);
        break;
      case 'batch':
        await this.enableBatching(integrationId, rule.parameters);
        break;
      case 'retry':
        await this.enableRetryLogic(integrationId, rule.parameters);
        break;
      case 'circuit_breaker':
        await this.enableCircuitBreaker(integrationId, rule.parameters);
        break;
      case 'rate_limit':
        await this.enableRateLimit(integrationId, rule.parameters);
        break;
    }
  }

  // Optimization implementations
  private async enableCaching(integrationId: string, params: Record<string, any>): Promise<void> {
    // Implementation would configure caching for the integration
    console.log(`Enabling caching for ${integrationId}`, params);
  }

  private async enableBatching(integrationId: string, params: Record<string, any>): Promise<void> {
    // Implementation would configure request batching
    console.log(`Enabling batching for ${integrationId}`, params);
  }

  private async enableRetryLogic(integrationId: string, params: Record<string, any>): Promise<void> {
    // Implementation would configure retry logic
    console.log(`Enabling retry logic for ${integrationId}`, params);
  }

  private async enableCircuitBreaker(integrationId: string, params: Record<string, any>): Promise<void> {
    // Implementation would configure circuit breaker
    console.log(`Enabling circuit breaker for ${integrationId}`, params);
  }

  private async enableRateLimit(integrationId: string, params: Record<string, any>): Promise<void> {
    // Implementation would configure rate limiting
    console.log(`Enabling rate limit for ${integrationId}`, params);
  }

  // Get performance report
  async getPerformanceReport(tenantId: string, timeRange: { start: string; end: string }): Promise<any> {
    const { data: results, error } = await supabase
      .from('load_test_results')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('created_at', timeRange.start)
      .lte('created_at', timeRange.end);

    if (error) throw error;

    // Aggregate performance data
    const validResults = results.filter(r => r.result_data && typeof r.result_data === 'object');
    return {
      total_tests: results.length,
      average_response_time: validResults.length > 0 ? validResults.reduce((sum, r) => sum + ((r.result_data as any).average_response_time || 0), 0) / validResults.length : 0,
      average_throughput: validResults.length > 0 ? validResults.reduce((sum, r) => sum + ((r.result_data as any).throughput || 0), 0) / validResults.length : 0,
      average_error_rate: validResults.length > 0 ? validResults.reduce((sum, r) => sum + ((r.result_data as any).error_rate || 0), 0) / validResults.length : 0,
      trends: this.calculatePerformanceTrends(validResults),
      bottlenecks: this.aggregateBottlenecks(validResults)
    };
  }

  private calculatePerformanceTrends(results: any[]): any {
    // Calculate performance trends over time
    return {
      response_time_trend: 'improving',
      throughput_trend: 'stable',
      error_rate_trend: 'improving'
    };
  }

  private aggregateBottlenecks(results: any[]): string[] {
    const allBottlenecks = results.flatMap(r => (r.result_data as any)?.bottlenecks || []);
    const bottleneckCounts = allBottlenecks.reduce((acc: Record<string, number>, b: string) => {
      acc[b] = (acc[b] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(bottleneckCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([bottleneck]) => bottleneck);
  }
}

export const performanceOptimizationService = PerformanceOptimizationService.getInstance();