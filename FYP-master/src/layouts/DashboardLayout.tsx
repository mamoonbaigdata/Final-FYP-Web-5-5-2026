import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger, SidebarFooter, SidebarSeparator } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Home, BarChart3, Thermometer, LogOut, Wrench, Package } from "lucide-react";
import { useAuth } from "@/lib/auth";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const username = user?.username || "Guest";
  const initials = username.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full">
        <Sidebar
          variant="sidebar"
          collapsible="none"
          className="border-r-0 sticky top-0 h-screen overflow-hidden"
          contentClassName="!bg-[#0f2942] text-white"
        >
          {/* Header / Logo */}
          <SidebarHeader className="pt-8 pb-6 px-5 !bg-[#0f2942]">
            <div className="flex items-center gap-3">
              <img src="/dashboard-logo.png" alt="AquaIntel Logo" className="w-14 h-14 object-contain shrink-0" />
              <span className="text-2xl font-extrabold text-white tracking-tight">AquaIntel</span>
            </div>
          </SidebarHeader>

          {/* Navigation */}
          <SidebarContent className="px-4 gap-2 !bg-[#0f2942]">
            <SidebarMenu className="gap-2">
              <SidebarMenuItem>
                <NavLink to="/dashboard" end>
                  {({ isActive }) => (
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip="Dashboard"
                      className={`h-auto py-3 px-4 rounded-xl transition-all hover:bg-white/10 ${isActive ? 'bg-sky-500 text-white shadow-lg shadow-sky-900/30 hover:bg-sky-500 hover:text-white' : 'text-white hover:text-white'}`}
                    >
                      <Home className="w-6 h-6" />
                      <span className="text-lg font-bold">Dashboard</span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <NavLink to="/sensors">
                  {({ isActive }) => (
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip="Sensors"
                      className={`h-auto py-3 px-4 rounded-xl transition-all hover:bg-white/10 ${isActive ? 'bg-sky-500 text-white shadow-lg shadow-sky-900/30 hover:bg-sky-500 hover:text-white' : 'text-white hover:text-white'}`}
                    >
                      <Thermometer className="w-6 h-6" />
                      <span className="text-lg font-bold">Sensors</span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <NavLink to="/analysis">
                  {({ isActive }) => (
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip="Analysis"
                      className={`h-auto py-3 px-4 rounded-xl transition-all hover:bg-white/10 ${isActive ? 'bg-sky-500 text-white shadow-lg shadow-sky-900/30 hover:bg-sky-500 hover:text-white' : 'text-white hover:text-white'}`}
                    >
                      <BarChart3 className="w-6 h-6" />
                      <span className="text-lg font-bold">Analysis</span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <NavLink to="/maintainence">
                  {({ isActive }) => (
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip="Maintainence"
                      className={`h-auto py-3 px-4 rounded-xl transition-all hover:bg-white/10 ${isActive ? 'bg-sky-500 text-white shadow-lg shadow-sky-900/30 hover:bg-sky-500 hover:text-white' : 'text-white hover:text-white'}`}
                    >
                      <Wrench className="w-6 h-6" />
                      <span className="text-lg font-bold">Maintainence</span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <NavLink to="/inventory">
                  {({ isActive }) => (
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip="Inventory"
                      className={`h-auto py-3 px-4 rounded-xl transition-all hover:bg-white/10 ${isActive ? 'bg-sky-500 text-white shadow-lg shadow-sky-900/30 hover:bg-sky-500 hover:text-white' : 'text-white hover:text-white'}`}
                    >
                      <Package className="w-6 h-6" />
                      <span className="text-lg font-bold">Inventory</span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
            </SidebarMenu>

          </SidebarContent>

          <SidebarFooter className="p-4 pt-0 !bg-[#0f2942]">
            {/* System Status Card */}
            <div className="mb-2">
              <div className="bg-[#0f2b4a] rounded-2xl p-5 relative overflow-hidden border border-sky-400/15">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">System Status</h3>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
                </div>
                <p className="text-white font-semibold text-sm">All Systems Online</p>
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {initials}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-white font-bold text-sm leading-tight truncate">{username}</span>
                <span className="text-white/70 text-xs truncate">Administrator</span>
              </div>
              <button onClick={handleLogout} className="text-white/70 hover:text-white transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-transparent">
          <TooltipProvider>
            {/* Keeping the mobile trigger but usually hidden on desktop with this layout */}
            <div className="md:hidden flex h-12 items-center gap-2 border-b border-sky-400/10 px-3 bg-[#0f2942]">
              <SidebarTrigger className="text-white" />
              <span className="font-medium text-white">Dashboard</span>
            </div>
            <div
              className="flex-1 p-0 overflow-auto"
              style={{
                background: "linear-gradient(135deg, #0f2942 0%, #134163 30%, #1a5276 50%, #134163 70%, #0f2942 100%)",
              }}
            >
              <Outlet />
            </div>
          </TooltipProvider>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
