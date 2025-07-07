import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  BarChart, 
  Users, 
  List,
  Bell,
  User,
  ChevronUp,
  Key
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTenant } from '@/contexts/TenantContext';

const menuSections = [
  {
    title: "MAIN",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, path: "/" },
      { title: "Automations", icon: List, path: "/automations" },
    ]
  },
  {
    title: "AI ASSIST",
    items: [
      { title: "Resonant Directive", icon: Bell, path: "/ai-assist" },
    ]
  },
  {
    title: "SETTINGS",
    items: [
      { title: "Credentials", icon: Key, path: "/credentials" },
    ]
  }
];

export function AppSidebar() {
  const location = useLocation();
  const { currentTenant } = useTenant();

  return (
    <Sidebar className="bg-sidebar">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
            <img 
              src="https://ai-stream-solutions.s3.us-east-1.amazonaws.com/halo.png" 
              alt="HALO Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">HALO</h2>
            <p className="text-sidebar-foreground/70 text-xs">
              {currentTenant?.name || 'Loading...'}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuSections.map((section, sectionIndex) => (
          <SidebarGroup key={sectionIndex}>
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs font-medium uppercase tracking-wider">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <NavLink to={item.path} className="flex items-center">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <User className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">MASP User</span>
                    <span className="truncate text-xs">admin@halo.dev</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-popover border border-border"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="text-xs text-sidebar-foreground/50 px-2">
          HALO v2.1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}