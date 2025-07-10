
import { Bell, ChevronDown, User, Bot, Sparkles, Settings, LogOut } from 'lucide-react';
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
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onChatToggle?: () => void;
  pageTitle?: string;
}

const Header = ({ onChatToggle, pageTitle = "Dashboard" }: HeaderProps) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const getDisplayName = () => {
    if (profile?.name) return profile.name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    return 'User';
  };

  const getUserEmail = () => {
    return user?.email || '';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleProfileSettings = () => {
    navigate('/profile-settings');
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200/80 h-16 flex items-center justify-between px-6 shadow-sm relative z-50">
      {/* Left - Logo and Page Title */}
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm">
            <div className="w-5 h-5 bg-white/90 rounded-sm"></div>
          </div>
          <div className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            HALO
          </div>
        </div>
        <div className="hidden md:block h-6 w-px bg-gray-300"></div>
        <h1 className="text-lg font-semibold text-gray-800 hidden md:block">{pageTitle}</h1>
      </div>

      {/* Center - Tenant Selector */}
      <div className="flex-1 flex justify-center max-w-sm mx-8">
        <TenantSelector />
      </div>

      {/* Right - Actions & Profile */}
      <div className="flex items-center space-x-3">
        {/* Resonant Directive AI Assistant */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onChatToggle}
          className="relative bg-gradient-to-r from-primary/8 to-blue-500/8 border-primary/25 hover:from-primary/15 hover:to-blue-500/15 hover:border-primary/40 transition-all duration-200 px-3 py-2 shadow-sm"
        >
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Bot className="h-4 w-4 text-primary" />
              <Sparkles className="h-2 w-2 text-blue-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="text-xs font-medium text-gray-700 hidden sm:inline">Resonant Directive</span>
          </div>
        </Button>
        
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative p-2 hover:bg-gray-100/80">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
            <span className="text-xs text-white font-medium">3</span>
          </span>
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100/80 rounded-lg">
              <Avatar className="h-8 w-8 ring-2 ring-gray-200">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-sm font-medium">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700 hidden sm:inline max-w-32 truncate">{getDisplayName()}</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-white/95 backdrop-blur-sm border border-gray-200/80 shadow-xl z-50">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-gray-900">{getDisplayName()}</p>
                <p className="text-xs leading-none text-gray-500">
                  {getUserEmail()}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfileSettings} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
