import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { 
  Shield, Users, Activity, Clock, LogIn, UserPlus, Mail, 
  AlertCircle, TrendingUp, Globe, Terminal, ShieldCheck, 
  Zap, ArrowUpRight, MousePointer2, MoreHorizontal,
  Lock, Key, Fingerprint
} from "lucide-react";
import { getAuditLogs, getUserLogs } from "../services/auditService";
import { AuditLog } from "../types";
import { formatTimestamp, cn } from "../lib/utils";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const LOGIN_DATA = [
  { name: 'Mon', value: 2400 },
  { name: 'Tue', value: 1398 },
  { name: 'Wed', value: 9800 },
  { name: 'Thu', value: 3908 },
  { name: 'Fri', value: 4800 },
  { name: 'Sat', value: 3800 },
  { name: 'Sun', value: 4300 },
];

const ROLE_DATA = [
  { name: 'Admins', value: 12 },
  { name: 'Managers', value: 45 },
  { name: 'Editors', value: 120 },
  { name: 'Users', value: 950 },
  { name: 'Support', value: 30 },
];

const STATUS_DATA = [
  { name: 'Active', value: 1150, color: '#10b981' },
  { name: 'Suspended', value: 45, color: '#ef4444' },
  { name: 'Pending', value: 45, color: '#f59e0b' },
];

