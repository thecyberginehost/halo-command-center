import { supabase } from '@/integrations/supabase/client';

export interface MarketplacePackage {
  id: string;
  package_name: string;
  display_name: string;
  description?: string;
  category: string;
  vendor_name: string;
  vendor_email?: string;
  icon_url?: string;
  package_version: string;
  min_halo_version: string;
  package_config: any;
  installation_config: any;
  pricing_model: string;
  price_per_month?: number;
  is_verified: boolean;
  is_active: boolean;
  download_count: number;
  rating?: number;
  rating_count: number;
  tags: string[];
  screenshots: string[];
  documentation_url?: string;
  support_url?: string;
  changelog: any;
  created_at: string;
  updated_at: string;
}

export interface TenantMarketplaceInstall {
  id: string;
  tenant_id: string;
  package_id: string;
  installed_version: string;
  installation_config: any;
  custom_settings: any;
  is_active: boolean;
  installed_at: string;
  last_updated: string;
  package?: MarketplacePackage;
}

export interface MarketplaceReview {
  id: string;
  package_id: string;
  tenant_id: string;
  rating: number;
  review_text?: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  reported_count: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export class MarketplaceService {
  
  /**
   * Get all available marketplace packages
   */
  async getMarketplacePackages(filters?: {
    category?: string;
    search?: string;
    verified_only?: boolean;
    pricing_model?: string;
  }): Promise<MarketplacePackage[]> {
    let query = supabase
      .from('marketplace_packages')
      .select('*')
      .eq('is_active', true);

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.search) {
      query = query.or(`display_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,tags.cs.{${filters.search}}`);
    }

    if (filters?.verified_only) {
      query = query.eq('is_verified', true);
    }

    if (filters?.pricing_model) {
      query = query.eq('pricing_model', filters.pricing_model);
    }

    const { data, error } = await query.order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching marketplace packages:', error);
      throw error;
    }

    return (data || []) as MarketplacePackage[];
  }

  /**
   * Get a specific marketplace package
   */
  async getMarketplacePackage(packageId: string): Promise<MarketplacePackage | null> {
    const { data, error } = await supabase
      .from('marketplace_packages')
      .select('*')
      .eq('id', packageId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching marketplace package:', error);
      return null;
    }

    return data as MarketplacePackage;
  }

  /**
   * Get tenant's installed packages
   */
  async getTenantInstalledPackages(tenantId: string): Promise<TenantMarketplaceInstall[]> {
    const { data, error } = await supabase
      .from('tenant_marketplace_installs')
      .select(`
        *,
        package:marketplace_packages(*)
      `)
      .eq('tenant_id', tenantId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching tenant installed packages:', error);
      throw error;
    }

    return (data || []) as TenantMarketplaceInstall[];
  }

  /**
   * Install a marketplace package for tenant
   */
  async installPackage(
    tenantId: string,
    packageId: string,
    installationConfig?: any
  ): Promise<TenantMarketplaceInstall> {
    // First, get the package details
    const marketplacePackage = await this.getMarketplacePackage(packageId);
    if (!marketplacePackage) {
      throw new Error('Package not found');
    }

    // Check if already installed
    const { data: existing } = await supabase
      .from('tenant_marketplace_installs')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('package_id', packageId)
      .single();

    if (existing) {
      throw new Error('Package already installed');
    }

    // Install the package
    const { data, error } = await supabase
      .from('tenant_marketplace_installs')
      .insert({
        tenant_id: tenantId,
        package_id: packageId,
        installed_version: marketplacePackage.package_version,
        installation_config: installationConfig || {},
        custom_settings: {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error installing package:', error);
      throw error;
    }

    // Update download count
    await supabase
      .from('marketplace_packages')
      .update({ 
        download_count: marketplacePackage.download_count + 1 
      })
      .eq('id', packageId);

    return data;
  }

  /**
   * Uninstall a marketplace package
   */
  async uninstallPackage(tenantId: string, packageId: string): Promise<void> {
    const { error } = await supabase
      .from('tenant_marketplace_installs')
      .update({ is_active: false })
      .eq('tenant_id', tenantId)
      .eq('package_id', packageId);

    if (error) {
      console.error('Error uninstalling package:', error);
      throw error;
    }
  }

  /**
   * Update package settings
   */
  async updatePackageSettings(
    tenantId: string,
    packageId: string,
    settings: any
  ): Promise<TenantMarketplaceInstall> {
    const { data, error } = await supabase
      .from('tenant_marketplace_installs')
      .update({
        custom_settings: settings,
        last_updated: new Date().toISOString()
      })
      .eq('tenant_id', tenantId)
      .eq('package_id', packageId)
      .select()
      .single();

    if (error) {
      console.error('Error updating package settings:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get package reviews
   */
  async getPackageReviews(packageId: string): Promise<MarketplaceReview[]> {
    const { data, error } = await supabase
      .from('marketplace_reviews')
      .select('*')
      .eq('package_id', packageId)
      .eq('is_visible', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching package reviews:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Submit a package review
   */
  async submitReview(
    tenantId: string,
    packageId: string,
    rating: number,
    reviewText?: string
  ): Promise<MarketplaceReview> {
    // Check if user has installed the package
    const { data: installation } = await supabase
      .from('tenant_marketplace_installs')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('package_id', packageId)
      .single();

    const { data, error } = await supabase
      .from('marketplace_reviews')
      .upsert({
        package_id: packageId,
        tenant_id: tenantId,
        rating,
        review_text: reviewText,
        is_verified_purchase: !!installation
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting review:', error);
      throw error;
    }

    // Update package rating
    await this.updatePackageRating(packageId);

    return data;
  }

  /**
   * Update package average rating
   */
  private async updatePackageRating(packageId: string): Promise<void> {
    const { data: reviews } = await supabase
      .from('marketplace_reviews')
      .select('rating')
      .eq('package_id', packageId)
      .eq('is_visible', true);

    if (reviews && reviews.length > 0) {
      const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      
      await supabase
        .from('marketplace_packages')
        .update({
          rating: Number(avgRating.toFixed(2)),
          rating_count: reviews.length
        })
        .eq('id', packageId);
    }
  }

  /**
   * Get marketplace categories
   */
  async getCategories(): Promise<{ category: string; count: number }[]> {
    const { data, error } = await supabase
      .from('marketplace_packages')
      .select('category')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    // Count packages per category
    const categoryCount: { [key: string]: number } = {};
    data?.forEach(pkg => {
      categoryCount[pkg.category] = (categoryCount[pkg.category] || 0) + 1;
    });

    return Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count
    }));
  }

  /**
   * Dynamic integration loading - load integration from installed package
   */
  async loadIntegrationFromPackage(
    tenantId: string,
    integrationId: string
  ): Promise<any> {
    // Find the installed package that contains this integration
    const { data: installations } = await supabase
      .from('tenant_marketplace_installs')
      .select(`
        *,
        package:marketplace_packages(*)
      `)
      .eq('tenant_id', tenantId)
      .eq('is_active', true);

    if (!installations) {
      throw new Error('No installed packages found');
    }

    for (const installation of installations) {
      const packageConfig = installation.package?.package_config;
      if ((packageConfig as any)?.integrations?.[integrationId]) {
        const integrationConfig = (packageConfig as any).integrations[integrationId];
        
        // Merge with tenant-specific settings
        return {
          ...integrationConfig,
          settings: {
            ...integrationConfig.settings,
            ...installation.custom_settings[integrationId]
          }
        };
      }
    }

    throw new Error(`Integration ${integrationId} not found in installed packages`);
  }
}

export const marketplaceService = new MarketplaceService();