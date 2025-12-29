"use client";

import { useState } from "react";
import { BACKEND_URL } from "@/lib/config";

export default function ResetPasswordPage() {
  const [step, setStep] = useState<"request" | "code">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/v1/auth/request-password-reset`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      if (!res.ok) throw new Error("Не вдалося надіслати лист на зміну паролю");
      setMessage("Код надіслано на вашу пошту. Введіть його нижче.");
      setStep("code");
    } catch (e: unknown) {
      setError((e as Error).message || "Помилка запиту");
    } finally {
      setLoading(false);
    }
  };

  const setNewPass = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/v1/auth/reset-password-code`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code, newPassword }),
        }
      );
      if (!res.ok) throw new Error("Не вдалося встановити новий пароль");
      setMessage("Пароль змінено успішно. Тепер можна увійти.");
    } catch (e: unknown) {
      setError((e as Error).message || "Помилка запиту");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 text-center">
          Відновлення паролю
        </h1>

        {step === "request" ? (
          <form
            onSubmit={requestReset}
            className="bg-white p-6 rounded-lg shadow space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                placeholder="user@example.com"
              />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {message && <div className="text-green-700 text-sm">{message}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {loading ? "Надсилаємо..." : "Надіслати код"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={setNewPass}
            className="bg-white p-6 rounded-lg shadow space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Код підтвердження
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                placeholder="123456"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Новий пароль
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                placeholder="••••••••"
              />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {message && <div className="text-green-700 text-sm">{message}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {loading ? "Зберігаємо..." : "Змінити пароль"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
