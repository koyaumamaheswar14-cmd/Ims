import React, { useEffect, useState } from "react";
import { Mail, Plus, Search, Filter, MoreVertical, Calendar, CheckCircle2, XCircle, Loader2, UserPlus, Clock, ArrowRight, Globe } from "lucide-react";
import { UserInvite } from "../types";
import { cn, formatTimestamp } from "../lib/utils";

export const InvitationManagement: React.FC = () => {
  const [invites, setInvites] = useState<UserInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Mock data for now, in production this would fetch from Firestore
    const mockInvites: UserInvite[] = [
      { 
        id: "inv_1", 
        email: "sarah.connor@acme.com", 
        roles: ["manager", "editor"], 
        orgId: "org_1", 
        invitedBy: "admin_1", 
        invitedAt: Date.now() - 86400000 * 2, 
        status: "pending", 
        expiresAt: Date.now() + 86400000 * 5 
      },
      { 
        id: "inv_2", 
        email: "john.wick@globex.io", 
        roles: ["user"], 
        orgId: "org_2", 
        invitedBy: "admin_1", 
        invitedAt: Date.now() - 86400000 * 1, 
        status: "accepted", 
        expiresAt: Date.now() + 86400000 * 6 
      },
      { 
        id: "inv_3", 
        email: "tony.stark@stark.com", 
        roles: ["admin"], 
        orgId: "org_1", 
        invitedBy: "admin_1", 
        invitedAt: Date.now() - 86400000 * 10, 
        status: "expired", 
        expiresAt: Date.now() - 86400000 * 3 
      },
    ];
    setInvites(mockInvites);
    setLoading(false);
  }, []);

  const filteredInvites = invites.filter(invite => 
    invite.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Invitations</h1>
          <p className="text-zinc-500 mt-1">Manage pending user invites and their access levels.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-2xl text-sm font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-black/10">
          <UserPlus className="w-4 h-4" />
          Invite New User
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search invites by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all shadow-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-5 py-3 bg-white border border-zinc-200 rounded-2xl text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all shadow-sm">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Recipient</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Roles & Org</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sent / Expires</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredInvites.map((invite) => (
                <tr key={invite.id} className="hover:bg-zinc-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center border border-zinc-200 group-hover:bg-white transition-colors">
                        <Mail className="w-5 h-5 text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{invite.email}</p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">ID: {invite.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex flex-wrap gap-1">
                        {invite.roles.map(role => (
                          <span key={role} className="px-1.5 py-0.5 rounded bg-zinc-100 text-[9px] font-bold text-zinc-600 uppercase tracking-tight">
                            {role}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Globe className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{invite.orgId}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest",
                      invite.status === 'pending' ? "bg-amber-50 text-amber-600" :
                      invite.status === 'accepted' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    )}>
                      {invite.status === 'pending' ? <Clock className="w-3 h-3" /> : 
                       invite.status === 'accepted' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {invite.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <p className="text-xs font-bold text-zinc-900">{formatTimestamp(invite.invitedAt)}</p>
                      <p className={cn(
                        "text-[10px] font-bold uppercase tracking-widest mt-0.5",
                        invite.expiresAt < Date.now() ? "text-red-400" : "text-zinc-400"
                      )}>
                        Exp: {new Date(invite.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {invite.status === 'pending' && (
                        <button className="p-2 hover:bg-white hover:text-black text-zinc-400 border border-transparent hover:border-zinc-200 rounded-xl transition-all shadow-sm">
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-2 hover:bg-white hover:text-black text-zinc-400 border border-transparent hover:border-zinc-200 rounded-xl transition-all shadow-sm">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredInvites.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-sm text-zinc-500 font-medium">No invites found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};
