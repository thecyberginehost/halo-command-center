import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Tenant } from '@/types/tenant';
import { useNavigate } from 'react-router-dom';

export function TenantSelector() {
  const navigate = useNavigate();
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

  const handleTenantChange = (value: string) => {
    if (value === 'create-new') {
      navigate('/organizations/create');
      return;
    }
    
    const selectedTenant = tenants.find(t => t.id === value);
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
    <div className="flex items-center space-x-2 w-full max-w-sm">
      <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <Select 
        value={currentTenant?.id || ''} 
        onValueChange={handleTenantChange}
      >
        <SelectTrigger className="w-full h-8 text-sm">
          <SelectValue placeholder="Select organization" />
        </SelectTrigger>
        <SelectContent>
          {tenants.map((tenant) => (
            <SelectItem key={tenant.id} value={tenant.id}>
              {tenant.name}
            </SelectItem>
          ))}
          <SelectItem value="create-new" className="text-primary font-medium">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Organization
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}