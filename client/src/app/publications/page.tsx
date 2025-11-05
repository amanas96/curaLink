"use client";

import React, { useState } from "react";
import ProtectedRoute from "../../../components/protectedRoute";
import Sidebar from "../../../components/sidebar"; // Import Sidebar
import { api } from "../../../lib/api";
import PublicationCard from "../../../components/publicationCard"; // Import the new Card
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Define the Publication type
interface Publication {
  id: string;
  title: string;
  authors: string;
  journal: string;
  pubDate: string;
  url: string;
  aiSummary: string;
}

function Publications() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setPublications([]);

    // Call the new /api/publications endpoint
    api
      .get(`/publications?q=${searchTerm}`)
      .then((response) => {
        setPublications(response.data);
      })
      .catch((err) => {
        setError("Failed to fetch publications.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Search Publications
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
              placeholder="Search PubMed (e.g., Glioma, Immunotherapy)"
              className="flex-grow px-3 py-2 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
        </div>

        {/* Results */}
        <div>
          {loading && (
            <div className="text-center text-gray-600">
              Loading publications...
            </div>
          )}

          {!loading && error && (
            <div className="text-center text-red-600 bg-red-100 p-4 rounded-md">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-6">
              {publications.length > 0 ? (
                publications.map((pub) => (
                  <PublicationCard key={pub.id} publication={pub} />
                ))
              ) : (
                <div className="text-center text-gray-500 bg-white p-6 rounded-lg shadow">
                  Please enter a search term to find publications.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Export the component wrapped in the ProtectedRoute
export default function PublicationsPage() {
  return (
    <ProtectedRoute>
      <Publications />
    </ProtectedRoute>
  );
}