interface DashboardProps {
  onTabChange?: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onTabChange }) => {
  const { profile, isManager } = useAuth();
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      if (profile) {
        const logs = isManager ? await getAuditLogs(10) : await getUserLogs(profile.uid, 10);
        setRecentLogs(logs);
      }
      setLoading(false);
    };
    fetchLogs();
  }, [profile, isManager]);

  const summaryStats = [
    { id: 'users', label: "Total Users", value: "1,240", change: "+12%", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
    { id: 'roles', label: "Active Roles", value: "8", change: "Stable", icon: Shield, color: "text-blue-600", bg: "bg-blue-50" },
    { id: 'audit', label: "Audit Events", value: "45.2k", change: "+5.4k", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
    { id: 'invites', label: "Pending Invites", value: "14", change: "-2", icon: Mail, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">System Operational</span>
            </div>
            <span className="text-zinc-300">/</span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Global Infrastructure</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Enterprise Overview</h1>
          <p className="text-zinc-500 text-lg">
            Welcome back, <span className="text-black font-semibold">{profile?.displayName}</span>. 
            Monitoring <span className="text-indigo-600 font-semibold">Acme Corp</span> production environment.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Security Score</p>
              <p className="text-xl font-bold text-zinc-900">94/100</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <button className="p-4 bg-black text-white rounded-3xl shadow-xl shadow-black/10 hover:scale-105 transition-all active:scale-95">
            <Zap className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat) => (
          <button 
            key={stat.id}
            onClick={() => onTabChange?.(stat.id)}
            className="bg-white p-6 rounded-[2.5rem] border border-zinc-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="w-5 h-5 text-zinc-300" />
            </div>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3.5 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold",
                stat.change.startsWith('+') ? "bg-emerald-50 text-emerald-600" : 
                stat.change.startsWith('-') ? "bg-red-50 text-red-600" : "bg-zinc-50 text-zinc-500"
              )}>
                <TrendingUp className="w-3 h-3" />
                {stat.change}
              </div>
            </div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-zinc-900 tracking-tight">{stat.value}</p>
          </button>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Authentication Traffic</h3>
              <p className="text-xs text-zinc-500 font-medium">Login attempts across all organizations (Last 7 Days)</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-xl bg-zinc-100 text-[10px] font-bold text-zinc-600 uppercase tracking-widest hover:bg-zinc-200 transition-colors">Daily</button>
              <button className="px-3 py-1.5 rounded-xl text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">Weekly</button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={LOGIN_DATA}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Charts */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">Users by Role</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ROLE_DATA} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                    width={70}
                  />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" fill="#1e1b4b" radius={[0, 8, 8, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">Account Status</h3>
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={STATUS_DATA}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {STATUS_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-xl font-bold text-zinc-900 leading-none">1,240</p>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Total</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity & Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Security Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-center">
                <Activity className="w-5 h-5 text-zinc-900" />
              </div>
              <div>
                <h2 className="font-bold text-zinc-900 tracking-tight">Security Activity</h2>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Real-time event stream</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2 mr-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-zinc-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-zinc-500">
                    U{i}
                  </div>
                ))}
              </div>
              <button className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
                <MoreHorizontal className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 divide-y divide-zinc-100">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center text-zinc-400 gap-4">
                <Loader2 className="w-10 h-10 animate-spin" />
                <p className="text-sm font-bold uppercase tracking-widest">Synchronizing Logs...</p>
              </div>
            ) : recentLogs.length > 0 ? (
              recentLogs.map((log) => (
                <div key={log.id} className="p-6 flex items-center gap-6 hover:bg-zinc-50 transition-all group">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110 shadow-sm",
                    log.severity === 'critical' ? "bg-red-50 text-red-600 border border-red-100" :
                    log.severity === 'high' ? "bg-orange-50 text-orange-600 border border-orange-100" :
                    log.severity === 'medium' ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-zinc-50 text-zinc-600 border border-zinc-100"
                  )}>
                    {log.action === "LOGIN" ? <LogIn className="w-6 h-6" /> : 
                     log.action === "REGISTER" ? <UserPlus className="w-6 h-6" /> : 
                     log.action === "ROLE_CHANGE" ? <Shield className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-base font-bold text-zinc-900">{log.action}</p>
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                        log.severity === 'critical' ? "bg-red-100 text-red-700 border-red-200" :
                        log.severity === 'high' ? "bg-orange-100 text-orange-700 border-orange-200" :
                        log.severity === 'medium' ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-zinc-100 text-zinc-600 border-zinc-200"
                      )}>
                        {log.severity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500">
                      <p className="text-xs font-medium truncate">{log.details}</p>
                      <span className="w-1 h-1 rounded-full bg-zinc-300" />
                      <p className="text-[10px] font-bold uppercase tracking-tight text-zinc-400">{log.userEmail}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-zinc-900">{formatTimestamp(log.timestamp)}</p>
                    <div className="flex items-center justify-end gap-1.5 mt-1">
                      <Globe className="w-3 h-3 text-zinc-300" />
                      <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">US-EAST-1</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center">
                <div className="w-16 h-16 bg-zinc-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-zinc-100">
                  <AlertCircle className="w-8 h-8 text-zinc-200" />
                </div>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No security events recorded</p>
              </div>
            )}
          </div>
          <button className="p-6 text-center text-xs font-bold text-zinc-400 hover:text-black uppercase tracking-widest transition-colors border-t border-zinc-100 bg-zinc-50/30">
            View Complete Audit Trail
          </button>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* Security Health Widget */}
          <div className="bg-zinc-900 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-900/20 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                  <Fingerprint className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">MFA Status</p>
                  <p className="text-xs font-bold text-emerald-400">75% Adoption</p>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Security Health</h3>
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-zinc-400">MFA Enforcement</span>
                  <span className="text-emerald-400 font-bold">Active</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-indigo-500" />
                </div>
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-zinc-400">Threat Detection</span>
                  <span className="text-emerald-400 font-bold">Enabled</span>
                </div>
              </div>

              <button className="w-full py-4 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95">
                Run Security Audit
              </button>
            </div>
          </div>

          {/* System Status Widget */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">Infrastructure Status</h3>
            <div className="space-y-6">
              {[
                { label: 'Authentication', status: 'Operational', icon: Key },
                { label: 'Cloud Database', status: 'Operational', icon: Globe },
                { label: 'Audit Engine', status: 'Operational', icon: Terminal },
                { label: 'API Gateway', status: 'Operational', icon: Zap },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-100">
                      <item.icon className="w-4 h-4 text-zinc-400" />
                    </div>
                    <span className="text-xs font-bold text-zinc-900">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-600/20">
            <h3 className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-6">Quick Management</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition-all text-left">
                <Lock className="w-5 h-5 mb-2" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Lock Org</p>
              </button>
              <button className="p-4 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition-all text-left">
                <UserPlus className="w-5 h-5 mb-2" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Add Admin</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Loader2: React.FC<{ className?: string }> = ({ className }) => (
  <Activity className={cn("animate-spin", className)} />
);
