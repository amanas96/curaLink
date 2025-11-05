"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../../components/protectedRoute";
import { api } from "../../../lib/api";
import { useAuth } from "../../../context/authContext";
import Link from "next/link";
import { LogOut } from "lucide-react";

function ResearcherDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // --- Redirect to onboarding if profile incomplete ---
  useEffect(() => {
    if (user) {
      api
        .get("/researcher/me")
        .then((response) => {
          const profile = response.data.researcherProfile;
          if (!profile.specialties || profile.specialties.length === 0) {
            router.push("/researcher-onboarding");
          }
        })
        .catch(() => router.push("/researcher-onboarding"));
    }
  }, [user, router]);

  const handleSignOut = () => {
    logout();
    router.push("/login");
  };

  const userInitials = user?.email?.charAt(0).toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- Header Section --- */}
      <header className="bg-white shadow-sm pt-6 pb-4 px-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Researcher Dashboard
          </h1>
          <p className="text-gray-600">Welcome back, {user?.email}</p>
        </div>

        <div className="flex items-center gap-6">
          <div
            className="h-9 w-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold"
            title={user?.email}
          >
            {userInitials}
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </header>

      {/* --- Main Dashboard Content --- */}
      <main className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel — Overview */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Research Activity Overview
            </h2>
            <p className="text-gray-600 mb-6">
              Manage your research collaborations, clinical trials, and
              contributions from here.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg bg-gray-50 hover:shadow transition">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Active Trials
                </h3>
                <p className="text-gray-500 text-sm">
                  Manage and monitor your ongoing clinical trials.
                </p>
                <Link
                  href="/manage-trials"
                  className="text-indigo-600 text-sm font-medium mt-3 inline-block hover:underline"
                >
                  Go to My Trials →
                </Link>
              </div>

              <div className="p-4 border rounded-lg bg-gray-50 hover:shadow transition">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Collaboration Requests
                </h3>
                <p className="text-gray-500 text-sm">
                  Connect with fellow researchers or institutions.
                </p>
                <Link
                  href="/collaborators"
                  className="text-indigo-600 text-sm font-medium mt-3 inline-block hover:underline"
                >
                  Find Collaborators →
                </Link>
              </div>
            </div>
          </div>

          {/* Right Panel — Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>

            <div className="flex flex-col space-y-4">
              <Link
                href="/researcher-profile"
                className="w-full text-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700"
              >
                Edit My Profile
              </Link>

              <Link
                href="/find-experts"
                className="w-full text-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700"
              >
                Find Health Experts
              </Link>

              <button
                disabled
                className="w-full text-center px-4 py-2 text-sm font-medium text-white bg-gray-400 rounded-md cursor-not-allowed"
              >
                Forums (Coming Soon)
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ResearcherDashboardPage() {
  return (
    <ProtectedRoute>
      <ResearcherDashboard />
    </ProtectedRoute>
  );
}
