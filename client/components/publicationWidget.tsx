"use client";
import Link from "next/link";
import React from "react";

// Placeholder data
const publications = [
  {
    id: 1,
    title: "Fever with Rashes",
    journal: "Indian journal of pediatrics - 2018",
  },
  {
    id: 2,
    title: "The rash with maculopapules and fever in children",
    journal: "Clinics in dermatology - 2018",
  },
];

export default function PublicationsWidget() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          Recommended Publications
        </h3>
        <Link
          href="/publications"
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="space-y-4">
        {publications.map((pub) => (
          <div key={pub.id}>
            <h4 className="font-semibold text-gray-800">{pub.title}</h4>
            <p className="text-sm text-gray-500">{pub.journal}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
