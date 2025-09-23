"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isAdmin } from "@/lib/auth/permissions";
import ArchivedDataDashboard from "@/components/admin/ArchivedDataDashboard";

export default function ArchivedDataPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/login");
      return;
    }

    if (!isAdmin(session)) {
      router.push("/"); // Redirect non-admin users
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session || !isAdmin(session)) {
    return null; // Prevent flash of content before redirect
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Données Archivées
        </h1>
        <p className="text-gray-600 mt-2">
          Gérer et restaurer les données archivées du système - Accès Administrateur uniquement
        </p>
      </div>

      <ArchivedDataDashboard />
    </div>
  );
}