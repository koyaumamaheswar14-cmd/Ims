import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { User as UserIcon, Shield, Mail, Calendar, Key } from "lucide-react";
import { formatTimestamp } from "../lib/utils";

export const ProfileView: React.FC = () => {
  const { profile } = useAuth();

  if (!profile) return null;

  const info = [
    { label: "Full Name", value: profile.displayName, icon: UserIcon },
    { label: "Email Address", value: profile.email, icon: Mail },
    { label: "Account Roles", value: (profile.roles || []).join(', ').toUpperCase() || "USER", icon: Shield },
    { label: "Member Since", value: formatTimestamp(profile.createdAt), icon: Calendar },
    { label: "Unique Identifier", value: profile.uid, icon: Key },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">My Profile</h1>
        <p className="text-zinc-500 mt-1">Manage your personal identity information and security settings.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-zinc-100 flex items-center justify-center text-3xl font-bold text-zinc-400 mb-4 border-4 border-white shadow-sm">
              {profile.displayName.charAt(0)}
            </div>
            <h2 className="text-xl font-semibold text-zinc-900">{profile.displayName}</h2>
            <p className="text-sm text-zinc-500 capitalize">{profile.role}</p>
          </div>

          <div className="space-y-6">
            {info.map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-zinc-50">
                  <item.icon className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-medium text-zinc-900 mt-0.5">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-8">
            <h3 className="font-semibold text-zinc-900 mb-4">Security Settings</h3>
            <div className="space-y-4">
              <button className="w-full text-left px-4 py-3 rounded-xl border border-black/5 hover:bg-zinc-50 transition-colors text-sm font-medium text-zinc-900">
                Change Password
              </button>
              <button className="w-full text-left px-4 py-3 rounded-xl border border-black/5 hover:bg-zinc-50 transition-colors text-sm font-medium text-zinc-900">
                Enable Two-Factor Authentication
              </button>
              <button className="w-full text-left px-4 py-3 rounded-xl border border-black/5 hover:bg-zinc-50 transition-colors text-sm font-medium text-zinc-900">
                Manage Sessions
              </button>
            </div>
          </div>

          <div className="bg-red-50 rounded-2xl border border-red-100 p-8">
            <h3 className="font-semibold text-red-900 mb-2">Danger Zone</h3>
            <p className="text-xs text-red-700 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
            <button className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
