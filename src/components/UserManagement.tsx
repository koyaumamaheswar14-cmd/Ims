import React, { useEffect, useState } from "react";
import { getAllUsers, updateUserRoles, updateUserProfile } from "../services/userService";
import { UserProfile, UserRole } from "../types";
import { Shield, MoreVertical, UserX, UserCheck, ShieldCheck, Loader2, UserPlus, X, Check, Search, Filter, Globe, Mail, Building2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { logAction } from "../services/auditService";
import { createInvite } from "../services/inviteService";
import { formatTimestamp, cn } from "../lib/utils";

export const UserManagement: React.FC = () => {
  const { profile: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoles, setInviteRoles] = useState<UserRole[]>(["user"]);
  const [inviteOrg, setInviteOrg] = useState("org_1");
  const [inviting, setInviting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    const allUsers = await getAllUsers();
    setUsers(allUsers);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleToggle = async (uid: string, email: string, currentRoles: UserRole[], roleToToggle: UserRole) => {
    try {
      let newRoles: UserRole[];
      if (currentRoles.includes(roleToToggle)) {
        newRoles = currentRoles.filter(r => r !== roleToToggle);
      } else {
        newRoles = [...currentRoles, roleToToggle];
      }
      
      if (newRoles.length === 0) newRoles = ["user"];

      await updateUserRoles(uid, newRoles);
      await logAction(currentUser!.uid, currentUser!.email, "ROLE_CHANGE", `Updated roles for ${email} to: ${newRoles.join(', ')}`, 'medium');
      await fetchUsers();
    } catch (error) {
      console.error("Failed to update roles:", error);
    }
  };

  const handleStatusChange = async (uid: string, email: string, newStatus: 'active' | 'suspended') => {
    try {
      await updateUserProfile(uid, { status: newStatus });
      await logAction(currentUser!.uid, currentUser!.email, "STATUS_CHANGE", `${newStatus === 'suspended' ? 'Suspended' : 'Activated'} user ${email}`, 'high');
      await fetchUsers();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      await createInvite(inviteEmail, inviteRoles, currentUser!.uid);
      await logAction(currentUser!.uid, currentUser!.email, "INVITE_SENT", `Sent invite to ${inviteEmail} for ${inviteOrg} with roles: ${inviteRoles.join(', ')}`, 'medium');
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteRoles(["user"]);
      alert("Invite sent successfully!");
    } catch (error) {
      console.error("Invite failed:", error);
      alert("Failed to send invite.");
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  const availableRoles: UserRole[] = ["admin", "manager", "editor", "user", "viewer", "auditor", "support", "billing"];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">User Management</h1>
          <p className="text-zinc-500 mt-1">Manage enterprise users, roles, and access permissions across organizations.</p>
        </div>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-2xl text-sm font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-black/10"
        >
          <UserPlus className="w-4 h-4" />
          Invite User
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
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

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900">Invite New User</h2>
                <p className="text-sm text-zinc-500 mt-1">Send a secure invitation to join your organization.</p>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    placeholder="colleague@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Organization</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <select
                    value={inviteOrg}
                    onChange={(e) => setInviteOrg(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all appearance-none"
                  >
                    <option value="org_1">Acme Corp (Production)</option>
                    <option value="org_2">Globex Corp (Staging)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Assign Roles</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableRoles.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        if (inviteRoles.includes(role)) {
                          setInviteRoles(inviteRoles.filter(r => r !== role));
                        } else {
                          setInviteRoles([...inviteRoles, role]);
                        }
                      }}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-tight transition-all",
                        inviteRoles.includes(role) 
                          ? "bg-black text-white border-black shadow-lg shadow-black/10" 
                          : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      {role}
                      {inviteRoles.includes(role) && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={inviting || inviteRoles.length === 0}
                className="w-full py-4 bg-black text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all disabled:opacity-50 shadow-xl shadow-black/10"
              >
                {inviting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Secure Invitation"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">User Profile</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Roles & Permissions</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Organization</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredUsers.map((user) => (
                <tr key={user.uid} className="hover:bg-zinc-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-sm font-bold text-zinc-500 border border-zinc-200 group-hover:bg-white transition-colors">
                        {user.displayName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{user.displayName}</p>
                        <p className="text-xs text-zinc-500 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                      {availableRoles.map(role => (
                        <button
                          key={role}
                          disabled={user.uid === currentUser?.uid}
                          onClick={() => handleRoleToggle(user.uid, user.email, user.roles || [], role)}
                          className={cn(
                            "px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-tight transition-all",
                            (user.roles || []).includes(role)
                              ? "bg-zinc-900 text-white shadow-sm"
                              : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
                          )}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest",
                      user.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    )}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Globe className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{user.orgId || 'Default'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {user.uid !== currentUser?.uid && (
                        <button
                          onClick={() => handleStatusChange(user.uid, user.email, user.status === 'active' ? 'suspended' : 'active')}
                          className={cn(
                            "p-2.5 rounded-xl border transition-all shadow-sm",
                            user.status === 'active' 
                              ? "text-red-600 bg-white border-zinc-200 hover:bg-red-50 hover:border-red-100" 
                              : "text-emerald-600 bg-white border-zinc-200 hover:bg-emerald-50 hover:border-emerald-100"
                          )}
                          title={user.status === 'active' ? "Suspend User" : "Activate User"}
                        >
                          {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      )}
                      <button className="p-2.5 bg-white border border-zinc-200 text-zinc-400 rounded-xl hover:text-black transition-all shadow-sm">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-sm text-zinc-500 font-medium">No users found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};
