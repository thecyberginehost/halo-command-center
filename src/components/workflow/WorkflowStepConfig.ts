import { 
  Zap, 
  Play, 
  GitBranch, 
  Clock, 
  Settings,
  Database,
  RepeatIcon
} from 'lucide-react';

export const stepIcons = {
  trigger: Zap,
  action: Play,
  condition: GitBranch,
  delay: Clock,
  utility: Settings,
  logic: RepeatIcon,
  data_transform: Database
};

export const stepColors = {
  trigger: 'bg-halo-accent',
  action: 'bg-halo-primary', 
  condition: 'bg-halo-secondary',
  delay: 'bg-gray-500',
  utility: 'bg-purple-500',
  logic: 'bg-violet-500',
  data_transform: 'bg-blue-500'
};