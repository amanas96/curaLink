"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/authContext";
import {
  Home,
  FileText,
  Heart,
  Users,
  FlaskConical,
  LogOut,
} from "lucide-react";

// Helper for styling the links
const NavLink = ({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
        isActive
          ? "bg-indigo-600 text-white"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
};

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full max-h-screen flex-col border-r bg-white shadow-sm w-64">
      {/* Sidebar Header */}
      <div className="flex items-center border-b p-4 h-16">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <span className="text-xl font-bold text-indigo-700">CuraLink</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-4 text-sm font-medium gap-1">
          {/* Patient Links */}
          {user?.role === "PATIENT" && (
            <>
              <NavLink
                href="/dashboard"
                icon={<Home className="h-4 w-4" />}
                label="Dashboard"
              />
              <NavLink
                href="/favorites"
                icon={<Heart className="h-4 w-4" />}
                label="My Favorites"
              />
              <NavLink
                href="/publications"
                icon={<FileText className="h-4 w-4" />}
                label="Publications"
              />
              <NavLink
                href="/experts"
                icon={<Users className="h-4 w-4" />}
                label="Find Experts"
              />
            </>
          )}

          {/* Researcher Links */}
          {user?.role === "RESEARCHER" && (
            <>
              <NavLink
                href="/researcher-dashboard"
                icon={<Home className="h-4 w-4" />}
                label="Dashboard"
              />
              <NavLink
                href="/collaborators"
                icon={<Users className="h-4 w-4" />}
                label="Collaborators"
              />
              <NavLink
                href="/manage-trials"
                icon={<FlaskConical className="h-4 w-4" />}
                label="Manage Trials"
              />
              <NavLink
                href="/publications"
                icon={<FileText className="h-4 w-4" />}
                label="Publications"
              />
            </>
          )}
        </nav>
      </div>

      {/* Sidebar Footer (Profile & Logout) */}
      <div className="mt-auto border-t p-4">
        <div className="mb-2">
          <div
            className="font-medium text-sm text-gray-900 truncate"
            title={user?.email}
          >
            {user?.email}
          </div>
          <div className="text-xs text-gray-500">
            {user?.role === "PATIENT"
              ? "Patient Account"
              : "Researcher Account"}
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </div>
  );
}
