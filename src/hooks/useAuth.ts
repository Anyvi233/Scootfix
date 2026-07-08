"use client";

import { useSession } from "next-auth/react";
import { AuthUser } from "@/types";

export function useAuth() {
  const { data: session, status } = useSession();

  const user = session?.user as AuthUser | undefined;
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const isAdmin = user?.role === "ADMIN";

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
  };
}
