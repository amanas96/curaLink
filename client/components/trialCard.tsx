// client/components/TrialCard.tsx
"use client";

import React, { useState } from "react";
import { api } from "../lib/api";

// Define the shape of the trial data
interface Trial {
  nctId: string;
  title: string;
  status: string;
  location: string;
  url: string;
  summary: string;
  aiSummary: string;
  // Add entityType for favorites
  entityType?: string;
}

interface TrialCardProps {
  trial: Trial;
}

export default function TrialCard({ trial }: TrialCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaveError(null);

    try {
      await api.post("/favorites", {
        entityId: trial.nctId,
        entityType: "TRIAL", // Hardcode as TRIAL
        title: trial.title,
        summary: trial.aiSummary, // Save the AI summary
        url: trial.url,
      });
      setIsSaved(true);
    } catch (err: any) {
      if (err.response && err.response.status === 409) {
        setSaveError("Already saved");
      } else {
        setSaveError("Failed to save");
      }
      setIsSaved(true); // Prevent repeated clicks even on error
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {trial.title}
        </h3>

        <div className="flex space-x-4 text-sm text-gray-600 mb-4">
          <span>
            <strong>ID:</strong> {trial.nctId}
          </span>
          <span>
            <strong>Status:</strong>{" "}
            <span className="text-green-600 font-medium">{trial.status}</span>
          </span>
          <span>
            <strong>Location:</strong> {trial.location}
          </span>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-md">
          <h4 className="text-sm font-semibold text-indigo-800 mb-2">
            AI-Powered Summary
          </h4>
          <div
            className="text-sm text-gray-800 space-y-1"
            dangerouslySetInnerHTML={{
              __html: trial.aiSummary.replace(/\n/g, "<br />"),
            }}
          />
        </div>
      </div>

      <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
        <a
          href={trial.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          View Full Trial Details &rarr;
        </a>

        {/* --- NEW SAVE BUTTON --- */}
        <button
          onClick={handleSave}
          disabled={isSaved}
          className={`px-3 py-1 text-sm font-medium rounded-md ${
            isSaved
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {isSaved ? (saveError ? saveError : "Saved") : "Save"}
        </button>
        {/* ----------------------- */}
      </div>
    </div>
  );
}
