
import { Bell, ChevronDown, User, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TenantSelector } from './TenantSelector';

interface HeaderProps {
  onChatToggle?: () => void;
}

const Header = ({ onChatToggle }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm">
      {/* Left - Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-halo-primary rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-halo-accent rounded-sm"></div>
        </div>
        <span className="text-xl font-bold text-halo-primary">HALO</span>
      </div>

      {/* Center - Page Title */}
      <div className="flex-1 text-center">
        <h1 className="text-lg font-semibold text-halo-text">Automation Dashboard</h1>
      </div>

      {/* Right - Tenant Selector, Notifications & Profile */}
      <div className="flex items-center space-x-4">
        {/* Tenant Selector */}
        <TenantSelector />
        
        {/* Resonant Directive Chat */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onChatToggle}
          className="relative hover:bg-halo-primary/10"
        >
          <MessageCircle className="h-5 w-5 text-halo-primary" />
        </Button>
        
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5 text-halo-textSecondary" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-halo-accent rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-medium">3</span>
          </span>
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 px-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-halo-secondary text-white">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-halo-text">Alex Morgan</span>
              <ChevronDown className="h-4 w-4 text-halo-textSecondary" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuItem>Help & Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-halo-accent">Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
