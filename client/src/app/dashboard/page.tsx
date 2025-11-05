"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../../components/protectedRoute";
import { useAuth } from "../../../context/authContext";
import { api } from "../../../lib/api";
import TrialCard from "../../../components/trialCard";
import DashboardNav from "../../../components/dashboardNav"; // <-- 1. Import new Nav
import PublicationsWidget from "../../../components/publicationWidget";
import ExpertsWidget from "../../../components/expertWidget";
import Navbar from "../../../components/mainHeader";

import { LogOut } from "lucide-react";

// Create signout handler (now living on the page component)

// Define the Trial type
interface Trial {
  nctId: string;
  title: string;
  status: string;
  location: string;
  url: string;
  summary: string;
  aiSummary: string;
}

function Dashboard() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, logout } = useAuth(); // Get user for welcome message

  const handleSignOut = () => {
    logout();
    router.push("/login");
  };

  const userInitials = user?.email.substring(0, 1).toUpperCase() || "...";

  useEffect(() => {
    api
      .get("/trials")
      .then((response) => {
        setTrials(response.data);
      })
      .catch((err) => {
        const errorMsg =
          err.response?.data?.message || "Failed to load trials.";
        setError(errorMsg);
        if (errorMsg.includes("Profile setup incomplete")) {
          router.push("/onboarding");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  if (error?.includes("Profile setup incomplete")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Redirecting to profile setup...
      </div>
    );
  }

  // --- 3. This is the new layout ---
  return (
    <div className="min-h-screen">
      {/* --- PAGE HEADER (with Sign Out on the right) --- */}
      <div className="bg-white shadow-sm pt-6 pb-4 px-8 flex justify-between items-center">
        {/* Left Side: Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Patient Dashboard
          </h1>
          <p className="text-gray-600">Welcome back, {user?.email}</p>
        </div>

        {/* Right Side: Icons & Profile */}
        <div className="flex items-center gap-6">
          <button
            className="text-gray-600 hover:text-indigo-600"
            title="Notifications"
          ></button>

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
      </div>

      {/* Tab Navigation */}

      <Navbar />
      {/* Main 3-Column Content */}
      <main className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Publications */}
          <div className="lg:col-span-1">
            <PublicationsWidget />
          </div>

          {/* Column 2: Experts */}
          <div className="lg:col-span-1">
            <ExpertsWidget />
          </div>

          {/* Column 3: Clinical Trials */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                Clinical Trials
              </h3>
              <a
                href="#"
                className="text-sm font-medium text-indigo-600 hover:underline"
              >
                Edit profile
              </a>
            </div>

            {loading && <p>Loading trials...</p>}
            {error && <p className="text-red-600">{error}</p>}

            {!loading && !error && (
              <>
                {trials.length > 0 ? (
                  trials.slice(0, 3).map(
                    (
                      trial // Show 3 trials as a "widget"
                    ) => <TrialCard key={trial.nctId} trial={trial} />
                  )
                ) : (
                  <p className="text-gray-500">No trials found.</p>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Export the component wrapped in the ProtectedRoute
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
