import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Tenant } from '@/types/tenant';

export function TenantSelector() {
  const { currentTenant, setCurrentTenant } = useTenant();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching tenants:', error);
        } else {
          setTenants(data || []);
        }
      } catch (error) {
        console.error('Error fetching tenants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const handleTenantChange = (tenantId: string) => {
    const selectedTenant = tenants.find(t => t.id === tenantId);
    if (selectedTenant) {
      setCurrentTenant(selectedTenant);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span>Loading...</span>
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span>No organizations</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select 
        value={currentTenant?.id || ''} 
        onValueChange={handleTenantChange}
      >
        <SelectTrigger className="w-48 h-8 text-sm">
          <SelectValue placeholder="Select organization" />
        </SelectTrigger>
        <SelectContent>
          {tenants.map((tenant) => (
            <SelectItem key={tenant.id} value={tenant.id}>
              {tenant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}