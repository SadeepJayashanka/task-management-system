"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            Task Manager
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Welcome, <span className="font-semibold">{user?.name}</span>
            </span>

            {user?.role === "Admin" && (
              <Link
                href="/audit-logs"
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                Audit Logs
              </Link>
            )}

            <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
              {user?.role}
            </span>

            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
