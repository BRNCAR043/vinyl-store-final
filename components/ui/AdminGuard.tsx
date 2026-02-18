"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../../lib/AuthContext";

type Props = {
  children: React.ReactNode;
  redirectTo?: string;
};

export default function AdminGuard({ children, redirectTo = "/" }: Props) {
  const { user, loading, isAdmin } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin) {
        router.replace(redirectTo);
      }
    }
  }, [user, loading, isAdmin, router, redirectTo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">Checking permissions…</div>
      </div>
    );
  }

  if (user && isAdmin) return <>{children}</>;

  return null;
}
