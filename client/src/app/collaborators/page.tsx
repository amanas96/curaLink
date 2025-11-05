"use client";

import React, { useState, useEffect } from "react";
import ProtectedRoute from "../../../components/protectedRoute";
import { useAuth } from "../../../context/authContext";
import { api } from "../../../lib/api";
import CollaboratorCard from "../../../components/collaboratorsCard";
import Link from "next/link";

// Define the Collaborator type
interface Collaborator {
  id: string;
  email: string;
  researcherProfile: {
    specialties: string[];
    researchInterests: string[];
    availableForMeeting: boolean;
  } | null;
}

function Collaborators() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Function to fetch collaborators
  const fetchCollaborators = (query: string = "") => {
    setLoading(true);
    setError(null);

    api
      .get(`/collaborators?q=${query}`)
      .then((response) => {
        setCollaborators(response.data);
      })
      .catch((err) => {
        setError("Failed to fetch collaborators.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Fetch all collaborators on initial load
  useEffect(() => {
    fetchCollaborators();
  }, []);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCollaborators(searchTerm);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Find Collaborators</h1>
        <Link
          href="/researcher-dashboard"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          &larr; Back to Dashboard
        </Link>
      </header>

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
          <div className="text-center text-gray-600">
            Loading collaborators...
          </div>
        )}

        {!loading && error && (
          <div className="text-center text-red-600 bg-red-100 p-4 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collaborators.length > 0 ? (
              collaborators.map((collab) => (
                <CollaboratorCard key={collab.id} collaborator={collab} />
              ))
            ) : (
              <div className="text-center text-gray-600 col-span-full">
                No collaborators found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Export the component wrapped in the ProtectedRoute
export default function CollaboratorsPage() {
  return (
    <ProtectedRoute>
      <Collaborators />
    </ProtectedRoute>
  );
}
