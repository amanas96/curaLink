// client/components/ProtectedRoute.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/authContext";

// This is a wrapper component
export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until loading is finished
    if (!loading) {
      // If not loading and there's no user/token, redirect to login
      if (!user || !token) {
        router.push("/login");
      }
    }
  }, [user, token, loading, router]); // Re-run effect when these change

  // 1. While loading, show a simple loading message
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // 2. If finished loading and there IS a user, show the page
  if (user && token) {
    return <>{children}</>;
  }

  // 3. If finished loading and NO user, return null (redirect is happening)
  return null;
}
