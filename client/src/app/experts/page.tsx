"use client";

import React, { useState, useEffect } from "react";
import ProtectedRoute from "../../../components/protectedRoute";
import Sidebar from "../../../components/sidebar";
import { api } from "../../../lib/api";
import ExpertCard from "../../../components/expertCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Expert {
  id: string;
  email: string;
  researcherProfile: {
    specialties: string[];
    researchInterests: string[];
    availableForMeeting: boolean;
  } | null;
}

function FindExperts() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Function to fetch experts
  const fetchExperts = (query: string = "") => {
    setLoading(true);
    setError(null);

    // Call the new /api/experts endpoint
    api
      .get(`/experts?q=${query}`)
      .then((response) => {
        setExperts(response.data);
      })
      .catch((err) => {
        setError("Failed to fetch experts.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Fetch all experts on initial load
  useEffect(() => {
    fetchExperts();
  }, []);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchExperts(searchTerm);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <main className="flex-1 overflow-y-auto p-8">
        {/* header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Find Health Experts
          </h1>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by specialty or interest (e.g., Oncology)"
              className="flex-grow px-3 py-2 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
            >
              Search
            </button>
          </form>
        </div>

        {/* Results */}
        <div>
          {loading && (
            <div className="text-center text-gray-600">Loading experts...</div>
          )}

          {!loading && error && (
            <div className="text-center text-red-600 bg-red-100 p-4 rounded-md">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experts.length > 0 ? (
                experts.map((expert) => (
                  <ExpertCard key={expert.id} expert={expert} />
                ))
              ) : (
                <div className="text-center text-gray-600 col-span-full">
                  No experts found.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function FindExpertsPage() {
  return (
    <ProtectedRoute>
      <FindExperts />
    </ProtectedRoute>
  );
}
