import React, { useEffect, useState } from "react";
import { getAuditLogs } from "../services/auditService";
import { AuditLog } from "../types";
import { 
  Activity, Search, Filter, Download, Loader2, User, 
  Terminal, Globe, Shield, AlertCircle, ChevronRight,
  Calendar, Trash2, RefreshCw, FileJson, FileSpreadsheet
} from "lucide-react";
import { formatTimestamp, cn } from "../lib/utils";

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const allLogs = await getAuditLogs(100);
    setLogs(allLogs);
    setLoading(false);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;
    
    return matchesSearch && matchesSeverity;
  });

  const exportLogs = (format: 'csv' | 'json') => {
    const data = filteredLogs.map(log => ({
      timestamp: new Date(log.timestamp).toISOString(),
      user: log.userEmail,
      action: log.action,
      details: log.details,
      severity: log.severity,
      orgId: log.orgId,
      userAgent: log.userAgent
    }));

    const blob = format === 'csv' 
      ? new Blob([
          ["Timestamp", "User", "Action", "Details", "Severity", "OrgId", "UserAgent"].join(",") + "\n" +
          data.map(row => Object.values(row).map(v => `"${v}"`).join(",")).join("\n")
        ], { type: 'text/csv' })
      : new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.${format}`;
    a.click();
    setShowExportMenu(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Retrieving Audit Trail...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Security Compliance</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Audit Logs</h1>
          <p className="text-zinc-500 text-lg">Immutable record of all administrative and security events.</p>
        </div>
        
        <div className="flex items-center gap-3 relative">
          <button 
            onClick={fetchLogs}
            className="p-3 bg-white border border-zinc-200 rounded-2xl hover:bg-zinc-50 transition-all shadow-sm"
            title="Refresh Logs"
          >
            <RefreshCw className="w-5 h-5 text-zinc-500" />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-2xl text-sm font-bold hover:bg-black transition-all shadow-xl shadow-black/10"
            >
              <Download className="w-4 h-4" />
              Export Logs
            </button>
            
            {showExportMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-zinc-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <button 
                  onClick={() => exportLogs('csv')}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 rounded-xl transition-colors text-left"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-bold text-zinc-700">Export as CSV</span>
                </button>
                <button 
                  onClick={() => exportLogs('json')}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 rounded-xl transition-colors text-left"
                >
                  <FileJson className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-bold text-zinc-700">Export as JSON</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by user, action, or event details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-100 p-1 rounded-2xl">
            {['all', 'low', 'medium', 'high', 'critical'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                  severityFilter === sev 
                    ? "bg-white text-zinc-900 shadow-sm" 
                    : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                {sev}
              </button>
            ))}
          </div>
          
          <button className="p-3 bg-zinc-100 rounded-2xl hover:bg-zinc-200 transition-colors">
            <Calendar className="w-5 h-5 text-zinc-500" />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Event Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Identity</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Context</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Severity</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-110",
                        log.severity === 'critical' ? "bg-red-50 text-red-600 border-red-100" :
                        log.severity === 'high' ? "bg-orange-50 text-orange-600 border-orange-100" :
                        log.severity === 'medium' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-zinc-50 text-zinc-600 border-zinc-100"
                      )}>
                        <Activity className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-zinc-900 mb-0.5">{log.action}</p>
                        <p className="text-xs text-zinc-500 font-medium truncate max-w-[300px]">{log.details}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
                        <User className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-zinc-900 truncate">{log.userEmail}</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate">{log.userId.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Globe className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">US-EAST-1</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Terminal className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-mono truncate max-w-[150px]">
                          {log.userAgent?.includes('Chrome') ? 'Chrome / MacOS' : 
                           log.userAgent?.includes('Firefox') ? 'Firefox / Linux' :
                           log.userAgent?.includes('Safari') ? 'Safari / iOS' : 'Enterprise Client'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      log.severity === 'critical' ? "bg-red-100 text-red-700 border-red-200 shadow-[0_0_10px_rgba(239,68,68,0.1)]" :
                      log.severity === 'high' ? "bg-orange-100 text-orange-700 border-orange-200" :
                      log.severity === 'medium' ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-zinc-100 text-zinc-600 border-zinc-200"
                    )}>
                      {log.severity || 'low'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <p className="text-sm font-bold text-zinc-900">{formatTimestamp(log.timestamp)}</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">UTC-0</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLogs.length === 0 && (
          <div className="p-32 text-center">
            <div className="w-20 h-20 bg-zinc-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-zinc-100">
              <AlertCircle className="w-10 h-10 text-zinc-200" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2">No logs found</h3>
            <p className="text-zinc-500 text-sm max-w-xs mx-auto">Try adjusting your search or filters to find the events you're looking for.</p>
          </div>
        )}
        
        <div className="p-8 border-t border-zinc-100 bg-zinc-50/30 flex items-center justify-between">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Showing {filteredLogs.length} of {logs.length} events</p>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-400 hover:text-black transition-all disabled:opacity-50" disabled>Previous</button>
            <button className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-400 hover:text-black transition-all disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
