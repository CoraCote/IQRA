'use client'

import Link from "next/link";
import {
  Phone,
  MessageCircle,
  BarChart3,
  Settings,
  Zap,
  Clock,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white mb-8 leading-tight">
            IQRA
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Restaurant
            </span>
          </h1>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">

            <Button asChild variant="primary" size="lg" className="group">
              <Link href="/chat">
                Try Live Chat
                <MessageCircle className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform duration-300" />
              </Link>
            </Button>

            <Button asChild size="lg" className="group bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700">
              <Link href="/chat?mode=voice">
                Call AI Assistant
                <Phone className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform duration-300" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <Link href="/dashboard" className="group">
            <Card hover className="h-full p-8 hover:border-blue-300 dark:hover:border-blue-600 group-hover:border-blue-300 dark:group-hover:border-blue-600">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                Analytics Hub
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                Real-time insights, performance metrics, and detailed
                conversation analytics with beautiful visualizations.
              </p>
              <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
                Explore Dashboard
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Card>
          </Link>

          <Link href="/conversations" className="group">
            <Card hover className="h-full p-8 hover:border-green-300 dark:hover:border-green-600 group-hover:border-green-300 dark:group-hover:border-green-600">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                Call Intelligence
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                Advanced voice recognition with perfect transcription and
                smart conversation flow management.
              </p>
              <div className="flex items-center text-green-600 dark:text-green-400 font-semibold group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">
                View Call Logs
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Card>
          </Link>

          <Link href="/chat" className="group">
            <Card hover className="h-full p-8 hover:border-purple-300 dark:hover:border-purple-600 group-hover:border-purple-300 dark:group-hover:border-purple-600">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                Smart Chat
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                Instant messaging with context-aware responses and seamless
                conversation handoff capabilities.
              </p>
              <div className="flex items-center text-purple-600 dark:text-purple-400 font-semibold group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                Start Chatting
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Card>
          </Link>

          <div className="group">
            <Card className="h-full p-8 opacity-60">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Advanced Settings
              </h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                Comprehensive configuration options for menu management and AI
                behavior customization.
              </p>
              <div className="flex items-center text-gray-400 dark:text-gray-500 font-semibold">
                Coming Soon
                <Clock className="w-4 h-4 ml-2" />
              </div>
            </Card>
          </div>
        </div>


        {/* System Status */}
        <Card className="p-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                System Status
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                All systems operational and ready for customer interactions
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center group">
                <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2 group-hover:scale-110 transition-transform duration-300"></div>
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">AI Online</span>
              </div>
              <div className="text-center group">
                <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto mb-2 group-hover:scale-110 transition-transform duration-300"></div>
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Voice Ready</span>
              </div>
              <div className="text-center group">
                <div className="w-4 h-4 bg-purple-500 rounded-full mx-auto mb-2 group-hover:scale-110 transition-transform duration-300"></div>
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Chat Active</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}