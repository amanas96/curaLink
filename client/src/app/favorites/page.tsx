// client/app/favorites/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import ProtectedRoute from "../../../components/protectedRoute";
import { useAuth } from "../../../context/authContext";
import { api } from "../../../lib/api"; // Use { api }
import TrialCard from "../../../components/trialCard"; // We can reuse this!
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Favorite {
  nctId: string;
  title: string;
  status: string; // We'll fill this as 'N/A'
  location: string; // We'll fill this as 'N/A'
  url: string;
  summary: string;
  aiSummary: string; // This is the 'summary' from the DB
  entityType: string;
}

function Favorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/favorites")
      .then((response) => {
        // Map the DB data to our TrialCard component's props
        const mappedFavorites = response.data.map((fav: any) => ({
          nctId: fav.entityId,
          title: fav.title,
          aiSummary: fav.summary || "No summary saved.",
          url: fav.url || "#",
          status: fav.entityType, // Show 'TRIAL' as status
          location: "N/A", // Not stored in our simple favorites
          summary: fav.summary,
        }));
        setFavorites(mappedFavorites);
      })
      .catch((err) => {
        setError("Failed to load favorites.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Saved Items</h1>
        {/* This Link tag is now corrected */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </header>

      <div>
        {loading && (
          <div className="text-center text-gray-600">Loading favorites...</div>
        )}

        {!loading && error && (
          <div className="text-center text-red-600 bg-red-100 p-4 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {favorites.length > 0 ? (
              favorites.map((fav) => <TrialCard key={fav.nctId} trial={fav} />)
            ) : (
              <div className="text-center text-gray-600">
                You haven't saved any items yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Export the component wrapped in the ProtectedRoute
export default function FavoritesPage() {
  return (
    <ProtectedRoute>
      <Favorites />
    </ProtectedRoute>
  );
}
