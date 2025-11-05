"use client";

import React, { useState, useEffect } from "react";
import ProtectedRoute from "../../../components/protectedRoute";
import { useAuth } from "../../../context/authContext";
import { api } from "../../../lib/api";
import Link from "next/link";

// Define the shape of a trial
interface ClinicalTrial {
  id: string;
  nctId: string;
  title: string;
  description: string;
  status: string;
  phase: string;
  eligibility: string;
}

// Form state
const initialFormState = {
  nctId: "",
  title: "",
  description: "",
  status: "RECRUITING",
  phase: "Phase 1",
  eligibility: "",
};

function ManageTrials() {
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch all trials owned by this researcher
  const fetchTrials = () => {
    setLoading(true);
    api
      .get("/trials-management")
      .then((response) => {
        setTrials(response.data);
      })
      .catch((err) => {
        setError("Failed to load your trials.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Fetch trials on component mount
  useEffect(() => {
    fetchTrials();
  }, []);

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission to create a new trial
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      await api.post("/trials-management", formState);
      setFormState(initialFormState); // Reset form
      fetchTrials(); // Refresh the list
    } catch (err: any) {
      if (err.response?.data?.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError("Failed to create trial.");
      }
    }
  };

  // Handle deleting a trial
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this trial?")) {
      try {
        await api.delete(`/trials-management/${id}`);
        fetchTrials(); // Refresh the list
      } catch (err) {
        alert("Failed to delete trial.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Manage Your Clinical Trials
        </h1>
        <Link
          href="/researcher-dashboard"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          &larr; Back to Dashboard
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- ADD NEW TRIAL FORM --- */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit">
          <h2 className="text-xl font-semibold mb-4">Add New Trial</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormInput
              name="nctId"
              label="NCT ID (e.g., NCT12345)"
              value={formState.nctId}
              onChange={handleFormChange}
            />
            <FormInput
              name="title"
              label="Official Title"
              value={formState.title}
              onChange={handleFormChange}
            />
            <FormTextarea
              name="description"
              label="Brief Description"
              value={formState.description}
              onChange={handleFormChange}
            />
            <FormSelect
              name="status"
              label="Status"
              value={formState.status}
              onChange={handleFormChange}
              options={[
                "RECRUITING",
                "COMPLETED",
                "ACTIVE_NOT_RECRUITING",
                "TERMINATED",
              ]}
            />
            <FormSelect
              name="phase"
              label="Phase"
              value={formState.phase}
              onChange={handleFormChange}
              options={["Phase 1", "Phase 2", "Phase 3", "Phase 4", "N/A"]}
            />
            <FormTextarea
              name="eligibility"
              label="Eligibility Criteria"
              value={formState.eligibility}
              onChange={handleFormChange}
            />

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Add Trial
            </button>
          </form>
        </div>

        {/* --- LIST OF YOUR TRIALS --- */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your Added Trials</h2>
          {loading && <p>Loading trials...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && !error && (
            <div className="space-y-4">
              {trials.length > 0 ? (
                trials.map((trial) => (
                  <div
                    key={trial.id}
                    className="border border-gray-200 p-4 rounded-md"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">
                          {trial.title} ({trial.nctId})
                        </h3>
                        <span className="text-sm text-gray-500">
                          {trial.status} - {trial.phase}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          disabled
                          className="text-sm text-blue-600 opacity-50 cursor-not-allowed"
                          title="Edit coming soon"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(trial.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  You have not added any trials yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Helper Components for the Form ---
const FormInput = ({ label, ...props }: any) => (
  <div>
    <label
      htmlFor={props.name}
      className="block text-sm font-medium text-gray-700"
    >
      {label}
    </label>
    <input
      id={props.name}
      {...props}
      required
      className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
    />
  </div>
);

const FormTextarea = ({ label, ...props }: any) => (
  <div>
    <label
      htmlFor={props.name}
      className="block text-sm font-medium text-gray-700"
    >
      {label}
    </label>
    <textarea
      id={props.name}
      rows={3}
      {...props}
      required
      className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
    />
  </div>
);

const FormSelect = ({ label, options, ...props }: any) => (
  <div>
    <label
      htmlFor={props.name}
      className="block text-sm font-medium text-gray-700"
    >
      {label}
    </label>
    <select
      id={props.name}
      {...props}
      required
      className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
    >
      {options.map((opt: string) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

// Export the component wrapped in the ProtectedRoute
export default function ManageTrialsPage() {
  return (
    <ProtectedRoute>
      <ManageTrials />
    </ProtectedRoute>
  );
}
