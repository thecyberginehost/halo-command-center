import { 
  Zap, 
  Play, 
  GitBranch, 
  Clock, 
  Settings
} from 'lucide-react';

export const stepIcons = {
  trigger: Zap,
  action: Play,
  condition: GitBranch,
  delay: Clock,
  utility: Settings
};

export const stepColors = {
  trigger: 'bg-halo-accent',
  action: 'bg-halo-primary', 
  condition: 'bg-halo-secondary',
  delay: 'bg-gray-500',
  utility: 'bg-purple-500'
};