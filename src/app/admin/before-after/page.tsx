"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useConfirm } from "@/hooks/useConfirm";

interface UploadState {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  uploaded: boolean;
  uploadedPhoto?: Photo;
}

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

interface Collection {
  id: number;
  key: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Pair {
  id: number;
  key: string;
  beforePhoto: Photo;
  afterPhoto: Photo;
  collectionId: number;
  createdAt: string;
  updatedAt: string;
}

export default function BeforeAfterPage() {
  const { user } = useAuth();
  const { toast, showSuccess, showError, hideToast } = useToast();
  const { confirm, showConfirm, hideConfirm, handleConfirm } = useConfirm();
  const [beforePhotos, setBeforePhotos] = useState<UploadState[]>([
    { file: null, preview: null, uploading: false, uploaded: false },
    { file: null, preview: null, uploading: false, uploaded: false },
    { file: null, preview: null, uploading: false, uploaded: false },
  ]);

  const [afterPhotos, setAfterPhotos] = useState<UploadState[]>([
    { file: null, preview: null, uploading: false, uploaded: false },
    { file: null, preview: null, uploading: false, uploaded: false },
    { file: null, preview: null, uploading: false, uploaded: false },
  ]);

  const [albumId] = useState("3"); // ID альбому "До і Після"
  const [uploadedPhotos, setUploadedPhotos] = useState<Photo[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const hasFetchedOnceRef = useRef(false);
  const [isUploadingAll, setIsUploadingAll] = useState(false);
  const [deletingCollectionKey, setDeletingCollectionKey] = useState<
    string | null
  >(null);

  // Завантаження всіх фото
  const fetchPhotos = async () => {
    try {
      setLoadingPhotos(true);
      const token = localStorage.getItem("authToken");
      console.log(
        "🔑 Токен з localStorage:",
        token ? "Є токен" : "Немає токену"
      );

      // Використовуємо локальний API роут для отримання фото альбому "До і Після"
      const timestamp = Date.now();
      const url = `/api/v1/public/gallery/albums/before-after?t=${timestamp}`;
      console.log("🔍 Запитуємо дані з URL:", url);

      const response = await fetch(url, {
        // Забороняємо кеш, щоб одразу бачити актуальні зміни після видалення/заміни
        cache: "no-store",
        // Публічний ендпоїнт не потребує авторизації
      });

      if (!response.ok) {
        throw new Error("Помилка завантаження даних");
      }

      const data = await response.json();
      console.log("🔍 Дані з API після запиту:", {
        photos: data.photos?.length || 0,
        collections: data.collections?.length || 0,
        pairs: data.pairs?.length || 0,
        rawData: data,
      });

      // Обробляємо дані зі старого сервера
      // Фільтруємо фото, щоб показувати тільки ті, що входять до пар
      const allPhotos: Photo[] = [];
      const photosInPairs = new Set<number>();

      // Спочатку зберігаємо пари
      if (data.pairs && Array.isArray(data.pairs)) {
        data.pairs.forEach((pair: Pair) => {
          if (pair.beforePhoto?.id) {
            photosInPairs.add(pair.beforePhoto.id);
          }
          if (pair.afterPhoto?.id) {
            photosInPairs.add(pair.afterPhoto.id);
          }
        });
      }

      // Додаємо тільки фото, які входять до пар
      if (data.photos && data.photos.length > 0) {
        data.photos.forEach((photo: Photo) => {
          // Показуємо тільки фото, які входять до пар
          if (photosInPairs.has(photo.id)) {
            allPhotos.push({
              id: photo.id,
              albumId: photo.albumId,
              url: photo.url,
              title: photo.title,
              description: photo.description,
              tag: photo.tag || "before", // Якщо tag null, встановлюємо "before"
              fileName: photo.title,
              fileSize: 0,
              mimeType: "image/jpeg",
              createdAt: photo.createdAt,
              updatedAt: photo.updatedAt,
            });
          }
        });
      }

      console.log(
        "📸 Встановлюємо завантажені фото (тільки з пар):",
        allPhotos.length,
        "фото",
        "з",
        photosInPairs.size,
        "у парах"
      );
      setUploadedPhotos(allPhotos);

      // Зберігаємо колекції
      console.log("🔍 Перевіряємо колекції з API:", {
        hasCollections: !!data.collections,
        collectionsLength: data.collections?.length || 0,
        collectionsType: typeof data.collections,
        rawCollections: data.collections,
      });

      if (data.collections && data.collections.length > 0) {
        // Конвертуємо колекції з API формату в формат фронтенду
        const formattedCollections = data.collections.map(
          (collection: { key: number }) => ({
            id: collection.key, // Використовуємо key як id
            key: collection.key,
            name: `Колекція ${collection.key}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        );
        setCollections(formattedCollections);
        console.log(
          "📁 Колекції:",
          formattedCollections.length,
          formattedCollections
        );
      } else {
        setCollections([]);
        console.log("📁 Колекції: 0");
      }

      // Зберігаємо пари для подальшого рендерингу по колекціях
      if (data.pairs && Array.isArray(data.pairs)) {
        console.log("🔗 Пари з API:", data.pairs.length, data.pairs);
        setPairs(data.pairs);
      } else {
        setPairs([]);
        console.log("🔗 Пари: 0");
      }

      console.log("✅ Стан оновлено!");
    } catch (err) {
      console.error("Помилка завантаження фото:", err);
    } finally {
      setLoadingPhotos(false);
    }
  };

  // Зміна фото
  const changePhoto = (photoId: number) => {
    // Знаходимо фото за ID
    const photo = uploadedPhotos.find((p) => p.id === photoId);
    if (!photo) {
      showError("Фото не знайдено!");
      return;
    }

    // Створюємо input для вибору нового файлу
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Перевіряємо розмір файлу (максимум 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showError("Розмір файлу не повинен перевищувати 10MB!");
        return;
      }

      // Показуємо стилізоване підтвердження
      showConfirm(
        "Заміна фото",
        `Замінити фото "${photo.title}" на нове?`,
        async () => {
          await performPhotoReplacement(photo, file);
        }
      );
    };

    const performPhotoReplacement = async (photo: Photo, file: File) => {
      try {
        console.log("🔄 Замінюємо фото:", photo.title);

        const token = localStorage.getItem("authToken");

        // Знаходимо пару, до якої належить це фото
        const pairsResponse = await fetch(
          `/api/v1/public/gallery/albums/before-after`
        );

        if (!pairsResponse.ok) {
          throw new Error("Помилка отримання даних про пари");
        }

        const pairsData = await pairsResponse.json();
        const pair = pairsData.pairs.find(
          (p: Pair) =>
            p.beforePhoto.id === photoId || p.afterPhoto.id === photoId
        );

        if (!pair) {
          // Якщо пара не знайдена, це означає що фото не входить до колекції
          // Видаляємо це фото зі списку і не створюємо нове
          console.log(
            "⚠️ Пара не знайдена - фото не входить до колекції, видаляємо з відображення"
          );

          // Видаляємо фото через API, якщо воно не використовується
          try {
            const deleteResponse = await fetch(`/api/v1/photos?id=${photoId}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (deleteResponse.ok) {
              console.log(`🗑️ Фото ${photoId} видалено (не в парі)`);
            }
          } catch (deleteError) {
            console.warn("Не вдалося видалити фото:", deleteError);
          }

          // Оновлюємо список (фото зникне, бо не входить до пар)
          await fetchPhotos();
          showSuccess("Фото видалено (не входило до колекції)!");
          return;
        }

        // Визначаємо, яке фото замінюємо (до або після)
        const isBeforePhoto = pair.beforePhoto.id === photoId;
        const endpoint = isBeforePhoto
          ? `/api/v1/upload/pairs/${pair.key}/before`
          : `/api/v1/upload/pairs/${pair.key}/after`;

        // Замінюємо фото в парі
        const formData = new FormData();
        formData.append("file", file);

        const replaceResponse = await fetch(endpoint, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!replaceResponse.ok) {
          throw new Error("Помилка заміни фото в парі");
        }

        // Оновлюємо список
        await fetchPhotos();
        showSuccess("Фото успішно замінено!");
      } catch (err) {
        console.error("Помилка заміни фото:", err);
        showError(err instanceof Error ? err.message : "Помилка заміни фото");
      }
    };

    input.click();
  };

  // Видалення конкретної колекції
  const deleteSpecificCollection = async (collectionKey: string) => {
    showConfirm(
      "Видалення колекції",
      `Ви впевнені, що хочете видалити колекцію ${collectionKey}? Цю дію неможливо скасувати!`,
      async () => {
        setDeletingCollectionKey(collectionKey);
        await performCollectionDeletion(collectionKey);
      },
      {
        confirmText: "Видалити",
        cancelText: "Скасувати",
        type: "danger",
      }
    );
  };

  const performCollectionDeletion = async (collectionKey: string) => {
    try {
      const token = localStorage.getItem("authToken");

      // Optimistic update: одразу видаляємо колекцію з локального стану
      setCollections((prev) =>
        prev.filter((collection) => collection.key !== collectionKey)
      );
      setUploadedPhotos([]);
      setLoadingPhotos(true);
      console.log(
        `🗑️ Optimistic update: видаляємо колекцію ${collectionKey} зі стану`
      );

      const deleteResponse = await fetch(
        `/api/v1/gallery/albums/${albumId}/collections/${collectionKey}?deletePhotos=true`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!deleteResponse.ok) {
        // Якщо помилка, повертаємо колекцію назад
        await fetchPhotos();
        throw new Error(`Помилка видалення колекції ${collectionKey}`);
      }

      const result = await deleteResponse.json();
      console.log(`Колекція ${collectionKey} видалена:`, result);

      // Примусово оновлюємо список для синхронізації з сервером
      console.log("🔄 Оновлюємо дані після видалення колекції...");

      // Очищаємо локальний стан перед оновленням
      setUploadedPhotos([]);
      setCollections([]);

      // Примусово оновлюємо UI
      setLoadingPhotos(true);

      await fetchPhotos();
      console.log("✅ Дані оновлено після видалення колекції");
      showSuccess(`Колекція ${collectionKey} успішно видалена!`);
    } catch (err) {
      console.error("Помилка видалення колекції:", err);
      showError(
        err instanceof Error ? err.message : "Помилка видалення колекції"
      );
    } finally {
      setDeletingCollectionKey(null);
    }
  };

  useEffect(() => {
    // Публічний ендпоїнт не вимагає авторизації — тож тягнемо одразу
    if (hasFetchedOnceRef.current) return; // guard від дублювання в Strict Mode
    hasFetchedOnceRef.current = true;
    setLoadingPhotos(true);
    fetchPhotos();
  }, [albumId]);

  // Логування змін в uploadedPhotos
  useEffect(() => {
    console.log("📊 uploadedPhotos змінився:", uploadedPhotos.length, "фото");
  }, [uploadedPhotos]);

  // Логування змін в collections
  useEffect(() => {
    console.log(
      "📁 collections змінився:",
      collections.length,
      "колекцій",
      collections
    );
  }, [collections]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    type: "before" | "after"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);

    if (type === "before") {
      setBeforePhotos((prev) =>
        prev.map((photo, i) =>
          i === index
            ? { file, preview, uploading: false, uploaded: false }
            : photo
        )
      );
    } else {
      setAfterPhotos((prev) =>
        prev.map((photo, i) =>
          i === index
            ? { file, preview, uploading: false, uploaded: false }
            : photo
        )
      );
    }
  };

  const uploadPhoto = async (file: File, tag: "before" | "after") => {
    try {
      const authToken = localStorage.getItem("authToken");
      console.log("Токен з localStorage:", authToken);

      if (!authToken) {
        showError("Потрібна авторизація!");
        return null;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("albumId", albumId);
      formData.append("tag", tag);

      console.log("Відправляємо запит з токеном:", `Bearer ${authToken}`);

      const response = await fetch("/api/v1/upload/photo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      console.log("Відповідь сервера:", response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log("Фото завантажено:", result);
        return result;
      } else {
        const errorText = await response.text();
        console.error("Помилка завантаження:", response.status, errorText);
        return null;
      }
    } catch (error) {
      console.error("Помилка:", error);
      return null;
    }
  };

  const uploadAllPhotos = async () => {
    setIsUploadingAll(true);
    setLoadingPhotos(true);
    console.log("🚀 Початок завантаження всіх фото...");
    const allBeforeFiles = beforePhotos.filter((photo) => photo.file);
    const allAfterFiles = afterPhotos.filter((photo) => photo.file);

    console.log("📁 Файли для завантаження:", {
      before: allBeforeFiles.length,
      after: allAfterFiles.length,
    });

    if (allBeforeFiles.length === 0 && allAfterFiles.length === 0) {
      showError("Спочатку виберіть файли для завантаження!");
      return;
    }

    // Завантажуємо всі фото "До"
    console.log("📤 Завантажуємо фото 'До'...");
    for (let i = 0; i < allBeforeFiles.length; i++) {
      const photo = allBeforeFiles[i];
      if (photo.file) {
        console.log(
          `📤 Завантажуємо фото "До" ${i + 1}/${allBeforeFiles.length}`
        );
        // блокувати вибір файлів під час завантаження конкретного слота
        setBeforePhotos((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, uploading: true } : p))
        );
        const result = await uploadPhoto(photo.file, "before");
        if (result) {
          setBeforePhotos((prev) =>
            prev.map((p, idx) =>
              idx === i
                ? {
                    file: null,
                    preview: null,
                    uploading: false,
                    uploaded: true,
                    uploadedPhoto: result,
                  }
                : p
            )
          );
        } else {
          setBeforePhotos((prev) =>
            prev.map((p, idx) => (idx === i ? { ...p, uploading: false } : p))
          );
        }
      }
    }

    // Завантажуємо всі фото "Після"
    console.log("📤 Завантажуємо фото 'Після'...");
    for (let i = 0; i < allAfterFiles.length; i++) {
      const photo = allAfterFiles[i];
      if (photo.file) {
        console.log(
          `📤 Завантажуємо фото "Після" ${i + 1}/${allAfterFiles.length}`
        );
        setAfterPhotos((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, uploading: true } : p))
        );
        const result = await uploadPhoto(photo.file, "after");
        if (result) {
          setAfterPhotos((prev) =>
            prev.map((p, idx) =>
              idx === i
                ? {
                    file: null,
                    preview: null,
                    uploading: false,
                    uploaded: true,
                    uploadedPhoto: result,
                  }
                : p
            )
          );
        } else {
          setAfterPhotos((prev) =>
            prev.map((p, idx) => (idx === i ? { ...p, uploading: false } : p))
          );
        }
      }
    }

