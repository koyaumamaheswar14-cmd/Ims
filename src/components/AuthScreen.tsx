import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { getFirebaseAuth, getFirebaseDb } from "../lib/firebase";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { Shield, Mail, Lock, User as UserIcon, ArrowRight, Loader2, UserPlus, Check } from "lucide-react";
import { UserProfile, UserRole } from "../types";
import { createUserProfile } from "../services/userService";
import { logAction } from "../services/auditService";
import { getInviteByEmail, acceptInvite } from "../services/inviteService";
import { cn } from "../lib/utils";

export const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(["user"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const availableRoles: UserRole[] = ["admin", "manager", "editor", "user", "viewer", "auditor", "support", "billing"];

  const toggleRole = (role: UserRole) => {
    if (selectedRoles.includes(role)) {
      if (selectedRoles.length > 1) {
        setSelectedRoles(selectedRoles.filter(r => r !== role));
      }
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseDb();
      
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await logAction(userCredential.user.uid, email, "LOGIN", "User logged in successfully", 'low');
      } else {
        // Check for invite
        const invite = await getInviteByEmail(email);
        
        // Check if this is the first user (bootstrap admin)
        const usersRef = collection(db, "users");
        const q = query(usersRef, limit(1));
        const userDocs = await getDocs(q);
        const isFirstUser = userDocs.empty;

        // In this demo mode, we allow choosing roles if no invite is present but it's not the first user
        // Normally this would be strictly invite-only
        const finalRoles = isFirstUser ? ["admin"] : (invite?.roles || selectedRoles);

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName });
        
        const profile = {
          uid: user.uid,
          email: user.email!,
          displayName: displayName,
          roles: finalRoles,
          status: "active" as const,
          createdAt: Date.now(),
          lastLoginAt: Date.now(),
          invitedBy: invite?.invitedBy,
        };
        
        await createUserProfile(profile as any);
        if (invite) await acceptInvite(invite.id);
        
        await logAction(user.uid, email, "REGISTER", `New user registered with roles: ${profile.roles.join(', ')}`, 'medium');
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-8 border border-black/5">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {isLogin ? "Enter your credentials to access IdentityPro" : "Join the enterprise identity platform"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Select Your Roles</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableRoles.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg border text-[10px] font-bold uppercase tracking-tight transition-all",
                        selectedRoles.includes(role) 
                          ? "bg-black text-white border-black" 
                          : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      {role}
                      {selectedRoles.includes(role) && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-zinc-400 mt-1 italic">
                  Note: In a production environment, roles are assigned by administrators.
                </p>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {isLogin ? "Sign In" : "Create Account"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-zinc-500 hover:text-black transition-colors font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};
