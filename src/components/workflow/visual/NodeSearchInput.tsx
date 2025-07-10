import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface NodeSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function NodeSearchInput({ value, onChange }: NodeSearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search nodes..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8 w-40 h-8 text-sm"
      />
    </div>
  );
}