import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tenant } from '@/types/tenant';

interface TenantContextType {
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant | null) => void;
  loading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, we'll load the first tenant as default
    // In a real app, this would be determined by subdomain or user selection
    const loadDefaultTenant = async () => {
      try {
        const { data: tenants, error } = await supabase
          .from('tenants')
          .select('*')
          .limit(1);

        if (error) {
          console.error('Error loading tenant:', error);
          // Create a default tenant if none exists
          const { data: newTenant, error: createError } = await supabase
            .from('tenants')
            .insert({
              name: 'HALO Demo Tenant',
              subdomain: 'demo',
              settings: {}
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating default tenant:', createError);
          } else {
            setCurrentTenant(newTenant);
          }
        } else if (tenants && tenants.length > 0) {
          setCurrentTenant(tenants[0]);
        }
      } catch (error) {
        console.error('Error in loadDefaultTenant:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDefaultTenant();
  }, []);

  return (
    <TenantContext.Provider value={{ currentTenant, setCurrentTenant, loading }}>
      {children}
    </TenantContext.Provider>
  );
};