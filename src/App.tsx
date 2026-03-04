/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { UserProfile, UserRole } from "./types";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { auth } from "./lib/firebase";
import { AuthScreen } from "./components/AuthScreen";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { UserManagement } from "./components/UserManagement";
import { OrganizationManagement } from "./components/OrganizationManagement";
import { InvitationManagement } from "./components/InvitationManagement";
import { AuditLogs } from "./components/AuditLogs";
import { ProfileView } from "./components/ProfileView";
import { PermissionGuard } from "./components/PermissionGuard";
import { formatTimestamp, cn } from "./lib/utils";
import { Loader2, Shield, Check, Lock, Key } from "lucide-react";

function AppContent() {
  const { user, loading, profile, configError, networkError } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [repairRoles, setRepairRoles] = useState<UserRole[]>(["user"]);

  const availableRoles: UserRole[] = ["admin", "manager", "editor", "user", "viewer", "auditor", "support", "billing"];

  if (networkError) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5 max-w-md text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Network Connection Failed</h1>
          <p className="text-zinc-500 mb-6 text-sm">
            IdentityPro is unable to reach the authentication servers. This is often caused by an ad-blocker or a restrictive firewall.
          </p>
          <div className="bg-zinc-50 p-4 rounded-xl text-left mb-6">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Troubleshooting Steps:</p>
            <ul className="text-[11px] text-zinc-600 space-y-2">
              <li>• Disable ad-blockers (uBlock, AdBlock, etc.)</li>
              <li>• Check if you are behind a corporate VPN/Firewall</li>
              <li>• Try opening the app in a new tab (Shared URL)</li>
              <li>• Ensure your internet connection is stable</li>
            </ul>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-black text-white rounded-xl font-medium text-sm hover:bg-zinc-800 transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (configError) {
// ... (rest of the component)
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5 max-w-md text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Configuration Required</h1>
          <p className="text-zinc-500 mb-6 text-sm">
            Firebase environment variables are missing. Please configure your project secrets in the AI Studio panel to enable identity management.
          </p>
          <div className="bg-zinc-50 p-4 rounded-xl text-left mb-6">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Required Variables:</p>
            <ul className="text-[11px] font-mono text-zinc-600 space-y-1">
              <li>• VITE_FIREBASE_API_KEY</li>
              <li>• VITE_FIREBASE_PROJECT_ID</li>
              <li>• VITE_FIREBASE_AUTH_DOMAIN</li>
            </ul>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-black text-white rounded-xl font-medium text-sm hover:bg-zinc-800 transition-all"
          >
            Check Configuration
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (!profile) {
    const handleInitializeProfile = async () => {
      try {
        const { createUserProfile } = await import("./services/userService");
        const { logAction } = await import("./services/auditService");
        
        const newProfile = {
          uid: user.uid,
          email: user.email || "",
          displayName: user.displayName || user.email?.split('@')[0] || "User",
          roles: repairRoles,
          status: "active" as const,
          createdAt: Date.now(),
          lastLoginAt: Date.now(),
        };
        
        await createUserProfile(newProfile as any);
        await logAction(user.uid, user.email || "unknown", "PROFILE_REPAIR", `User manually initialized profile with roles: ${repairRoles.join(', ')}`, 'medium');
      } catch (error) {
        console.error("Failed to initialize profile:", error);
        alert("Failed to create profile. Please check your Firestore permissions.");
      }
    };

    const toggleRepairRole = (role: UserRole) => {
      if (repairRoles.includes(role)) {
        if (repairRoles.length > 1) {
          setRepairRoles(repairRoles.filter(r => r !== role));
        }
      } else {
        setRepairRoles([...repairRoles, role]);
      }
    };

    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5 max-w-md text-center">
          <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
          </div>
          <h1 className="text-xl font-semibold text-zinc-900 mb-2">Setting up your profile...</h1>
          <p className="text-zinc-500 text-sm mb-6">
            Choose your initial roles to get started.
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-2">
              {availableRoles.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRepairRole(role)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg border text-[10px] font-bold uppercase tracking-tight transition-all",
                    repairRoles.includes(role) 
                      ? "bg-black text-white border-black" 
                      : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
                  )}
                >
                  {role}
                  {repairRoles.includes(role) && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-zinc-50 p-4 rounded-xl text-left mb-6 border border-black/5">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Your Auth UID:</p>
            <p className="text-[11px] font-mono text-zinc-600 break-all bg-white p-2 rounded border border-black/5">
              {user.uid}
            </p>
          </div>

          <div className="space-y-3">
            <button 
              onClick={handleInitializeProfile}
              className="w-full py-3 bg-black text-white rounded-xl font-medium text-sm hover:bg-zinc-800 transition-all shadow-sm"
            >
              Initialize My Profile
            </button>
            <button 
              onClick={() => auth.signOut()}
              className="w-full py-3 bg-white text-zinc-500 border border-black/5 rounded-xl text-sm font-medium hover:bg-zinc-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (profile.status === 'suspended') {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Account Suspended</h1>
          <p className="text-zinc-500 mb-6">Your access to IdentityPro has been suspended. Please contact your administrator for more information.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-black text-white rounded-xl font-medium"
          >
            Retry Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === "dashboard" && <Dashboard onTabChange={setActiveTab} />}
      {activeTab === "users" && (
        <PermissionGuard permission="view_users">
          <UserManagement />
        </PermissionGuard>
      )}
      {activeTab === "roles" && (
        <PermissionGuard permission="view_roles">
          <div className="bg-white p-12 rounded-[2.5rem] border border-zinc-200 shadow-sm text-center">
            <Shield className="w-16 h-16 text-zinc-200 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">Advanced RBAC Engine</h2>
            <p className="text-zinc-500 max-w-md mx-auto">Manage granular permissions, role inheritance, and custom access policies. This feature is currently in preview for Enterprise customers.</p>
          </div>
        </PermissionGuard>
      )}
      {activeTab === "orgs" && (
        <PermissionGuard permission="view_orgs">
          <OrganizationManagement />
        </PermissionGuard>
      )}
      {activeTab === "invites" && (
        <PermissionGuard permission="view_users">
          <InvitationManagement />
        </PermissionGuard>
      )}
      {activeTab === "audit" && (
        <PermissionGuard permission="view_audit">
          <AuditLogs />
        </PermissionGuard>
      )}
      {activeTab === "security" && (
        <div className="bg-white p-12 rounded-[2.5rem] border border-zinc-200 shadow-sm text-center">
          <Lock className="w-16 h-16 text-zinc-200 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Security Center</h2>
          <p className="text-zinc-500 max-w-md mx-auto">Configure MFA, session policies, IP whitelisting, and threat detection settings for your organization.</p>
        </div>
      )}
      {activeTab === "api" && (
        <div className="bg-white p-12 rounded-[2.5rem] border border-zinc-200 shadow-sm text-center">
          <Key className="w-16 h-16 text-zinc-200 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">API Management</h2>
          <p className="text-zinc-500 max-w-md mx-auto">Generate and manage API keys for programmatic access to the IdentityPro management engine.</p>
        </div>
      )}
      {activeTab === "profile" && <ProfileView />}
      {activeTab === "settings" && <ProfileView />}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
