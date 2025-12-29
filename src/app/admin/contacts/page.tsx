"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { BACKEND_URL } from "@/lib/config";

// Інтерфейси для контактних даних
interface WorkHours {
  weekdays: string;
  weekdayHours: string;
  weekend: string;
  weekendHours: string;
}

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  telegram?: string;
  viber?: string;
}

interface ContactInfo {
  title: string;
  description: string;
  phone: string;
  workHours: WorkHours;
  socialLinks: SocialLinks[];
}

interface LocationInfo {
  title: string;
  description: string;
  address: string;
  phone: string;
  viberPhone?: string; // Зберігаємо тільки номер телефону замість повного URL
  telegramLink?: string;
}

interface ContactsData {
  contactInfo: ContactInfo;
  locationInfo: LocationInfo;
}

export default function ContactsPage() {
  const { user } = useAuth();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const [contacts, setContacts] = useState<ContactsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Стан для редагування
  const [editingContactInfo, setEditingContactInfo] = useState(false);
  const [editingLocationInfo, setEditingLocationInfo] = useState(false);

  // Форми для редагування
  const [contactForm, setContactForm] = useState<ContactInfo>({
    title: "",
    description: "",
    phone: "",
    workHours: {
      weekdays: "",
      weekdayHours: "",
      weekend: "",
      weekendHours: "",
    },
    socialLinks: [
      {
        facebook: "",
        instagram: "",
        telegram: "",
        viber: "",
      },
    ],
  });

  const [locationForm, setLocationForm] = useState<LocationInfo>({
    title: "",
    description: "",
    address: "",
    phone: "",
    viberPhone: "",
    telegramLink: "",
  });

  // Завантаження даних контактів
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      console.log("🚀 Завантаження контактних даних...");
      console.log("📡 URL:", `${BACKEND_URL}/api/v1/public/contacts`);
      console.log("🔑 Token:", token ? "Присутній" : "Відсутній");

      // Спробуємо різні варіанти URL для отримання даних
      const possibleUrls = [
        `${BACKEND_URL}/api/v1/public/contacts`,
        `${BACKEND_URL}/contacts`,
        `${BACKEND_URL}/api/contacts`,
        `${BACKEND_URL}/api/v1/contacts`,
      ];

      let response;
      let data;
      let workingUrl = null;

      for (const url of possibleUrls) {
        try {
          console.log(`🔍 Перевірка: ${url}`);
          response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            data = await response.json();
            workingUrl = url;
            console.log(`✅ Знайдено робочий маршрут: ${url}`);
            console.log("📨 Статус відповіді:", response.status);
            console.log("✅ Отримано контактні дані:", data);
            break;
          } else {
            console.log(`❌ ${url} повернув ${response.status}`);
          }
        } catch (err) {
          console.log(`❌ Помилка з ${url}:`, err);
        }
      }

      if (!data) {
        throw new Error(
          "Не вдалося знайти робочий API маршрут для отримання контактів"
        );
      }

      setContacts(data);

      // Ініціалізуємо форми поточними даними
      if (data.contactInfo) {
        setContactForm(data.contactInfo);
      }
      if (data.locationInfo) {
        // Конвертуємо viberLink в viberPhone для форми
        const locationData = { ...data.locationInfo };
        if (locationData.viberLink) {
          // Витягуємо номер телефону з viber://chat?number=%2B380505115810
          const url = new URL(locationData.viberLink);
          const phoneNumber = url.searchParams.get("number");
          if (phoneNumber) {
            locationData.viberPhone = decodeURIComponent(phoneNumber);
          }
          delete locationData.viberLink; // Видаляємо старе поле
        }
        setLocationForm(locationData);
      }
    } catch (err) {
      console.error("❌ Помилка завантаження контактів:", err);
      showError(
        `Помилка завантаження: ${
          err instanceof Error ? err.message : "Невідома помилка"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  // Збереження контактної інформації
  const saveContactInfo = async () => {
    if (!contacts) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("authToken");

      console.log("💾 Збереження контактної інформації:", contactForm);
      console.log("📡 URL:", `${BACKEND_URL}/api/v1/contacts/contact-info`);

      // Використовуємо окремий маршрут для контактної інформації
      const response = await fetch(
        `${BACKEND_URL}/api/v1/contacts/contact-info`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(contactForm),
        }
      );

      console.log("📨 Статус відповіді:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `HTTP ${response.status}: Помилка збереження контактної інформації`
        );
      }

      console.log("✅ Контактна інформація збережена успішно");
      await fetchContacts();
      setEditingContactInfo(false);
      showSuccess("Контактна інформація оновлена успішно!");
    } catch (err) {
      console.error("❌ Помилка збереження контактної інформації:", err);
      showError(err instanceof Error ? err.message : "Помилка збереження");
    } finally {
      setSaving(false);
    }
  };

  // Збереження інформації про місцезнаходження
  const saveLocationInfo = async () => {
    if (!contacts) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("authToken");

      // Конвертуємо viberPhone в viberLink для відправки на бекенд
      const dataToSend = {
        ...locationForm,
        viberLink: locationForm.viberPhone
          ? formatViberLink(locationForm.viberPhone)
          : undefined,
      };
      // Видаляємо viberPhone з даних для відправки
      delete dataToSend.viberPhone;

      console.log("💾 Збереження інформації про місцезнаходження:", dataToSend);
      console.log("📡 URL:", `${BACKEND_URL}/api/v1/contacts/location-info`);
      console.log("📦 Надсилаємо дані:", JSON.stringify(dataToSend, null, 2));

      // Використовуємо окремий маршрут для інформації про місцезнаходження
      const response = await fetch(
        `${BACKEND_URL}/api/v1/contacts/location-info`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dataToSend),
        }
      );

      console.log("📨 Статус відповіді:", response.status);

      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error("❌ Деталі помилки:", errorData);
        } catch {
          const errorText = await response.text();
          console.error("❌ Текст помилки:", errorText);
        }
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `HTTP ${response.status}: Помилка збереження інформації про місцезнаходження`
        );
      }

      console.log("✅ Інформація про місцезнаходження збережена успішно");
      await fetchContacts();
      setEditingLocationInfo(false);
      showSuccess("Інформація про місцезнаходження оновлена успішно!");
    } catch (err) {
      console.error(
        "❌ Помилка збереження інформації про місцезнаходження:",
        err
      );
      showError(err instanceof Error ? err.message : "Помилка збереження");
    } finally {
      setSaving(false);
    }
  };

  // Допоміжні функції
  const updateSocialLink = (
    index: number,
    field: keyof SocialLinks,
    value: string
  ) => {
    const updatedLinks = [...contactForm.socialLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setContactForm({ ...contactForm, socialLinks: updatedLinks });
  };

  const updateWorkHours = (field: keyof WorkHours, value: string) => {
    setContactForm({
      ...contactForm,
      workHours: { ...contactForm.workHours, [field]: value },
    });
  };

  // Функція для формування viber посилання з номера телефону
  const formatViberLink = (phoneNumber?: string) => {
    if (!phoneNumber) return "";
    // Видаляємо всі нецифрові символи крім +
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, "");
    return `viber://chat?number=${encodeURIComponent(cleanPhone)}`;
  };

  // Функція для отримання viber посилання для відображення
  const getViberLink = (locationInfo?: LocationInfo) => {
    if (!locationInfo) return "";
    // Формуємо посилання з viberPhone
    if (locationInfo.viberPhone)
      return formatViberLink(locationInfo.viberPhone);
    return "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              Завантаження контактних даних...
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Перевіряйте консоль браузера для деталей
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0 mb-12">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900">📞 Контакти</h1>
            <p className="mt-2 text-gray-600">
              Управління контактною інформацією та даними про місцезнаходження
            </p>
          </div>
          <button
            onClick={fetchContacts}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
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

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Телефони</p>
                <p className="text-lg font-bold text-gray-900">
                  {contacts?.contactInfo?.phone && contacts?.locationInfo?.phone
                    ? "2"
                    : "1"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Соціальні мережі
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {contacts?.contactInfo?.socialLinks?.[0]
                    ? Object.values(contacts.contactInfo.socialLinks[0]).filter(
                        (link) => link
                      ).length
                    : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Месенджери</p>
                <p className="text-lg font-bold text-gray-900">
                  {(contacts?.locationInfo?.telegramLink ? 1 : 0) +
                    (getViberLink(contacts?.locationInfo) ? 1 : 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Контактна інформація */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
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
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Контактна інформація
                    </h2>
                    <p className="text-sm text-gray-600">
                      Основні контактні дані та графік роботи
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!editingContactInfo ? (
                    <button
                      onClick={() => setEditingContactInfo(true)}
                      className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Редагувати
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={saveContactInfo}
                        disabled={saving}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {saving ? "Збереження..." : "Зберегти"}
                      </button>
                      <button
                        onClick={() => setEditingContactInfo(false)}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                      >
                        Скасувати
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              {editingContactInfo ? (
                /* Форма редагування контактної інформації */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Заголовок
                      </label>
                      <input
                        type="text"
                        value={contactForm.title}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            title: e.target.value,
                          })
                        }
                        className="w-full border rounded px-3 py-2 placeholder-gray-400 text-black"
                        placeholder="Зв'яжіться з нами"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Телефон
                      </label>
                      <input
                        type="text"
                        value={contactForm.phone}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            phone: e.target.value,
                          })
                        }
                        className="w-full border rounded px-3 py-2 placeholder-gray-400 text-black"
                        placeholder="050 511 5810"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Опис
                    </label>
                    <textarea
                      value={contactForm.description}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full border rounded px-3 py-2 h-24 placeholder-gray-400 text-black"
                      placeholder="Залишіть нам заявку..."
                    />
                  </div>

                  {/* Графік роботи */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      🕒 Графік роботи
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Будні дні
                        </label>
                        <input
                          type="text"
                          value={contactForm.workHours.weekdays}
                          onChange={(e) =>
                            updateWorkHours("weekdays", e.target.value)
                          }
                          className="w-full border rounded px-3 py-2 placeholder-gray-400 text-black"
                          placeholder="Пн-Пт"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Час будні
                        </label>
                        <input
                          type="text"
                          value={contactForm.workHours.weekdayHours}
                          onChange={(e) =>
                            updateWorkHours("weekdayHours", e.target.value)
                          }
                          className="w-full border rounded px-3 py-2 placeholder-gray-400 text-black"
                          placeholder="08:00 - 20:00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Вихідні
                        </label>
                        <input
                          type="text"
                          value={contactForm.workHours.weekend}
                          onChange={(e) =>
                            updateWorkHours("weekend", e.target.value)
                          }
                          className="w-full border rounded px-3 py-2 placeholder-gray-400 text-black"
                          placeholder="Сб-Нд"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Час вихідні
                        </label>
                        <input
                          type="text"
                          value={contactForm.workHours.weekendHours}
                          onChange={(e) =>
                            updateWorkHours("weekendHours", e.target.value)
                          }
                          className="w-full border rounded px-3 py-2 placeholder-gray-400 text-black"
                          placeholder="09:00 - 18:00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Соціальні мережі */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      📱 Соціальні мережі
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Facebook
                        </label>
                        <input
                          type="url"
                          value={contactForm.socialLinks[0]?.facebook || ""}
                          onChange={(e) =>
                            updateSocialLink(0, "facebook", e.target.value)
                          }
                          className="w-full border rounded px-3 py-2 placeholder-gray-400 text-black"
                          placeholder="https://facebook.com/orthospace"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Instagram
                        </label>
                        <input
                          type="url"
                          value={contactForm.socialLinks[0]?.instagram || ""}
                          onChange={(e) =>
                            updateSocialLink(0, "instagram", e.target.value)
                          }
                          className="w-full border rounded px-3 py-2 placeholder-gray-400 text-black"
                          placeholder="https://instagram.com/orthospace"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telegram
                        </label>
                        <input
                          type="url"
                          value={contactForm.socialLinks[0]?.telegram || ""}
                          onChange={(e) =>
                            updateSocialLink(0, "telegram", e.target.value)
                          }
                          className="w-full border rounded px-3 py-2 placeholder-gray-400 text-black"
                          placeholder="https://t.me/orthospace"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Viber
                        </label>
                        <input
                          type="url"
                          value={contactForm.socialLinks[0]?.viber || ""}
                          onChange={(e) =>
                            updateSocialLink(0, "viber", e.target.value)
                          }
                          className="w-full border rounded px-3 py-2 placeholder-gray-400 text-black"
                          placeholder="viber://chat?number=%2B380505115810"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Відображення контактної інформації */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {contacts?.contactInfo?.title ||
                          "Заголовок не встановлено"}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {contacts?.contactInfo?.description ||
                          "Опис не встановлено"}
                      </p>
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span className="text-lg font-medium text-green-600">
                          {contacts?.contactInfo?.phone ||
                            "Телефон не встановлено"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">
                        🕒 Графік роботи
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">
                            {contacts?.contactInfo?.workHours?.weekdays ||
                              "Пн-Пт"}
                            :
                          </span>
                          <span className="ml-2">
                            {contacts?.contactInfo?.workHours?.weekdayHours ||
                              "08:00 - 20:00"}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">
                            {contacts?.contactInfo?.workHours?.weekend ||
                              "Сб-Нд"}
                            :
                          </span>
                          <span className="ml-2">
                            {contacts?.contactInfo?.workHours?.weekendHours ||
                              "09:00 - 18:00"}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-md font-medium text-gray-900 mb-3 mt-4">
                        📱 Соціальні мережі
                      </h4>
                      <div className="flex gap-3">
                        {contacts?.contactInfo?.socialLinks?.[0]?.facebook && (
                          <a
                            href={contacts.contactInfo.socialLinks[0].facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Facebook
                          </a>
                        )}
                        {contacts?.contactInfo?.socialLinks?.[0]?.instagram && (
                          <a
                            href={contacts.contactInfo.socialLinks[0].instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-600 hover:text-pink-800"
                          >
                            Instagram
                          </a>
                        )}
                        {contacts?.contactInfo?.socialLinks?.[0]?.telegram && (
                          <a
                            href={contacts.contactInfo.socialLinks[0].telegram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                          >
                            Telegram
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Інформація про місцезнаходження */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
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
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Місцезнаходження
                    </h2>
                    <p className="text-sm text-gray-600">
                      Адреса та контактні дані для зв'язку
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!editingLocationInfo ? (
                    <button
                      onClick={() => setEditingLocationInfo(true)}
                      className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Редагувати
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={saveLocationInfo}
                        disabled={saving}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {saving ? "Збереження..." : "Зберегти"}
                      </button>
                      <button
                        onClick={() => setEditingLocationInfo(false)}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                      >
                        Скасувати
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              {editingLocationInfo ? (
                /* Форма редагування інформації про місцезнаходження */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Заголовок
                      </label>
                      <input
                        type="text"
                        value={locationForm.title}
                        onChange={(e) =>
                          setLocationForm({
                            ...locationForm,
                            title: e.target.value,
                          })
                        }
                        className="w-full border rounded px-3 py-2 placeholder-gray-400 text-black"
                        placeholder="Де нас знайти?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Телефон
                      </label>
                      <input
                        type="text"
                        value={locationForm.phone}
                        onChange={(e) =>
                          setLocationForm({
                            ...locationForm,
                            phone: e.target.value,
                          })
                        }
                        className="w-full border rounded px-3 py-2 placeholder-gray-400 text-black"
                        placeholder="050 511 5810"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Адреса
                    </label>
                    <input
                      type="text"
                      value={locationForm.address}
                      onChange={(e) =>
                        setLocationForm({
                          ...locationForm,
                          address: e.target.value,
                        })
                      }
                      className="w-full border rounded px-3 py-2 placeholder-gray-400 text-black"
                      placeholder="м. Долина, вул. Обліски 115В"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Опис
                    </label>
                    <textarea
                      value={locationForm.description}
                      onChange={(e) =>
                        setLocationForm({
                          ...locationForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full border rounded px-3 py-2 h-24 placeholder-gray-400 text-black"
                      placeholder="У OrthoSpace ви знайдете..."
                    />
                  </div>

                  {/* Посилання на месенджери */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      💬 Посилання на месенджери
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telegram
                        </label>
                        <input
                          type="url"
                          value={locationForm.telegramLink || ""}
                          onChange={(e) =>
                            setLocationForm({
                              ...locationForm,
                              telegramLink: e.target.value,
                            })
                          }
                          className="w-full border rounded px-3 py-2 placeholder-gray-400 text-black"
                          placeholder="https://t.me/orthospace"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Viber (номер телефону)
                        </label>
                        <input
                          type="tel"
                          value={locationForm.viberPhone || ""}
                          onChange={(e) =>
                            setLocationForm({
                              ...locationForm,
                              viberPhone: e.target.value,
                            })
                          }
                          className="w-full border rounded px-3 py-2 placeholder-gray-400 text-black"
                          placeholder="+380505115810"
                        />
                        {locationForm.viberPhone && (
                          <p className="text-xs text-gray-500 mt-1">
                            Посилання:{" "}
                            {formatViberLink(locationForm.viberPhone)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Відображення інформації про місцезнаходження */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {contacts?.locationInfo?.title ||
                          "Заголовок не встановлено"}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {contacts?.locationInfo?.description ||
                          "Опис не встановлено"}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-sm text-gray-600">
                          {contacts?.locationInfo?.address ||
                            "Адреса не встановлена"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span className="text-lg font-medium text-green-600">
                          {contacts?.locationInfo?.phone ||
                            "Телефон не встановлено"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">
                        💬 Зв'язатися
                      </h4>
                      <div className="flex gap-3">
                        {contacts?.locationInfo?.telegramLink && (
                          <a
                            href={contacts.locationInfo.telegramLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                            </svg>
                            Telegram
                          </a>
                        )}
                        {getViberLink(contacts?.locationInfo) && (
                          <a
                            href={getViberLink(contacts?.locationInfo)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12.019 0C5.373 0 0 5.372 0 11.621c0 3.832 1.933 7.147 4.887 9.275-.059-.983-.088-2.494.028-3.581.098-1.035.684-2.087 1.253-3.012l.761-1.142c.535-.802 1.063-1.597 1.596-2.383.584-.862 1.156-1.707 1.718-2.536.589-.867 1.166-1.717 1.734-2.551.567-.835 1.123-1.645 1.669-2.43.546-.784 1.08-1.541 1.602-2.271C13.788 1.185 14.489.656 15.235.195c.746-.461 1.492-.694 2.249-.694.757 0 1.503.233 2.249.694.746.461 1.447.99 2.102 1.663.546.729 1.082 1.487 1.602 2.271.546.785 1.102 1.595 1.669 2.43.567.834 1.145 1.684 1.734 2.551.562.829 1.134.674 1.718 2.536.533.786 1.061 1.581 1.596 2.383l.761 1.142c.569.925 1.155 1.977 1.253 3.012.116 1.087.087 2.598.028 3.581 2.954-2.128 4.887-5.443 4.887-9.275C24.038 5.372 18.665 0 12.019 0z" />
                            </svg>
                            Viber
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Інструкції */}
        <div className="mt-8 bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-green-900 mb-4">
            📋 Інструкції
          </h3>
          <ul className="text-green-700 text-sm space-y-1">
            <li>
              • Натисніть "Редагувати" для зміни контактної інформації або даних
              про місцезнаходження
            </li>
            <li>• Зберігайте зміни після редагування</li>
            <li>• Посилання на соціальні мережі мають бути валідними URL</li>
            <li>
              • Для Viber введіть номер телефону - він буде автоматично
              конвертовано в viber:// посилання
            </li>
            <li>• Всі поля обов'язкові для коректного відображення на сайті</li>
            <li>• Дані автоматично синхронізуються з публічним API</li>
            <li>
              • 📡 Використовуються окремі маршрути для контактної інформації та
              місцезнаходження
            </li>
            <li>• 🔍 Перевіряйте консоль браузера для деталей API запитів</li>
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
