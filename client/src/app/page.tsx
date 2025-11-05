"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "../../context/authContext";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";

import {
  Heart,
  Users,
  FlaskConical,
  MessageSquareText,
  Search,
} from "lucide-react";

// --- (Chat components remain the same) ---
type Message = {
  sender: "user" | "ai";
  text: string;
};

const ChatBubble = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-transform hover:scale-110 z-50"
    aria-label="Open chat"
  >
    <MessageSquareText className="w-6 h-6" />
  </button>
);

const ChatWindow = ({ onClose }: { onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Hi! How can I help you learn about CuraLink or clinical trials today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    const historyForApi = [...messages];
    const currentInput = input;

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.post("/ai/chat", {
        message: currentInput,
        history: historyForApi,
      });

      const aiMessage: Message = { sender: "ai", text: response.data.reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat API error:", error);
      const errorMessage: Message = {
        sender: "ai",
        text: "Sorry, I am having trouble connecting. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-6 w-full max-w-md h-[70vh] bg-white rounded-lg shadow-xl flex flex-col border border-gray-300 z-40">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h3 className="font-semibold text-lg text-indigo-900">
          CuraLink AI Assistant
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-3 rounded-lg max-w-xs ${msg.sender === "user" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-900"}`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-lg bg-gray-200 text-gray-900">
              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 px-3 py-2 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none disabled:bg-gray-400"
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

// --- New Header for the Landing Page ---
const LandingHeader = () => (
  <header className="absolute top-0 left-0 right-0 z-10 bg-white shadow-sm">
    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center">
          <span className="text-2xl font-bold text-indigo-700">CuraLink</span>
        </div>
        {/* Nav Links */}
        <div className="flex items-center space-x-4">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  </header>
);

// --- New Feature Card Component ---
const FeatureCard = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
    <div className="flex items-center justify-center w-12 h-12 mb-4 bg-indigo-100 text-indigo-600 rounded-full">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{children}</p>
  </div>
);

// --- New Footer Component ---
const LandingFooter = () => (
  <footer className="w-full bg-white border-t border-gray-200 mt-24">
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
      <p>&copy; {new Date().getFullYear()} CuraLink. All rights reserved.</p>
      <div className="flex justify-center space-x-6 mt-4">
        <Link href="#" className="text-sm hover:text-gray-700">
          Privacy Policy
        </Link>
        <Link href="#" className="text-sm hover:text-gray-700">
          Terms of Service
        </Link>
        <Link href="#" className="text-sm hover:text-gray-700">
          Contact
        </Link>
      </div>
    </div>
  </footer>
);

// --- HomePage Component (Redesigned) ---

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    // Redirect logic remains the same
    if (!loading && user) {
      if (user.role === "RESEARCHER") {
        router.push("/researcher-dashboard");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading || (!loading && user)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        Loading...
      </div>
    );
  }

  // --- New Professional Page Layout ---
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <LandingHeader />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="flex items-center justify-center pt-32 pb-24 bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
          <div className="text-center px-6">
            <h1 className="text-5xl md:text-6xl font-bold text-indigo-900">
              Find Your Path to Treatment.
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              CuraLink uses AI to instantly match you with relevant clinical
              trials, publications, and leading health experts.
            </p>

            <div className="mt-12 flex flex-col md:flex-row gap-6 justify-center">
              <Link
                href="/register"
                className="px-8 py-4 text-lg font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 transform transition-transform hover:scale-105"
              >
                I'm a Patient
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 text-lg font-medium text-indigo-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transform transition-transform hover:scale-105"
              >
                I'm a Researcher
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">
                A New Way to Discover
              </h2>
              <p className="mt-3 text-lg text-gray-600">
                All the information you need, simplified and in one place.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<FlaskConical className="w-6 h-6" />}
                title="AI-Powered Trials"
              >
                No more confusing medical jargon. We read trial descriptions and
                give you a simple, understandable summary.
              </FeatureCard>
              <FeatureCard
                icon={<Users className="w-6 h-6" />}
                title="Find Experts"
              >
                Instantly connect with researchers and doctors who specialize in
                your specific condition.
              </FeatureCard>
              <FeatureCard
                icon={<Search className="w-6 h-6" />}
                title="Discover Research"
              >
                Search millions of publications and get AI-powered insights to
                understand the latest breakthroughs.
              </FeatureCard>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />

      {/* --- Chat Components --- */}
      {!isChatOpen && <ChatBubble onClick={() => setIsChatOpen(true)} />}
      {isChatOpen && <ChatWindow onClose={() => setIsChatOpen(false)} />}
    </div>
  );
}
