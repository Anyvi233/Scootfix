"use client";

import React, { useState, useEffect } from "react";
import { FiUsers, FiEdit, FiTrash, FiShield, FiUserCheck, FiAlertCircle } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import { apiFetch } from "@/lib/api-client";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await res.json();
      setUsers(data);
    } catch (err: unknown) {
      console.error(err);
      setError((err instanceof Error ? err.message : "An error occurred") || "An error occurred while loading user directory.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === "ADMIN" ? "CUSTOMER" : "ADMIN";
    try {
      const res = await apiFetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId, role: nextRole })
      });

      if (!res.ok) {
        throw new Error("Failed to update user role");
      }

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: nextRole } : u));
      toast.success("User role updated successfully");
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : "An error occurred") || "Failed to toggle role");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-danger/5 border border-danger/10 text-danger rounded-xl text-sm">
        <p className="font-semibold">Error Loading Users</p>
        <p className="mt-1">{error}</p>
        <button onClick={fetchUsers} className="mt-3 text-xs bg-danger/10 hover:bg-danger/20 text-danger px-3 py-1.5 rounded font-semibold transition-colors">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary">User Directory & Role Management</h1>
        <p className="text-xs text-text-secondary mt-1">Manage platform accounts, audit logins, and switch admin privilege boundaries.</p>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-elevated text-text-muted uppercase text-[10px] font-bold tracking-wider">
              <th className="px-6 py-3.5">User Details</th>
              <th className="px-6 py-3.5">Email Address</th>
              <th className="px-6 py-3.5 text-center">Assigned Role</th>
              <th className="px-6 py-3.5">Joined Date</th>
              <th className="px-6 py-3.5 text-center">Toggle role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map(u => (
              <tr key={u.id} className="text-text-secondary hover:bg-surface-elevated/40 transition-colors">
                <td className="px-6 py-3.5 flex items-center gap-3 font-medium text-text-primary">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{u.name}</span>
                </td>
                <td className="px-6 py-3.5 font-mono text-xs">{u.email}</td>
                <td className="px-6 py-3.5 text-center">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.role === "ADMIN" ? "bg-primary/10 text-primary border border-primary/20" : "bg-text-secondary/10 text-text-secondary border border-border"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-xs">{u.joined}</td>
                <td className="px-6 py-3.5 text-center">
                  <button 
                    onClick={() => toggleRole(u.id, u.role)}
                    className="p-2 text-text-muted hover:text-primary transition-all inline-flex items-center gap-1 hover:bg-primary/5 rounded-lg border border-transparent hover:border-primary/10 text-xs"
                    title="Change Privilege"
                  >
                    <FiShield size={14}/> Change
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
