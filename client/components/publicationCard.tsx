"use client";

import React from "react";

// Define the shape of the publication data
interface Publication {
  id: string;
  title: string;
  authors: string;
  journal: string;
  pubDate: string;
  url: string;
  aiSummary: string;
}

interface PublicationCardProps {
  publication: Publication;
}

export default function PublicationCard({ publication }: PublicationCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {publication.title}
        </h3>

        <div className="text-sm text-gray-600 mb-4">
          <p>
            <strong>Authors:</strong> {publication.authors}
          </p>
          <p>
            <strong>Journal:</strong> {publication.journal} (
            {publication.pubDate})
          </p>
        </div>

        {/* AI Summary */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">
            AI-Powered Summary
          </h4>
          <p className="text-sm text-gray-800">{publication.aiSummary}</p>
        </div>
      </div>

      <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
        <a
          href={publication.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          View on PubMed &rarr;
        </a>
        {/* We could add a "Save" button here just like the TrialCard */}
      </div>
    </div>
  );
}