    // Оновлюємо список фото після завантаження всіх фото
    console.log("🔄 Оновлюємо список після завантаження всіх фото...");
    setLoadingPhotos(true);
    await fetchPhotos();
    console.log("✅ Список фото оновлено після завантаження всіх фото!");
    // Готуємо слоти для наступної колекції: очищаємо локальні стани слотів
    setBeforePhotos([
      { file: null, preview: null, uploading: false, uploaded: false },
      { file: null, preview: null, uploading: false, uploaded: false },
      { file: null, preview: null, uploading: false, uploaded: false },
    ]);
    setAfterPhotos([
      { file: null, preview: null, uploading: false, uploaded: false },
      { file: null, preview: null, uploading: false, uploaded: false },
      { file: null, preview: null, uploading: false, uploaded: false },
    ]);
    showSuccess("Всі фото успішно завантажені!");
    setIsUploadingAll(false);
  };

  const renderPhotoSlot = (
    photo: UploadState,
    index: number,
    type: "before" | "after"
  ) => (
    <div key={index} className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-4 text-black">
        {type === "before" ? "До" : "Після"} {index + 1}
        {photo.uploading && (
          <span className="ml-2 text-blue-600">(Завантаження...)</span>
        )}
        {/* Прибрано індикатор "Завантажено" на вимогу */}
      </h3>

      {photo.uploaded && photo.uploadedPhoto ? (
        <div className="mb-4">
          <button
            onClick={() => {
              if (type === "before") {
                setBeforePhotos((prev) =>
                  prev.map((p, i) =>
                    i === index
                      ? {
                          file: null,
                          preview: null,
                          uploading: false,
                          uploaded: false,
                        }
                      : p
                  )
                );
              } else {
                setAfterPhotos((prev) =>
                  prev.map((p, i) =>
                    i === index
                      ? {
                          file: null,
                          preview: null,
                          uploading: false,
                          uploaded: false,
                        }
                      : p
                  )
                );
              }
            }}
            className="mt-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded text-sm"
          >
            Завантажити інше фото
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, index, type)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={photo.uploading || isUploadingAll}
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

          {/* Прибрано індивідуальну кнопку завантаження — залишаємо лише "Завантажити всі фото" */}
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Завантаження фото &quot;До і Після&quot;
        </h1>

        {/* Прибрано поле "ID альбому" зі сторінки */}

        {/* Кнопка завантаження всіх фото */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Завантаження фото &quot;До і Після&quot;
              </h2>
              <p className="text-gray-600 mt-1">
                Виберіть файли та завантажте їх на сервер
              </p>
            </div>
            <button
              onClick={uploadAllPhotos}
              disabled={isUploadingAll}
              className={`flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium ${
                isUploadingAll
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-green-700"
              }`}
            >
              {isUploadingAll && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              {isUploadingAll ? "Завантаження..." : "Завантажити всі фото"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Фото "До" */}
          <div>
            <h2 className="text-2xl font-bold text-black mb-6">
              Фото &quot;До&quot; (3 обов&apos;язкові)
            </h2>
            <div className="space-y-6">
              {beforePhotos.map((photo, index) =>
                renderPhotoSlot(photo, index, "before")
              )}
            </div>
          </div>

          {/* Фото "Після" */}
          <div>
            <h2 className="text-2xl font-bold text-black mb-6">
              Фото &quot;Після&quot; (3 обов&apos;язкові)
            </h2>
            <div className="space-y-6">
              {afterPhotos.map((photo, index) =>
                renderPhotoSlot(photo, index, "after")
              )}
            </div>
          </div>
        </div>

        {/* Відображення завантажених фото */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Завантажені фото
              {loadingPhotos && (
                <span className="ml-2 text-blue-600">(Завантаження...)</span>
              )}
            </h2>
            {/* Прибрано глобальну кнопку видалення усіх колекцій */}
          </div>

          {/* Прибрано старий список колекцій (тепер рендеримо тільки нові блоки-колекції нижче) */}

          {loadingPhotos ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Завантаження фото...</p>
            </div>
          ) : uploadedPhotos.length === 0 ? (
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
                Завантажте перші фото, щоб побачити їх тут
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {collections.length > 0 ? (
                collections.map((collection) => {
                  const pairsInCollection = pairs.filter(
                    (p) => p.collectionId === collection.id
                  );

                  console.log(`🔍 Колекція ${collection.key}:`, {
                    collectionId: collection.id,
                    pairsInCollection: pairsInCollection.length,
                    allPairs: pairs.length,
                  });

                  // Розкладаємо фото по рядах: верхній — before, нижній — after
                  // Використовуємо pair.id або pair.key для унікальних ключів
                  const beforeRow = pairsInCollection
                    .map((p, index) =>
                      p.beforePhoto
                        ? {
                            ...p.beforePhoto,
                            tag: "before",
                            pairId: p.id || p.key || index,
                            pairKey: p.key || p.id || index,
                          }
                        : null
                    )
                    .filter(Boolean);
                  const afterRow = pairsInCollection
                    .map((p, index) =>
                      p.afterPhoto
                        ? {
                            ...p.afterPhoto,
                            tag: "after",
                            pairId: p.id || p.key || index,
                            pairKey: p.key || p.id || index,
                          }
                        : null
                    )
                    .filter(Boolean);

                  return (
                    <div
                      key={collection.key}
                      className="bg-white border border-gray-200 rounded-xl shadow-sm"
                    >
                      <div className="flex items-center justify-between p-4 border-b">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Колекція {collection.key}
                        </h4>
                        <button
                          onClick={() =>
                            deleteSpecificCollection(collection.key)
                          }
                          disabled={deletingCollectionKey === collection.key}
                          className={`flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded text-sm ${
                            deletingCollectionKey === collection.key
                              ? "opacity-70 cursor-not-allowed"
                              : "hover:bg-red-700"
                          }`}
                        >
                          {deletingCollectionKey === collection.key && (
                            <svg
                              className="animate-spin h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                              ></path>
                            </svg>
                          )}
                          {deletingCollectionKey === collection.key
                            ? "Видалення..."
                            : "🗑️ Видалити колекцію"}
                        </button>
                      </div>

                      <div className="p-4 space-y-6">
                        {/* Верхній ряд: До */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {beforeRow.map(
                            (photo) =>
                              photo && (
                                <div
                                  key={`before-${
                                    photo.pairId || photo.pairKey
                                  }-${photo.id}`}
                                  className="bg-white rounded-lg shadow overflow-hidden"
                                >
                                  <div className="aspect-w-16 aspect-h-9">
                                    <Image
                                      src={photo.url}
                                      alt={photo.title || "before"}
                                      width={400}
                                      height={192}
                                      className="w-full h-48 object-contain"
                                    />
                                  </div>
                                  <div className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                        before
                                      </span>
                                      {photo.createdAt && (
                                        <span className="text-xs text-gray-500">
                                          {new Date(
                                            photo.createdAt
                                          ).toLocaleDateString("uk-UA")}
                                        </span>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => changePhoto(photo.id)}
                                      className="w-full bg-blue-600 text-white text-sm py-1 px-3 rounded hover:bg-blue-700"
                                    >
                                      Змінити фото
                                    </button>
                                  </div>
                                </div>
                              )
                          )}
                        </div>

                        {/* Нижній ряд: Після */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {afterRow.map(
                            (photo) =>
                              photo && (
                                <div
                                  key={`after-${
                                    photo.pairId || photo.pairKey
                                  }-${photo.id}`}
                                  className="bg-white rounded-lg shadow overflow-hidden"
                                >
                                  <div className="aspect-w-16 aspect-h-9">
                                    <Image
                                      src={photo.url}
                                      alt={photo.title || "after"}
                                      width={400}
                                      height={192}
                                      className="w-full h-48 object-contain"
                                    />
                                  </div>
                                  <div className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                        after
                                      </span>
                                      {photo.createdAt && (
                                        <span className="text-xs text-gray-500">
                                          {new Date(
                                            photo.createdAt
                                          ).toLocaleDateString("uk-UA")}
                                        </span>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => changePhoto(photo.id)}
                                      className="w-full bg-blue-600 text-white text-sm py-1 px-3 rounded hover:bg-blue-700"
                                    >
                                      Змінити фото
                                    </button>
                                  </div>
                                </div>
                              )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : uploadedPhotos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    Немає фото в колекціях. Завантажте фото, щоб створити
                    колекцію.
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            Інструкції:
          </h3>
          <ul className="text-blue-800 space-y-1">
            <li>• Виберіть файл для кожного слота</li>
            {/* Прибрано інструкцію про індивідуальну кнопку завантаження */}
            <li>
              • Обов&apos;язково завантажте 3 фото &quot;До&quot; та 3 фото
              &quot;Після&quot;
            </li>
            <li>• Система автоматично створить пари після завантаження</li>
            <li>
              • Використовуйте кнопку &quot;Завантажити всі фото&quot; для
              пакетного завантаження
            </li>
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
