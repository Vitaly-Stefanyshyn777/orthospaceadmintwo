"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

interface Photo {
  id: number;
  albumId: number;
  url: string;
  title: string;
  description: string;
  tag: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
}

export default function DataManagementPage() {
  const { user, isLoading } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    tag: "",
  });

  // Завантаження всіх фото
  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const response = await fetch("/api/v1/photos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Помилка завантаження даних");
      }

      const data = await response.json();
      setPhotos(data.photos || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Невідома помилка");
    } finally {
      setLoading(false);
    }
  };

  // Видалення фото
  const deletePhoto = async (photoId: number) => {
    if (!confirm("Ви впевнені, що хочете видалити це фото?")) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(`/api/v1/photos?id=${photoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Помилка видалення фото");
      }

      // Оновлюємо список після видалення
      await fetchPhotos();
      alert("Фото успішно видалено!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Помилка видалення");
    }
  };

  // Початок редагування
  const startEdit = (photo: Photo) => {
    setEditingPhoto(photo);
    setEditForm({
      title: photo.title,
      description: photo.description,
      tag: photo.tag,
    });
  };

  // Збереження змін
  const saveEdit = async () => {
    if (!editingPhoto) return;

    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch("/api/v1/photos", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingPhoto.id,
          title: editForm.title,
          description: editForm.description,
          tag: editForm.tag,
        }),
      });

      if (!response.ok) {
        throw new Error("Помилка збереження змін");
      }

      // Оновлюємо список після збереження
      await fetchPhotos();
      setEditingPhoto(null);
      alert("Зміни успішно збережено!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Помилка збереження");
    }
  };

  // Скасування редагування
  const cancelEdit = () => {
    setEditingPhoto(null);
    setEditForm({ title: "", description: "", tag: "" });
  };

  useEffect(() => {
    if (user) {
      fetchPhotos();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Доступ заборонено
          </h1>
          <p className="text-gray-600">Будь ласка, увійдіть в систему</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Управління даними
          </h1>
          <p className="mt-2 text-gray-600">
            Переглядайте, редагуйте та видаляйте завантажені фото
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всього фото</p>
                <p className="text-2xl font-bold text-gray-900">
                  {photos.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Before/After
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    photos.filter(
                      (p) => p.tag === "before" || p.tag === "after"
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Звичайні</p>
                <p className="text-2xl font-bold text-gray-900">
                  {photos.filter((p) => p.tag === "general").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Кнопки управління */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={fetchPhotos}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Оновити
          </button>
        </div>

        {/* Список фото */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Завантаження фото...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchPhotos}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Спробувати знову
            </button>
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Немає завантажених фото
            </h3>
            <p className="text-gray-600">
              Завантажте перше фото, щоб побачити його тут
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                {/* Прев'ю фото */}
                <div className="aspect-w-16 aspect-h-9">
                  <Image
                    src={photo.url}
                    alt={photo.title}
                    width={400}
                    height={192}
                    className="w-full h-48 object-contain"
                  />
                </div>

                {/* Інформація про фото */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        photo.tag === "before"
                          ? "bg-blue-100 text-blue-800"
                          : photo.tag === "after"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {photo.tag}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(photo.createdAt).toLocaleDateString("uk-UA")}
                    </span>
                  </div>

                  <h3 className="font-medium text-gray-900 mb-1">
                    {photo.title || photo.fileName}
                  </h3>

                  {photo.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {photo.description}
                    </p>
                  )}

                  <div className="text-xs text-gray-500 mb-3">
                    <p>Файл: {photo.fileName}</p>
                    <p>
                      Розмір: {(photo.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p>Альбом: {photo.albumId}</p>
                  </div>

                  {/* Кнопки управління */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(photo)}
                      className="flex-1 bg-blue-600 text-white text-sm py-1 px-3 rounded hover:bg-blue-700"
                    >
                      Редагувати
                    </button>
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="flex-1 bg-red-600 text-white text-sm py-1 px-3 rounded hover:bg-red-700"
                    >
                      Видалити
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Модальне вікно для редагування */}
        {editingPhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Редагування фото
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Назва
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Опис
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Тег
                  </label>
                  <select
                    value={editForm.tag}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, tag: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="before">Before</option>
                    <option value="after">After</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Скасувати
                </button>
                <button
                  onClick={saveEdit}
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Зберегти
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
