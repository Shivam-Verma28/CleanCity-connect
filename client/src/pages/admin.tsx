import { useState } from "react";
import AdminLogin from "@/components/admin-login";
import AdminDashboard from "@/components/admin-dashboard";
import { useAuth } from "@/lib/auth";

export default function Admin() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      {isAuthenticated ? <AdminDashboard /> : <AdminLogin />}
    </main>
  );
}
