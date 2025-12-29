"use client";

import Link from "next/link";

export default function AdminContentPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Керування контентом
        </h1>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Секції</h2>
          <ul className="space-y-3">
            <li>
              <Link
                href="/admin/content/hero"
                className="inline-flex items-center justify-between w-full border rounded-md px-4 py-3 hover:bg-gray-50"
              >
                <span className="font-medium text-gray-800">Hero</span>
                <span className="text-sm text-gray-500">
                  заголовок, підзаголовок, фон
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
