import { Button } from '@/components/ui/button';

interface CategoryButtonProps {
  id: string;
  label: string;
  icon: any;
  color: string;
  totalIntegrations: number;
  isSelected: boolean;
  onClick: () => void;
}

export function CategoryButton({ 
  id, 
  label, 
  icon: Icon, 
  color, 
  totalIntegrations, 
  isSelected, 
  onClick 
}: CategoryButtonProps) {
  if (totalIntegrations === 0) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`relative h-8 w-8 p-0 rounded-lg transition-all duration-200 ${
        isSelected
          ? 'bg-primary/10 scale-110 shadow-md' 
          : 'hover:bg-accent hover:scale-105'
      }`}
      title={`${label} (${totalIntegrations} integrations)`}
      onClick={onClick}
    >
      <Icon 
        className="h-4 w-4" 
        style={{ color }}
      />
      {/* Integration count badge */}
      <span 
        className="absolute -top-1 -right-1 h-4 w-4 text-xs font-medium text-white rounded-full flex items-center justify-center"
        style={{ backgroundColor: color }}
      >
        {totalIntegrations}
      </span>
    </Button>
  );
}