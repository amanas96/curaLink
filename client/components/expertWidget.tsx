"use client";
import Link from "next/link";
import React from "react";

export default function ExpertsWidget() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Experts</h3>
        <Link
          href="/experts"
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="text-center text-gray-500 p-8 border-2 border-dashed rounded-lg">
        <p>No experts found matching your profile.</p>
        <Link
          href="/profile"
          className="text-sm font-medium text-indigo-600 hover:underline mt-2 block"
        >
          Edit profile criteria
        </Link>
      </div>
    </div>
  );
}
