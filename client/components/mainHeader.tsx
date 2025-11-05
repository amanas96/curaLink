"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/authContext";
import {
  FileText,
  Heart,
  Users,
  FlaskConical,
  MessageSquare,
  User,
  LogOut,
  Bell,
} from "lucide-react";
import { motion } from "framer-motion";

// Helper component for the navigation links
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
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
        ${
          isActive
            ? "bg-indigo-100 text-indigo-700"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
    >
      {icon}
      {label}
    </Link>
  );
};

// Main Navbar Component
export default function Navbar() {
  const { user, logout } = useAuth(); // Use our auth hook
  const router = useRouter();

  const handleSignOut = () => {
    logout(); // Use the logout function from our context
    router.push("/login"); // Redirect to login
  };

  const userInitials = user?.email.substring(0, 2).toUpperCase() || "...";

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full flex items-center justify-between px-6 py-3 bg-white shadow-md border-b border-gray-200 sticky top-0 z-30"
    >
      {/* Center: Navigation (Uses NavLink component) */}
      <div className="hidden md:flex items-center justify-evenly gap-4 w-full">
        {user?.role === "PATIENT" && (
          <>
            <NavLink
              href="/dashboard"
              icon={<FlaskConical className="h-4 w-4" />}
              label="Trials"
            />
            <NavLink
              href="/experts"
              icon={<Users className="h-4 w-4" />}
              label="Experts"
            />
            <NavLink
              href="/publications"
              icon={<FileText className="h-4 w-4" />}
              label="Publications"
            />
            <NavLink
              href="/favorites"
              icon={<Heart className="h-4 w-4" />}
              label="Favorites"
            />
            <NavLink
              href="/profile"
              icon={<User className="h-4 w-4" />}
              label="Profile"
            />
          </>
        )}
        {user?.role === "RESEARCHER" && (
          <>
            <NavLink
              href="/researcher-dashboard"
              icon={<FlaskConical className="h-4 w-4" />}
              label="My Trials"
            />
            <NavLink
              href="/collaborators"
              icon={<Users className="h-4 w-4" />}
              label="Collaborators"
            />
            <NavLink
              href="/publications"
              icon={<FileText className="h-4 w-4" />}
              label="Publications"
            />
            <NavLink
              href="/favorites"
              icon={<Heart className="h-4 w-4" />}
              label="Favorites"
            />
            <NavLink
              href="/profile"
              icon={<User className="h-4 w-4" />}
              label="Profile"
            />
          </>
        )}
      </div>

      {/* Right: Sign Out + Profile */}
    </motion.nav>
  );
}
