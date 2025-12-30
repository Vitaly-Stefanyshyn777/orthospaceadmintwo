"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { BACKEND_URL } from "@/lib/config";

interface HeroData {
  id?: number;
  title: string;
  subtitle: string;
  backgroundImage?: string;
  backgroundImagePublicId?: string;
}

interface UploadState {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  uploaded: boolean;
}

export default function AdminHeroPage() {
  const { user } = useAuth();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const [hero, setHero] = useState<HeroData>({
    title: "",
    subtitle: "",
    backgroundImage: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroExists, setHeroExists] = useState(false);

  const [photo, setPhoto] = useState<UploadState>({
    file: null,
    preview: null,
    uploading: false,
    uploaded: false,
  });

  // Завантаження даних Hero секції
  const loadHero = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${BACKEND_URL}/api/v1/hero`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (res.ok) {
        const responseText = await res.text();
        if (responseText.trim() === "") {
          setHero({
            title: "",
            subtitle: "",
            backgroundImage: "",
          });
          setHeroExists(false);
        } else {
          const data = JSON.parse(responseText);
          setHero({
            title: data.title || "",
            subtitle: data.subtitle || "",
            backgroundImage: data.backgroundImage || "",
          });
          setHeroExists(true);
        }
      } else if (res.status === 404) {
        setHero({
          title: "",
          subtitle: "",
          backgroundImage: "",
        });
        setHeroExists(false);
      } else {
        throw new Error("Не вдалося отримати Hero");
      }
    } catch (e) {
      console.error(e);
      showError("Помилка завантаження Hero");
      setHeroExists(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadHero();
    }
  }, [user]);

  // Збереження даних Hero секції
  const saveHeroData = async (imageUrl?: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const method = heroExists ? "PUT" : "POST";

      const body: any = {
        title: hero.title,
        subtitle: hero.subtitle,
      };

      if (imageUrl) {
        body.backgroundImage = imageUrl;
      }

      const res = await fetch(`${BACKEND_URL}/api/v1/hero`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Помилка збереження даних");

      await loadHero();
      showSuccess(
        heroExists ? "Hero оновлено успішно" : "Hero створено успішно"
      );
    } catch (e: any) {
      showError(e.message || "Помилка збереження");
    }
  };

  // Видалення фото
  const deletePhoto = async () => {
    if (!confirm("Ви впевнені, що хочете видалити це фото?")) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      const res = await fetch(`${BACKEND_URL}/api/v1/hero`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Не вдалося видалити фото");

      setHero({ title: "", subtitle: "", backgroundImage: "" });
      setHeroExists(false);
      showSuccess("Фото видалено успішно!");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Помилка видалення");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);

    setPhoto({ file, preview, uploading: false, uploaded: false });
  };

  const handleUpload = async () => {
    if (!photo.file) {
      showError("Спочатку виберіть файл!");
      return;
    }

    setPhoto((prev) => ({ ...prev, uploading: true }));

    const result = await uploadPhoto(photo.file);

    if (result) {
      setPhoto({
        file: null,
        preview: null,
        uploading: false,
        uploaded: true,
      });
      showSuccess("Фото успішно завантажено!");
    } else {
      setPhoto((prev) => ({ ...prev, uploading: false }));
      showError("Помилка завантаження фото!");
    }
  };

  const uploadPhoto = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/v1/hero/upload-background`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();
        await loadHero(); // Оновлюємо дані після завантаження
        return result;
      } else {
        console.error("Помилка завантаження:", response.statusText);
        return null;
      }
    } catch (error) {
      console.error("Помилка:", error);
      return null;
    }
  };

  // Збереження текстових даних
  const saveTextData = async () => {
    setSaving(true);
    await saveHeroData();
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12 text-gray-600">Завантаження...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Hero секція</h1>

        {/* Текстові поля */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Налаштування тексту
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Заголовок
              </label>
              <input
                type="text"
                value={hero.title}
                onChange={(e) =>
                  setHero((h) => ({ ...h, title: e.target.value }))
                }
                className="w-full border rounded-md px-3 py-2 text-black"
                placeholder="Введіть заголовок Hero секції"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Підзаголовок
              </label>
              <textarea
                value={hero.subtitle}
                onChange={(e) =>
                  setHero((h) => ({ ...h, subtitle: e.target.value }))
                }
                className="w-full border rounded-md px-3 py-2 text-black h-24"
                placeholder="Введіть підзаголовок Hero секції"
              />
            </div>

            <button
              onClick={saveTextData}
              disabled={saving}
              className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Збереження..." : "Зберегти текст"}
            </button>
          </div>
        </div>

        {/* Завантаження фото */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Завантаження фото
            {photo.uploading && (
              <span className="ml-2 text-blue-600">(Завантаження...)</span>
            )}
          </h2>

          <div className="mb-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              disabled={photo.uploading || heroExists}
            />
          </div>

          {photo.preview && (
            <div className="mb-4">
              <Image
                src={photo.preview}
                alt="Preview"
                width={400}
                height={192}
                className="w-full h-48 object-contain rounded-lg"
              />
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!photo.file || photo.uploading || heroExists}
            className={`w-full py-2 px-4 rounded-md font-medium ${
              photo.file && !photo.uploading && !heroExists
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {photo.uploading
              ? "Завантаження..."
              : heroExists
              ? "Фото вже завантажено"
              : "Завантажити"}
          </button>
        </div>

        {/* Відображення завантажених фото */}
        {heroExists && hero.backgroundImage && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Завантажені фото
            </h2>

            <div>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="flex justify-center items-center">
                  <Image
                    src={hero.backgroundImage}
                    alt="Hero background"
                    width={500}
                    height={500}
                    className="w-full h-64 md:h-[500px] object-contain"
                  />
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      hero
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date().toLocaleDateString("uk-UA")}
                    </span>
                  </div>

                  <h3 className="font-medium text-gray-900 mb-1">
                    Фонове зображення Hero
                  </h3>

                  <div className="text-xs text-gray-500 mb-3">
                    <p>Файл: hero-background.jpg</p>
                    <p>Розмір: 0.00 MB</p>
                  </div>

                  <button
                    onClick={deletePhoto}
                    className="w-full bg-red-600 text-white text-sm py-1 px-3 rounded hover:bg-red-700"
                  >
                    Видалити
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-medium text-green-900 mb-2">
            Інструкції:
          </h3>
          <ul className="text-green-800 space-y-1">
            <li>
              • Введіть текст заголовка та підзаголовка, потім натисніть
              &quot;Зберегти текст&quot;
            </li>
            <li>• Виберіть файл для завантаження фонового зображення</li>
            <li>• Натисніть &quot;Завантажити&quot; для завантаження фото</li>
            <li>• Кожна Hero секція може мати тільки одне фонове зображення</li>
            <li>
              • Після завантаження фото можна його видалити та завантажити нове
            </li>
            <li>• Видалення фото також видалить всі текстові дані секції</li>
          </ul>
        </div>
      </div>

      {/* Стилізовані повідомлення */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}
