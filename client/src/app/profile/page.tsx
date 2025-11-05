"use client";

import React, { useState, useEffect } from "react";
import ProtectedRoute from "../../../components/protectedRoute";
import { useAuth } from "../../../context/authContext";
import { api } from "../../../lib/api";
import Link from "next/link";

// --- Patient Profile Form ---
const PatientProfileForm = ({ profile }: { profile: any }) => {
  const [conditions, setConditions] = useState(
    profile.conditions?.join(", ") || ""
  );
  const [location, setLocation] = useState(profile.location || "");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await api.put("/patient/me/profile", {
        conditions: conditions.split(",").map((c: string) => c.trim()),
        location,
      });
      setMessage("✅ Profile updated successfully!");
    } catch (err) {
      setMessage("❌ Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-gradient-to-b from-white to-gray-50 p-6 rounded-xl shadow-md border border-gray-200"
    >
      <div>
        <label
          htmlFor="conditions"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          Medical Conditions
        </label>
        <input
          id="conditions"
          value={conditions}
          onChange={(e) => setConditions(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          placeholder="e.g., Diabetes, Hypertension"
        />
      </div>
      <div>
        <label
          htmlFor="location"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          Your Location
        </label>
        <input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          placeholder="e.g., New Delhi, India"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400"
      >
        {loading ? "Saving..." : "Save Profile"}
      </button>
      {message && (
        <p
          className={`text-center text-sm ${
            message.includes("Failed") ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
};

// --- Researcher Profile Form ---
const ResearcherProfileForm = ({ profile }: { profile: any }) => {
  const [specialties, setSpecialties] = useState(
    profile.specialties?.join(", ") || ""
  );
  const [researchInterests, setResearchInterests] = useState(
    profile.researchInterests?.join(", ") || ""
  );
  const [availableForMeeting, setAvailableForMeeting] = useState(
    profile.availableForMeeting || false
  );
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await api.put("/researcher/me/profile", {
        specialties: specialties.split(",").map((s: string) => s.trim()),
        researchInterests: researchInterests
          .split(",")
          .map((s: string) => s.trim()),
        availableForMeeting,
      });
      setMessage("✅ Profile updated successfully!");
    } catch (err) {
      setMessage("❌ Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-gradient-to-b from-white to-gray-50 p-6 rounded-xl shadow-md border border-gray-200"
    >
      <div>
        <label
          htmlFor="specialties"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          Your Specialties
        </label>
        <input
          id="specialties"
          value={specialties}
          onChange={(e) => setSpecialties(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          placeholder="e.g., Oncology, Neurology"
        />
      </div>
      <div>
        <label
          htmlFor="researchInterests"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          Research Interests
        </label>
        <input
          id="researchInterests"
          value={researchInterests}
          onChange={(e) => setResearchInterests(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          placeholder="e.g., Immunotherapy, Gene Therapy"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="availableForMeeting"
          type="checkbox"
          checked={availableForMeeting}
          onChange={(e) => setAvailableForMeeting(e.target.checked)}
          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <label
          htmlFor="availableForMeeting"
          className="text-sm text-gray-800 font-medium"
        >
          Available for patient meetings
        </label>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400"
      >
        {loading ? "Saving..." : "Save Profile"}
      </button>
      {message && (
        <p
          className={`text-center text-sm ${
            message.includes("Failed") ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
};

// --- Main Profile Page ---
function Profile() {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const endpoint =
        user.role === "PATIENT" ? "/patient/me" : "/researcher/me";
      api
        .get(endpoint)
        .then((response) => {
          setProfileData(response.data);
        })
        .catch((err) => {
          console.error("Failed to fetch profile", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-wide">CuraLink</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium bg-white text-indigo-600 px-3 py-1.5 rounded-md hover:bg-gray-100 transition"
          >
            ← Back to Dashboard
          </Link>
          <button
            onClick={logout}
            className="text-sm font-medium bg-red-600 px-3 py-1.5 rounded-md hover:bg-red-700 transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Section */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-10">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
            Manage Your Profile
          </h1>

          {loading && (
            <p className="text-center text-gray-600">Loading your profile...</p>
          )}

          {!loading && profileData && user?.role === "PATIENT" && (
            <PatientProfileForm profile={profileData.patientProfile || {}} />
          )}

          {!loading && profileData && user?.role === "RESEARCHER" && (
            <ResearcherProfileForm
              profile={profileData.researcherProfile || {}}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  );
}
