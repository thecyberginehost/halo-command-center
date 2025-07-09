
import { Bell, ChevronDown, User, Bot, Sparkles } from 'lucide-react';
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
  pageTitle?: string;
}

const Header = ({ onChatToggle, pageTitle = "Dashboard" }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm">
      {/* Left - Logo and Page Title */}
      <div className="flex items-center space-x-6">
        <div className="w-8 h-8 bg-halo-primary rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-halo-accent rounded-sm"></div>
        </div>
        <h1 className="text-lg font-semibold text-halo-text">{pageTitle}</h1>
      </div>

      {/* Center - Tenant Selector */}
      <div className="flex-1 flex justify-center max-w-md">
        <TenantSelector />
      </div>

      {/* Right - Chat, Notifications & Profile */}
      <div className="flex items-center space-x-4">
        {/* Resonant Directive AI Assistant */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onChatToggle}
          className="relative bg-gradient-to-r from-halo-primary/5 to-halo-accent/5 border-halo-primary/20 hover:from-halo-primary/10 hover:to-halo-accent/10 hover:border-halo-primary/30 transition-all duration-200 px-3 py-2"
        >
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Bot className="h-4 w-4 text-halo-primary" />
              <Sparkles className="h-2 w-2 text-halo-accent absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="text-xs font-medium text-halo-text">Resonant Directive</span>
          </div>
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
