
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  SidebarProvider
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Home, LogOut, Settings, Upload, Users } from 'lucide-react';

type NavItemProps = {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
  end?: boolean;
};

const NavItem = ({ to, icon: Icon, children, end }: NavItemProps) => {
  const location = useLocation();
  const isActive = end ? location.pathname === to : location.pathname.startsWith(to);
  
  return (
    <Link to={to} className="w-full">
      <Button
        variant="ghost"
        className={`w-full justify-start gap-2 ${
          isActive ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'
        }`}
      >
        <Icon size={18} />
        <span>{children}</span>
      </Button>
    </Link>
  );
};

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r">
          <SidebarHeader className="px-4 py-6">
            <div className="flex items-center gap-2">
              <FileText className="text-primary" size={24} />
              <h1 className="text-xl font-bold text-primary">EasyTranslate</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Document Translation Tool
            </p>
          </SidebarHeader>
          
          <SidebarContent className="px-2">
            <div className="space-y-1 py-2">
              <NavItem to="/dashboard" icon={Home} end>
                Dashboard
              </NavItem>
              <NavItem to="/new-translation" icon={Upload}>
                New Translation
              </NavItem>
              
              {isAdmin() && (
                <>
                  <div className="h-px bg-border my-4"></div>
                  <p className="text-xs text-muted-foreground px-4 py-2">Admin</p>
                  <NavItem to="/admin" icon={Settings} end>
                    Admin Dashboard
                  </NavItem>
                  <NavItem to="/admin/users" icon={Users}>
                    User Management
                  </NavItem>
                </>
              )}
            </div>
          </SidebarContent>
          
          <SidebarFooter className="p-4 border-t mt-auto">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {user?.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{user?.username}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full gap-2" onClick={logout}>
                <LogOut size={16} />
                <span>Log out</span>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 flex flex-col min-h-screen">
          <div className="p-4 h-16 flex items-center border-b">
            <SidebarTrigger />
          </div>
          
          <div className="flex-1 p-6 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};
