'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navbar */}
      <nav className="border-b border-gray-100 dark:border-gray-800 p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-blue-600">CRM Pro</div>
        {/* <div className="space-x-6">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600">Sign In</Link>
          <Link href="/signup" className="text-sm font-medium bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700">Get Started</Link>
        </div> */}
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6">
          Close More Deals with <span className="text-blue-600">Intelligence.</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
          The all-in-one CRM for high-performance sales teams. Manage leads, track your pipeline, and automate follow-ups with AI-powered insights.
        </p>
        {/* <div className="flex justify-center space-x-4">
          <Link href="/signup" className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/20"> Start Free Trial</Link>
          <button className="bg-gray-100 text-gray-900 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-200">View Demo</button>
        </div> */}
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-3xl">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 text-xl">🚀</div>
            <h3 className="text-xl font-bold mb-4">Pipeline Management</h3>
            <p className="text-gray-600 dark:text-gray-400">Our Kanban-style board helps you visualize your sales funnel and move deals forward effortlessly.</p>
          </div>
          <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-3xl">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6 text-xl">🤖</div>
            <h3 className="text-xl font-bold mb-4">AI Lead Scoring</h3>
            <p className="text-gray-600 dark:text-gray-400">Identify your hottest leads instantly with our proprietary scoring algorithm based on engagement and data quality.</p>
          </div>
          <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-3xl">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6 text-xl">📅</div>
            <h3 className="text-xl font-bold mb-4">Smart Follow-ups</h3>
            <p className="text-gray-600 dark:text-gray-400">Never miss a call again. Get automated reminders for upcoming tasks and prioritize your day.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
