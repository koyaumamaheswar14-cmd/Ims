import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { 
  LayoutDashboard, Users, Shield, Settings, LogOut, 
  Menu, X, Building2, Mail, History, Lock, Bell, 
  ChevronDown, Search, Globe, Zap, Key, ShieldCheck,
  UserCircle, ExternalLink, HelpCircle, Activity
} from "lucide-react";
import { getFirebaseAuth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { cn } from "../lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { profile, logout, hasPermission } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, category: "Overview", show: hasPermission('view_dashboard') },
    { id: "users", label: "Users", icon: Users, category: "Management", show: hasPermission('view_users') },
    { id: "roles", label: "Roles & Permissions", icon: Shield, category: "Management", show: hasPermission('view_roles') },
    { id: "orgs", label: "Organizations", icon: Building2, category: "Management", show: hasPermission('view_orgs') },
    { id: "invites", label: "Invitations", icon: Mail, category: "Management", show: hasPermission('view_users') },
    { id: "audit", label: "Audit Logs", icon: Activity, category: "Security", show: hasPermission('view_audit') },
    { id: "security", label: "Security", icon: Lock, category: "Security", show: true },
    { id: "api", label: "API Keys", icon: Key, category: "Developer", show: hasPermission('view_roles') },
    { id: "settings", label: "Settings", icon: Settings, category: "System", show: true },
  ];

  const filteredNavItems = navItems.filter(item => item.show);
  const categories = Array.from(new Set(filteredNavItems.map(item => item.category)));

  const handleLogout = async () => {
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-zinc-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 bg-white border-r border-zinc-200 transition-all duration-500 ease-in-out flex flex-col shadow-[20px_0_40px_-20px_rgba(0,0,0,0.02)]",
        isSidebarOpen ? "w-72" : "w-20"
      )}>
        {/* Brand */}
        <div className="h-20 flex items-center px-6 border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0 group hover:scale-110 transition-transform cursor-pointer">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight leading-none">IdentityPro</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Enterprise Cloud</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-8 scrollbar-hide">
          {categories.map(category => (
            <div key={category} className="space-y-2">
              {isSidebarOpen && (
                <p className="px-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">
                  {category}
                </p>
              )}
              <div className="space-y-1">
                {filteredNavItems.filter(item => item.category === category).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative",
                      activeTab === item.id 
                        ? "bg-indigo-50 text-indigo-600 shadow-sm" 
                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                    )}
                  >
                    {activeTab === item.id && (
                      <div className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full" />
                    )}
                    <item.icon className={cn(
                      "w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110",
                      activeTab === item.id ? "text-indigo-600" : "text-zinc-400 group-hover:text-zinc-600"
                    )} />
                    {isSidebarOpen && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-all group",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5 shrink-0 group-hover:rotate-12 transition-transform" />
            {isSidebarOpen && <span className="font-bold text-sm tracking-tight">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-500 ease-in-out min-h-screen flex flex-col",
        isSidebarOpen ? "pl-72" : "pl-20"
      )}>
        {/* Top Navbar */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-zinc-200 sticky top-0 z-40 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-500"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="h-8 w-px bg-zinc-200" />

            {/* Org Switcher */}
            <div className="relative">
              <button 
                onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-100 rounded-2xl transition-all group"
              >
                <div className="w-8 h-8 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg shadow-zinc-200">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Organization</p>
                  <p className="text-sm font-bold text-zinc-900 leading-none">Acme Corp</p>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-zinc-400 transition-transform", isOrgDropdownOpen && "rotate-180")} />
              </button>

              {isOrgDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-zinc-200 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Switch Organization</p>
                  {["Acme Corp", "Global Tech", "Dev Sandbox"].map((org) => (
                    <button 
                      key={org}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 rounded-2xl transition-colors text-left group"
                    >
                      <div className="w-8 h-8 bg-zinc-100 rounded-xl flex items-center justify-center group-hover:bg-white border border-transparent group-hover:border-zinc-200 transition-all">
                        <Building2 className="w-4 h-4 text-zinc-400" />
                      </div>
                      <span className="text-sm font-bold text-zinc-700">{org}</span>
                    </button>
                  ))}
                  <div className="h-px bg-zinc-100 my-2" />
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-colors text-sm font-bold">
                    <Zap className="w-4 h-4" />
                    Manage All Organizations
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden lg:flex items-center gap-3 bg-zinc-100 px-4 py-2.5 rounded-2xl border border-zinc-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all w-64">
              <Search className="w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search everything..." 
                className="bg-transparent border-none outline-none text-sm font-medium placeholder:text-zinc-400 w-full"
              />
              <span className="text-[10px] font-bold text-zinc-400 bg-white px-1.5 py-0.5 rounded border border-zinc-200">⌘K</span>
            </div>

            <button className="p-2.5 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-500 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            <div className="h-8 w-px bg-zinc-200" />

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-3 p-1.5 hover:bg-zinc-100 rounded-2xl transition-all"
              >
                <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center border border-indigo-200">
                  <UserCircle className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-bold text-zinc-900 leading-none mb-1">{profile?.displayName}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Online</span>
                  </div>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-zinc-400 transition-transform", isProfileDropdownOpen && "rotate-180")} />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-zinc-200 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-zinc-100">
                    <p className="text-sm font-bold text-zinc-900">{profile?.displayName}</p>
                    <p className="text-xs text-zinc-500 font-medium truncate">{profile?.email}</p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {profile?.roles.map(role => (
                        <span key={role} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold uppercase tracking-widest rounded-full border border-indigo-100">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-2 space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 rounded-2xl transition-colors text-left group">
                      <UserCircle className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600" />
                      <span className="text-sm font-bold text-zinc-700">My Profile</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 rounded-2xl transition-colors text-left group">
                      <HelpCircle className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600" />
                      <span className="text-sm font-bold text-zinc-700">Support Center</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 rounded-2xl transition-colors text-left group">
                      <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600" />
                      <span className="text-sm font-bold text-zinc-700">Documentation</span>
                    </button>
                  </div>
                  <div className="h-px bg-zinc-100 my-2" />
                  <div className="p-2">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-2xl transition-colors text-sm font-bold"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-8 lg:p-12 max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};
