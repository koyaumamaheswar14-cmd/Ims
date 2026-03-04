import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "../lib/firebase";
import { UserProfile, UserRole, ROLE_PERMISSIONS } from "../types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isManager: boolean;
  configError: boolean;
  networkError: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isManager: false,
  configError: false,
  networkError: false,
  hasPermission: () => false,
  hasRole: () => false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseDb();

      const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setNetworkError(false); // Reset on successful state change
        
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }

        if (firebaseUser) {
          const docRef = doc(db, "users", firebaseUser.uid);
          unsubscribeProfile = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              // Normalize data to handle old schema (role as string)
              const normalizedProfile: UserProfile = {
                uid: data.uid,
                email: data.email || "",
                displayName: data.displayName || "User",
                roles: Array.isArray(data.roles) 
                  ? data.roles 
                  : (data.role ? [data.role] : ["user"]),
                status: data.status || "active",
                createdAt: data.createdAt || Date.now(),
                lastLoginAt: data.lastLoginAt || Date.now(),
                invitedBy: data.invitedBy,
              };
              setProfile(normalizedProfile);
            } else {
              setProfile(null);
            }
            setLoading(false);
          }, (error) => {
            console.error("Profile snapshot error:", error);
            if (error.message?.includes("network-request-failed")) {
              setNetworkError(true);
            }
            setProfile(null);
            setLoading(false);
          });
        } else {
          setProfile(null);
          setLoading(false);
        }
      }, (error: any) => {
        console.error("Auth state change error:", error);
        if (error.message?.includes("network-request-failed")) {
          setNetworkError(true);
        }
        setLoading(false);
      });

      return () => {
        unsubscribeAuth();
        if (unsubscribeProfile) unsubscribeProfile();
      };
    } catch (error: any) {
      console.error("Auth initialization failed:", error);
      if (error.message?.includes("network-request-failed")) {
        setNetworkError(true);
      } else {
        setConfigError(true);
      }
      setLoading(false);
    }
  }, []);

  const hasRole = (role: UserRole) => {
    return profile?.roles.includes(role) || profile?.roles.includes('admin') || false;
  };

  const hasPermission = (permission: string) => {
    if (!profile) return false;
    if (profile.roles.includes('admin')) return true;
    
    return profile.roles.some(role => {
      const perms = ROLE_PERMISSIONS[role] || [];
      return perms.includes(permission) || perms.includes('all');
    });
  };

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.roles.includes("admin") || false,
    isManager: profile?.roles.some(r => ["admin", "manager"].includes(r)) || false,
    configError,
    networkError,
    hasPermission,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
