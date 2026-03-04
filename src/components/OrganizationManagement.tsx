import React, { useEffect, useState } from "react";
import { 
  Building2, Plus, Search, Filter, MoreVertical, Globe, 
  Shield, Users, CheckCircle2, AlertCircle, Clock, 
  ArrowUpRight, Loader2, Server, Activity
} from "lucide-react";
import { Organization } from "../types";
import { cn } from "../lib/utils";

export const OrganizationManagement: React.FC = () => {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Mock data for enterprise simulation
    const mockOrgs: Organization[] = [
      { id: "org_1", name: "Acme Corp", domain: "acme.com", status: "active", tier: "enterprise", userCount: 1240, createdAt: Date.now() - 86400000 * 30, region: "US-EAST-1" },
      { id: "org_2", name: "Global Tech", domain: "globaltech.io", status: "active", tier: "pro", userCount: 450, createdAt: Date.now() - 86400000 * 15, region: "EU-WEST-1" },
      { id: "org_3", name: "Dev Sandbox", domain: "dev.local", status: "suspended", tier: "free", userCount: 12, createdAt: Date.now() - 86400000 * 5, region: "US-WEST-2" },
      { id: "org_4", name: "Stark Industries", domain: "stark.com", status: "active", tier: "enterprise", userCount: 8900, createdAt: Date.now() - 86400000 * 60, region: "US-EAST-1" },
    ];
    setOrgs(mockOrgs);
    setLoading(false);
  }, []);

  const filteredOrgs = orgs.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-sm shadow-indigo-500/10';
      case 'pro': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-zinc-50 text-zinc-600 border-zinc-100';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Loading Organizations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Multi-Tenant Control</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Organizations</h1>
          <p className="text-zinc-500 text-lg">Manage business units, client accounts, and resource allocation.</p>
        </div>
        
        <button className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-2xl text-sm font-bold hover:bg-black transition-all shadow-xl shadow-black/10">
          <Plus className="w-4 h-4" />
          Create Organization
        </button>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Organizations', value: orgs.length, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Total Managed Users', value: '10,602', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Global Availability', value: '99.99%', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex items-center gap-4 hover:border-zinc-300 transition-colors">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", stat.bg)}>
              <stat.icon className={cn("w-7 h-7", stat.color)} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, domain, or organization ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-6 py-3 bg-zinc-100 rounded-2xl text-xs font-bold text-zinc-600 hover:bg-zinc-200 transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-zinc-100 rounded-2xl text-xs font-bold text-zinc-600 hover:bg-zinc-200 transition-colors">
            <Server className="w-4 h-4" />
            Regions
          </button>
        </div>
      </div>

      {/* Orgs Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredOrgs.map((org) => (
          <div key={org.id} className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 transition-all group overflow-hidden">
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-2xl font-black text-zinc-300 group-hover:bg-white group-hover:border-indigo-100 group-hover:text-indigo-600 transition-all">
                    {org.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                      {org.name}
                      {org.tier === 'enterprise' && <Shield className="w-4 h-4 text-indigo-500" />}
                    </h3>
                    <p className="text-sm text-zinc-500 font-medium">{org.domain}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                    getTierColor(org.tier || 'free')
                  )}>
                    {org.tier}
                  </span>
                  <button className="p-2 hover:bg-zinc-50 rounded-xl transition-colors">
                    <MoreVertical className="w-5 h-5 text-zinc-400" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Users</p>
                  <p className="text-lg font-bold text-zinc-900">{(org.userCount || 0).toLocaleString()}</p>
                </div>
                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Region</p>
                  <p className="text-lg font-bold text-zinc-900">{org.region?.split('-')[0] || 'Global'}</p>
                </div>
                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Status</p>
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      org.status === 'active' ? "bg-emerald-500" : "bg-red-500"
                    )} />
                    <p className="text-sm font-bold text-zinc-900 capitalize">{org.status}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-zinc-100">
                <div className="flex items-center gap-4 text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Added {new Date(org.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{org.region}</span>
                  </div>
                </div>
                <button className="flex items-center gap-2 text-indigo-600 text-xs font-bold hover:gap-3 transition-all">
                  Manage Settings
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrgs.length === 0 && (
        <div className="p-32 text-center bg-white rounded-[3rem] border border-zinc-200 border-dashed">
          <div className="w-20 h-20 bg-zinc-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-zinc-200" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 mb-2">No organizations found</h3>
          <p className="text-zinc-500 max-w-xs mx-auto">Try a different search term or create a new organization to get started.</p>
        </div>
      )}
    </div>
  );
};
