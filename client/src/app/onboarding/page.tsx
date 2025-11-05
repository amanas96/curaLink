// client/app/onboarding/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../../components/protectedRoute";
import { api } from "../../../lib/api";
import { useAuth } from "../../../context/authContext";

function Onboarding() {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth(); // Get user info

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const aiResponse = await api.post("/ai/parse-condition", { text });

      const { conditions, location } = aiResponse.data;

      if (!conditions || !location || conditions.length === 0) {
        setError(
          'Could not understand details. Please be more specific, like "I have brain cancer and live in New York."'
        );
        setLoading(false);
        return;
      }

      await api.put("/patient/me/profile", {
        conditions,
        location,
      });

      router.push("/dashboard");
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
          Welcome, {user?.email}!
        </h2>
        <p className="text-center text-gray-600">
          Let's personalize your account. Please describe your medical condition
          and location in one sentence.
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="details"
              className="block text-sm font-medium text-gray-700"
            >
              Example: "I have lung cancer and live in Boston, MA."
            </label>
            <textarea
              id="details"
              name="details"
              rows={3}
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="I have..."
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            >
              {loading ? "Saving..." : "Save and Go to Dashboard"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <Onboarding />
    </ProtectedRoute>
  );
}
