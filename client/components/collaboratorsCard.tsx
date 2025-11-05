"use client";

import React from "react";

// Define the shape of the collaborator data from the API
interface Collaborator {
  id: string;
  email: string;
  researcherProfile: {
    specialties: string[];
    researchInterests: string[];
    availableForMeeting: boolean;
  } | null; // Profile might be null if not set up
}

interface CollaboratorCardProps {
  collaborator: Collaborator;
}

export default function CollaboratorCard({
  collaborator,
}: CollaboratorCardProps) {
  const { researcherProfile } = collaborator;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          {/* Main Identifier */}
          <h3 className="text-lg font-semibold text-gray-900">
            {collaborator.email}
          </h3>

          {/* Availability Badge */}
          {researcherProfile?.availableForMeeting ? (
            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              Available for meetings
            </span>
          ) : (
            <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
              Not available
            </span>
          )}
        </div>

        {researcherProfile ? (
          <>
            {/* Specialties */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-1">
                Specialties
              </h4>
              <div className="flex flex-wrap gap-2">
                {researcherProfile.specialties.map((spec, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Research Interests */}
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-1">
                Research Interests
              </h4>
              <div className="flex flex-wrap gap-2">
                {researcherProfile.researchInterests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">Profile not yet completed.</p>
        )}
      </div>

      {/* Action Footer */}
      <div className="bg-gray-50 px-6 py-4">
        <button
          disabled
          className="text-sm font-medium text-white bg-indigo-600 px-4 py-2 rounded-md opacity-50 cursor-not-allowed"
          title="Chat feature coming soon"
        >
          Send Connection Request
        </button>
      </div>
    </div>
  );
}
