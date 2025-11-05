"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/authContext";
import {
  FileText,
  Heart,
  Users,
  FlaskConical,
  MessageSquare,
  User,
} from "lucide-react";
import { motion } from "framer-motion";

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
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className={`relative flex flex-col items-center justify-center gap-1 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
          ${
            isActive
              ? "text-indigo-600 bg-indigo-50 shadow-sm"
              : "text-gray-500 hover:text-indigo-600 hover:bg-gray-50"
          }`}
      >
        <div
          className={`${
            isActive
              ? "text-indigo-600"
              : "text-gray-500 group-hover:text-indigo-600"
          }`}
        >
          {icon}
        </div>
        <span>{label}</span>

        {isActive && (
          <motion.div
            layoutId="underline"
            className="absolute bottom-0 h-0.5 w-10 bg-indigo-600 rounded-full"
          />
        )}
      </motion.div>
    </Link>
  );
};

export default function DashboardNav() {
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 flex w-full justify-center border-b border-gray-200 bg-white/70 backdrop-blur-md shadow-sm">
      <div className="flex w-full max-w-5xl justify-around px-2 py-3 sm:px-6">
        {user?.role === "PATIENT" && (
          <>
            <NavLink
              href="/experts"
              icon={<Users className="h-5 w-5" />}
              label="Experts"
            />
            <NavLink
              href="/dashboard"
              icon={<FlaskConical className="h-5 w-5" />}
              label="Trials"
            />
            <NavLink
              href="/publications"
              icon={<FileText className="h-5 w-5" />}
              label="Papers"
            />
            <NavLink
              href="/favorites"
              icon={<Heart className="h-5 w-5" />}
              label="Favorites"
            />
            <NavLink
              href="/forums"
              icon={<MessageSquare className="h-5 w-5" />}
              label="Forum"
            />
            <NavLink
              href="/profile"
              icon={<User className="h-5 w-5" />}
              label="Profile"
            />
          </>
        )}

        {user?.role === "RESEARCHER" && (
          <>
            <NavLink
              href="/collaborators"
              icon={<Users className="h-5 w-5" />}
              label="Collaborators"
            />
            <NavLink
              href="/manage-trials"
              icon={<FlaskConical className="h-5 w-5" />}
              label="My Trials"
            />
            <NavLink
              href="/publications"
              icon={<FileText className="h-5 w-5" />}
              label="Papers"
            />
            <NavLink
              href="/favorites"
              icon={<Heart className="h-5 w-5" />}
              label="Favorites"
            />
            <NavLink
              href="/forums"
              icon={<MessageSquare className="h-5 w-5" />}
              label="Forum"
            />
            <NavLink
              href="/profile"
              icon={<User className="h-5 w-5" />}
              label="Profile"
            />
          </>
        )}
      </div>
    </nav>
  );
}
