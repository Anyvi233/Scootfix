"use client";

import React from "react";
import { FiActivity, FiShield, FiUser } from "react-icons/fi";

const MOCK_LOGS = [
  { id: "1", action: "RESTOCK", desc: "Added 20 units to Smart Digital Display Console V2", user: "Admin User", ip: "192.168.1.10", date: "Oct 22, 2025, 11:24 AM" },
  { id: "2", action: "COUPON_CREATE", desc: "Generated campaign coupon EVSTART10", user: "Admin User", ip: "192.168.1.10", date: "Oct 20, 2025, 04:12 PM" },
  { id: "3", action: "ROLE_CHANGE", desc: "Updated Anu V. privileges to CUSTOMER", user: "Admin User", ip: "192.168.1.10", date: "Oct 19, 2025, 09:48 AM" },
];

export default function AdminLogsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-2">
          <FiActivity className="text-primary"/> Security Audit Logs
        </h1>
        <p className="text-xs text-text-secondary mt-1">Audit administrative operations, stock logs, database access records, and privilege updates.</p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <div className="divide-y divide-border">
          {MOCK_LOGS.map(log => (
            <div key={log.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
              <div className="space-y-1.5 max-w-md">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${log.action.includes("RESTOCK") ? "bg-success/10 text-success border border-success/20" : "bg-primary/10 text-primary border border-primary/20"}`}>
                    {log.action}
                  </span>
                  <span className="text-text-muted font-medium font-mono">{log.date}</span>
                </div>
                <p className="text-text-primary text-sm font-medium">{log.desc}</p>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
                <div className="text-right space-y-1">
                  <p className="font-semibold text-text-primary flex items-center gap-1"><FiUser size={13}/> {log.user}</p>
                  <p className="text-text-muted font-mono text-[10px]">IP: {log.ip}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
