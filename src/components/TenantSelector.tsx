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
      <div className="flex items-center space-x-3 text-sm text-gray-500 w-full max-w-sm">
        <Building2 className="h-4 w-4" />
        <div className="bg-gray-100 rounded-md h-9 flex-1 flex items-center px-3">
          <span>Loading organizations...</span>
        </div>
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <div className="flex items-center space-x-3 text-sm text-gray-500 w-full max-w-sm">
        <Building2 className="h-4 w-4" />
        <div className="bg-gray-100 rounded-md h-9 flex-1 flex items-center px-3">
          <span>No organizations found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 w-full max-w-sm">
      <div className="flex items-center space-x-2 min-w-0 flex-1">
        <Building2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
        <Select 
          value={currentTenant?.id || ''} 
          onValueChange={handleTenantChange}
        >
          <SelectTrigger className="w-full h-9 text-sm bg-gray-50/80 border-gray-300/60 hover:bg-gray-100/80 focus:bg-white transition-colors">
            <SelectValue 
              placeholder="Select organization" 
              className="text-gray-700 font-medium"
            />
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200/80 shadow-xl z-50">
            {tenants.map((tenant) => (
              <SelectItem 
                key={tenant.id} 
                value={tenant.id}
                className="cursor-pointer hover:bg-gray-50 focus:bg-gray-100"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-800">{tenant.name}</span>
                </div>
              </SelectItem>
            ))}
            <SelectItem 
              value="create-new" 
              className="text-primary font-medium cursor-pointer hover:bg-primary/5 focus:bg-primary/10 border-t border-gray-200 mt-1"
            >
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Create New Organization</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}