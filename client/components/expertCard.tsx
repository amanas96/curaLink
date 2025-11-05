"use client";

import React from "react";
import { UserRound, CalendarCheck } from "lucide-react";

interface Expert {
  id: string;
  email: string;
  researcherProfile: {
    specialties: string[];
    researchInterests: string[];
    availableForMeeting: boolean;
  } | null;
}

interface ExpertCardProps {
  expert: Expert;
}

export default function ExpertCard({ expert }: ExpertCardProps) {
  const { researcherProfile } = expert;

  return (
    <div className="bg-white w-full rounded-2xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <UserRound size={26} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Health Expert
            </h3>
            <p className="text-sm text-gray-500">{expert.email}</p>
          </div>
        </div>

        {/* Availability Badge */}
        <div>
          {researcherProfile?.availableForMeeting ? (
            <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full border border-green-200">
              <CalendarCheck size={14} /> Available
            </span>
          ) : (
            <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full border border-gray-200">
              Unavailable
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5">
        {researcherProfile ? (
          <>
            {/* Specialties */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Specialties
              </h4>
              <div className="flex flex-wrap gap-2">
                {researcherProfile.specialties.map((spec, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs bg-indigo-50 text-indigo-700 font-medium rounded-full border border-indigo-100"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Research Interests */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Research Interests
              </h4>
              <div className="flex flex-wrap gap-2">
                {researcherProfile.researchInterests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs bg-purple-50 text-purple-700 font-medium rounded-full border border-purple-100"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500 italic">
            Profile not yet completed.
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
        <button
          disabled={!researcherProfile?.availableForMeeting}
          className={`px-5 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
            researcherProfile?.availableForMeeting
              ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          Request Meeting
        </button>
      </div>
    </div>
  );
}
