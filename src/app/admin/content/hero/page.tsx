"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useConfirm } from "@/hooks/useConfirm";
import { BACKEND_URL } from "@/lib/config";

type Hero = {
  title: string;
  subtitle: string;
  backgroundImage?: string;
};

export default function AdminHeroPage() {
  const { user } = useAuth();
  const { toast, showSuccess, showError, hideToast } = useToast();
  const { confirm, showConfirm, hideConfirm, handleConfirm } = useConfirm();
  const [hero, setHero] = useState<Hero>({
    title: "",
    subtitle: "",
    backgroundImage: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Load current hero (admin or public doesn't matter for display)
  const loadHero = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${BACKEND_URL}/api/v1/public/hero`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );
      if (!res.ok) throw new Error("Не вдалося отримати Hero");
      // Публічний ендпоїнт інколи повертає 200 без тіла
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      setHero({
        title: data.title || "",
        subtitle: data.subtitle || "",
        backgroundImage: data.backgroundImage || "",
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadHero();
  }, [user]);

  const saveHero = async (method: "POST" | "PUT") => {
    try {
      setSaving(true);
      const body: Hero = {
        title: hero.title,
        subtitle: hero.subtitle,
        backgroundImage: hero.backgroundImage || undefined,
      };
      const res = await fetch(
        `${BACKEND_URL}/api/v1/hero`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(body),
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Не вдалося зберегти Hero");
      await loadHero();
      showSuccess("Hero збережено");
    } catch (e: unknown) {
      showError((e as Error).message || "Помилка збереження");
    } finally {
      setSaving(false);
    }
  };

  const deleteHero = async () => {
    showConfirm(
      "Видалення Hero",
      "Ви впевнені, що хочете видалити Hero? Цю дію неможливо скасувати!",
      async () => {
        await performHeroDeletion();
      },
      {
        confirmText: "Видалити",
        cancelText: "Скасувати",
        type: "danger",
      }
    );
  };

  const performHeroDeletion = async () => {
    try {
      setSaving(true);
      const res = await fetch(
        `${BACKEND_URL}/api/v1/hero`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Не вдалося видалити Hero");
      setHero({ title: "", subtitle: "", backgroundImage: "" });
      showSuccess("Hero видалено");
    } catch (e: unknown) {
      showError((e as Error).message || "Помилка видалення");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Hero</h1>

        {loading ? (
          <div className="text-center py-12 text-gray-600">Завантаження...</div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Заголовок
              </label>
              <input
                type="text"
                value={hero.title}
                onChange={(e) =>
                  setHero((h) => ({ ...h, title: e.target.value }))
                }
                className="w-full border rounded-md px-3 py-2 text-black placeholder:text-black"
                placeholder="Введіть заголовок"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Підзаголовок
              </label>
              <input
                type="text"
                value={hero.subtitle}
                onChange={(e) =>
                  setHero((h) => ({ ...h, subtitle: e.target.value }))
                }
                className="w-full border rounded-md px-3 py-2 text-black placeholder:text-black"
                placeholder="Введіть підзаголовок"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
              <button
                onClick={() => saveHero("POST")}
                disabled={saving}
                className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Створити/Перезаписати
              </button>

              <button
                onClick={deleteHero}
                disabled={saving}
                className="w-full sm:w-auto sm:ml-auto bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Видалити
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Стилізовані повідомлення */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Стилізовані підтвердження */}
      <ConfirmDialog
        isOpen={confirm.isOpen}
        title={confirm.title}
        message={confirm.message}
        confirmText={confirm.confirmText}
        cancelText={confirm.cancelText}
        type={confirm.type}
        onConfirm={handleConfirm}
        onCancel={hideConfirm}
      />
    </div>
  );
}
