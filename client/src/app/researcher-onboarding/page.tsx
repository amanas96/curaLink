// client/app/researcher-onboarding/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../../components/protectedRoute";
import { api } from "../../../lib/api";
import { useAuth } from "../../../context/authContext";

function ResearcherOnboarding() {
  const [specialties, setSpecialties] = useState("");
  const [researchInterests, setResearchInterests] = useState("");
  const [availableForMeeting, setAvailableForMeeting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Call the new researcher profile endpoint
      await api.put("/researcher/me/profile", {
        // Convert comma-separated strings to arrays
        specialties: specialties.split(",").map((s) => s.trim()),
        researchInterests: researchInterests.split(",").map((s) => s.trim()),
        availableForMeeting,
      });

      // Redirect to their dashboard
      router.push("/researcher-dashboard");
    } catch (err: any) {
      console.error("Onboarding error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Researcher Profile Setup
        </h2>
        <p className="text-center text-gray-600">
          Please enter your details to complete your profile.
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="specialties"
              className="block text-sm font-medium text-gray-700"
            >
              Specialties (comma-separated)
            </label>
            <input
              id="specialties"
              name="specialties"
              required
              value={specialties}
              onChange={(e) => setSpecialties(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm"
              placeholder="e.g., Oncology, Neurology"
            />
          </div>

          <div>
            <label
              htmlFor="researchInterests"
              className="block text-sm font-medium text-gray-700"
            >
              Research Interests (comma-separated)
            </label>
            <input
              id="researchInterests"
              name="researchInterests"
              required
              value={researchInterests}
              onChange={(e) => setResearchInterests(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm"
              placeholder="e.g., Immunotherapy, Gene Therapy"
            />
          </div>

          <div className="flex items-center">
            <input
              id="availableForMeeting"
              name="availableForMeeting"
              type="checkbox"
              checked={availableForMeeting}
              onChange={(e) => setAvailableForMeeting(e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label
              htmlFor="availableForMeeting"
              className="ml-2 block text-sm text-gray-900"
            >
              Available for patient meetings
            </label>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Export the component wrapped in the ProtectedRoute
export default function ResearcherOnboardingPage() {
  return (
    <ProtectedRoute>
      <ResearcherOnboarding />
    </ProtectedRoute>
  );
}
