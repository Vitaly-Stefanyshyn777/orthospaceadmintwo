"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useConfirm } from "@/hooks/useConfirm";
import { BACKEND_URL } from "@/lib/config";
import { Swiper, SwiperSlide } from "swiper/react";
import SliderNav from "@/ui/SliderNav/SliderNavActions";
import "swiper/css";

// Тестові дані для заповнення
const TEST_DATA = [
  {
    categoryId: "01",
    mainTitle: "Обстеження",
    priceRange: "100-500 ГРН",
    services: [
      { type: "Tooth", name: "Консультація", price: "500.00" },
      { type: "Tooth", name: "Консультація + діагностика", price: "1000.00" },
      { type: "Tooth", name: "Консультація + план лікування", price: "300.00" },
      { type: "Tooth", name: "Прицільна рентгенографія", price: "100.00" },
      { type: "Tooth", name: "Знеболення", price: "200.00" },
      {
        type: "Tooth",
        name: "Надання допомоги при гострому болю",
        price: "400.00",
      },
      {
        type: "Tooth",
        name: "Нормо-година лікаря стоматолога",
        price: "400.00",
      },
    ],
  },
  {
    categoryId: "02",
    mainTitle: "Професійна Гігієна Зубів",
    priceRange: "700-3000 ГРН",
    services: [
      {
        type: "Tooth",
        name: "Професійна гігієна ротової порожнини",
        price: "1400.00",
      },
      {
        type: "Tooth",
        name: "Професійна гігієна ротової порожнини ускладнена",
        price: "1700.00",
      },
      {
        type: "Tooth",
        name: "Зняття зубних відкладень апаратом Air-Floy",
        price: "1000.00",
      },
      {
        type: "Tooth",
        name: "Ультразвукове зняття зубних відкладень",
        price: "500.00",
      },
      {
        type: "Tooth",
        name: "Фотовідбілювання зубних рядів",
        price: "3000.00",
      },
      {
        type: "Tooth",
        name: "Дитяча проф.гігієга порожнини рота",
        price: "700.00",
      },
    ],
  },
  {
    categoryId: "03",
    mainTitle: "Терапія",
    priceRange: "1400-2000 ГРН",
    services: [
      {
        type: "Tooth",
        name: "Реставрація фронтальної групи зубів (1 поверхні)",
        price: "1600.00",
      },
      {
        type: "Tooth",
        name: "Реставрація фронтальної групи зубів (2поверхні)",
        price: "1800.00",
      },
      {
        type: "Tooth",
        name: "Виготовлення силіконового ключа",
        price: "400.00",
      },
      {
        type: "Tooth",
        name: "Реставрація жувальної групи зубів",
        price: "1300.00 - 1600.00",
      },
      {
        type: "Tooth",
        name: "Реставрація фронтальної групи зубів з ураження ріжучого краю",
        price: "3000.00",
      },
      {
        type: "Tooth",
        name: "Моделювання культі зуба під коронку",
        price: "900.00",
      },
      {
        type: "Tooth",
        name: "Реставрація фронтальної групи зубів з восковим моделюванням",
        price: "2500.00",
      },
    ],
  },
  {
    categoryId: "04",
    mainTitle: "Ортодонтія",
    priceRange: "1400-2000 ГРН",
    services: [
      { type: "Tooth", name: "Консультаця ортодонта", price: "500.00" },
      { type: "Tooth", name: "Консультаця + діагностика", price: "1000.00" },
      { type: "Tooth", name: "Консультація ортодонта дитяча", price: "300.00" },
      {
        type: "Tooth",
        name: "Активація брекет-системи (контрольний огляд )",
        price: "800.00",
      },
      {
        type: "Tooth",
        name: "Брекет-система на одну щелепу лігатурна",
        price: "16000.00",
      },
      {
        type: "Tooth",
        name: "Брекет-система на одну щелепу самолігатурна",
        price: "19000.00",
      },
      { type: "Tooth", name: "Встаовлення Мікро-імпланта", price: "2500.00" },
      { type: "Tooth", name: "Зняття брекет-системи", price: "1200.00" },
      { type: "Tooth", name: "Ретенційна капа", price: "1400.00" },
      { type: "Tooth", name: "Фіксація ретейнера", price: "1200.00" },
      { type: "Tooth", name: "Корекція ретейнера", price: "300.00" },
      { type: "Tooth", name: "Заміна ретейнера", price: "1500.00" },
      { type: "Tooth", name: "Заміна брекета", price: "500.00" },
    ],
  },
  {
    categoryId: "05",
    mainTitle: "Ортопедія",
    priceRange: "1400-2000 ГРН",
    services: [
      { type: "Tooth", name: "Відбиток двошаровий повний", price: "500.00" },
      { type: "Tooth", name: "Відбиток двошаровий частковий", price: "300.00" },
      { type: "Tooth", name: "відбиток альгінатний", price: "200.00" },
      { type: "Tooth", name: "Коронка металокерамічна", price: "3500.00" },
      {
        type: "Tooth",
        name: "Коронка церконієва на фронтальну групу зубів",
        price: "210.00",
      },
      {
        type: "Tooth",
        name: "Коронка церконієва на жувальну групу зубів",
        price: "190.00",
      },
    ],
  },
  {
    categoryId: "06",
    mainTitle: "Хірургія",
    priceRange: "800-2500 ГРН",
    services: [
      { type: "Tooth", name: "Видалення зуба", price: "800.00" },
      { type: "Tooth", name: "Видалення рухомого зуба", price: "500.00" },
      { type: "Tooth", name: "Ускладнене видалення зуба", price: "1200.00" },
      { type: "Tooth", name: "Видалення верхнього 8 зуба", price: "1500.00" },
      { type: "Tooth", name: "Видалення нижнього 8 зуба", price: "1800.00" },
      { type: "Tooth", name: "Атипове видалення 8", price: "2500.00" },
      { type: "Tooth", name: "Розтин абсцесу, дренаж", price: "500.00" },
      { type: "Tooth", name: "К'юретаж", price: "300.00" },
      {
        type: "Tooth",
        name: "Встановлення гемостатичної губки",
        price: "200.00",
      },
      { type: "Tooth", name: "Коагуляція ясен", price: "200.00" },
    ],
  },
  {
    categoryId: "07",
    mainTitle: "Ендодонтія",
    priceRange: "400-3800 ГРН",
    services: [
      {
        type: "Tooth",
        name: "Первинне ендодонтичне лікування (різець)",
        price: "1800.00",
      },
      {
        type: "Tooth",
        name: "Первинне ендодонтичне лікування (премоляр)",
        price: "2300.00",
      },
      {
        type: "Tooth",
        name: "Первинне ендодонтичне лікування (моляр)",
        price: "2400.00",
      },
      {
        type: "Tooth",
        name: "Вторинне ендодонтичне лікування (різець)",
        price: "2200.00",
      },
      {
        type: "Tooth",
        name: "Вторинне ендодонтичне лікування (премоляр)",
        price: "3000.00",
      },
      {
        type: "Tooth",
        name: "Вторинне ендодонтичне лікування (моляр)",
        price: "3800.00",
      },
      { type: "Tooth", name: "Закриття ендодоступу", price: "400.00" },
      {
        type: "Tooth",
        name: "Преендодонтичне відновлення зуба",
        price: "500.00",
      },
    ],
  },
];

interface Service {
  id: number;
  type: string;
  name: string;
  price: string;
  isActive: boolean;
  order: number;
  categoryId: number;
}

interface ServiceCategory {
  id: number;
  categoryId: string;
  mainTitle: string;
  priceRange: string;
  order: number;
  isActive: boolean;
  services: Service[];
}

interface ServiceCategoryWithServices extends ServiceCategory {
  services: Service[];
}

export default function ServicesPage() {
  const { user } = useAuth();
  const { toast, showSuccess, showError, hideToast } = useToast();
  const { confirm, showConfirm, hideConfirm, handleConfirm } = useConfirm();

  const [categories, setCategories] = useState<ServiceCategoryWithServices[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [swiperInstances, setSwiperInstances] = useState<{
    [key: number]: any;
  }>({});
  const [activeIndexes, setActiveIndexes] = useState<{
    [key: number]: number;
  }>({});

  // Стани для створення/редагування
  const [editingCategory, setEditingCategory] =
    useState<ServiceCategory | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );

  // Форми
  const [categoryForm, setCategoryForm] = useState({
    categoryId: "",
    mainTitle: "",
    priceRange: "",
    order: 0,
  });

  const [serviceForm, setServiceForm] = useState({
    type: "",
    name: "",
    price: "",
    isActive: true,
    order: 0,
  });

  // Завантаження всіх категорій з послугами
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      console.log("🚀 Завантаження категорій послуг...");
      const response = await fetch(`${BACKEND_URL}/api/v1/public/services`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Отримано категорії:", data);

      // Гарантуємо, що кожна категорія має масив services
      const processedData = Array.isArray(data)
        ? data.map((category: ServiceCategoryWithServices) => ({
            ...category,
            services: Array.isArray(category.services) ? category.services : [],
          }))
        : [];

      setCategories(processedData);
    } catch (err) {
      console.error("❌ Помилка завантаження:", err);
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
      fetchCategories();
    }
  }, [user]);

  // Визначення чи це мобільний пристрій
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint в Tailwind
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Cleanup swiper instances при unmount
  useEffect(() => {
    return () => {
      Object.values(swiperInstances).forEach((swiper) => {
        if (swiper) {
          swiper.destroy();
        }
      });
    };
  }, [swiperInstances]);

  // Методи для SliderNav для конкретної категорії
  const handlePrev = (categoryId: number) => {
    const swiperInstance = swiperInstances[categoryId];
    if (swiperInstance) {
      swiperInstance.slidePrev();
      setActiveIndexes((prev) => ({
        ...prev,
        [categoryId]: swiperInstance.activeIndex,
      }));
    }
  };

  const handleNext = (categoryId: number) => {
    const swiperInstance = swiperInstances[categoryId];
    if (swiperInstance) {
      swiperInstance.slideNext();
      setActiveIndexes((prev) => ({
        ...prev,
        [categoryId]: swiperInstance.activeIndex,
      }));
    }
  };

  const handleDotClick = (categoryId: number, index: number) => {
    const swiperInstance = swiperInstances[categoryId];
    if (swiperInstance) {
      swiperInstance.slideTo(index);
      setActiveIndexes((prev) => ({
        ...prev,
        [categoryId]: index,
      }));
    }
  };

  const setSwiperForCategory = (categoryId: number, swiper: any) => {
    setSwiperInstances((prev) => ({
      ...prev,
      [categoryId]: swiper,
    }));

    // Підписуємося на зміни activeIndex
    if (swiper) {
      swiper.on("slideChange", () => {
        setActiveIndexes((prev) => ({
          ...prev,
          [categoryId]: swiper.activeIndex,
        }));
      });

      // Встановлюємо початковий activeIndex
      setActiveIndexes((prev) => ({
        ...prev,
        [categoryId]: swiper.activeIndex,
      }));
    }
  };

  // === КАТЕГОРІЇ ===

  // Створення категорії
  const createCategory = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${BACKEND_URL}/api/v1/services/categories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(categoryForm),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Помилка створення категорії");
      }

      await fetchCategories();
      setShowCategoryForm(false);
      setCategoryForm({
        categoryId: "",
        mainTitle: "",
        priceRange: "",
        order: 0,
      });
      showSuccess("Категорію створено успішно!");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Помилка створення");
    }
  };

  // Оновлення категорії
  const updateCategory = async () => {
    if (!editingCategory) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${BACKEND_URL}/api/v1/services/categories/${editingCategory.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(categoryForm),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Помилка оновлення категорії");
      }

      await fetchCategories();
      setEditingCategory(null);
      setShowCategoryForm(false);
      setCategoryForm({
        categoryId: "",
        mainTitle: "",
        priceRange: "",
        order: 0,
      });
      showSuccess("Категорію оновлено успішно!");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Помилка оновлення");
    }
  };

  // Видалення категорії
  const deleteCategory = async (category: ServiceCategory) => {
    showConfirm(
      "Видалення категорії",
      `Ви впевнені, що хочете видалити категорію "${category.mainTitle}"? Це також видалить всі послуги в цій категорії!`,
      async () => {
        try {
          const token = localStorage.getItem("authToken");
          const response = await fetch(
            `${BACKEND_URL}/api/v1/services/categories/${category.id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Не вдалося видалити категорію");
          }

          await fetchCategories();
          showSuccess("Категорію видалено успішно!");
        } catch (err) {
          showError(err instanceof Error ? err.message : "Помилка видалення");
        }
      },
      {
        confirmText: "Видалити",
        cancelText: "Скасувати",
        type: "danger",
      }
    );
  };

  // === ПОСЛУГИ ===

  // Створення послуги
  const createService = async () => {
    if (!selectedCategoryId) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${BACKEND_URL}/api/v1/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...serviceForm,
          categoryId: selectedCategoryId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Помилка створення послуги");
      }

      await fetchCategories();
      setShowServiceForm(false);
      setSelectedCategoryId(null);
      setServiceForm({
        type: "",
        name: "",
        price: "",
        isActive: true,
        order: 0,
      });
      showSuccess("Послугу створено успішно!");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Помилка створення");
    }
  };

  // Оновлення послуги
  const updateService = async () => {
    if (!editingService) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${BACKEND_URL}/api/v1/services/${editingService.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(serviceForm),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Помилка оновлення послуги");
      }

      await fetchCategories();
      setEditingService(null);
      setShowServiceForm(false);
      setServiceForm({
        type: "",
        name: "",
        price: "",
        isActive: true,
        order: 0,
      });
      showSuccess("Послугу оновлено успішно!");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Помилка оновлення");
    }
  };

  // Видалення послуги
  const deleteService = async (service: Service) => {
    showConfirm(
      "Видалення послуги",
      `Ви впевнені, що хочете видалити послугу "${service.name}"?`,
      async () => {
        try {
          const token = localStorage.getItem("authToken");
          const response = await fetch(
            `${BACKEND_URL}/api/v1/services/${service.id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Не вдалося видалити послугу");
          }

          await fetchCategories();
          showSuccess("Послугу видалено успішно!");
        } catch (err) {
          showError(err instanceof Error ? err.message : "Помилка видалення");
        }
      },
      {
        confirmText: "Видалити",
        cancelText: "Скасувати",
        type: "danger",
      }
    );
  };

  // Функції відкриття форм
  const openCategoryForm = (category?: ServiceCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        categoryId: category.categoryId,
        mainTitle: category.mainTitle,
        priceRange: category.priceRange,
        order: category.order,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        categoryId: "",
        mainTitle: "",
        priceRange: "",
        order: 0,
      });
    }
    setShowCategoryForm(true);
  };

  const openServiceForm = (categoryId: number, service?: Service) => {
    setSelectedCategoryId(categoryId);
    if (service) {
      setEditingService(service);
      setServiceForm({
        type: service.type,
        name: service.name,
        price: service.price,
        isActive: service.isActive,
        order: service.order,
      });
    } else {
      setEditingService(null);
      setServiceForm({
        type: "",
        name: "",
        price: "",
        isActive: true,
        order: 0,
      });
    }
    setShowServiceForm(true);
  };

  // Функція для отримання назви категорії по ID
  const getCategoryName = (categoryId: number) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.mainTitle : "Невідома категорія";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Наші Послуги</h1>
            <p className="mt-2 text-gray-600">
              Управління категоріями та послугами ({categories.length}{" "}
              категорій)
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => openCategoryForm()}
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Додати категорію
            </button>
            <button
              onClick={fetchCategories}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center gap-2"
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
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Категорій</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.length}
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
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Послуг</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.reduce(
                    (total, cat) => total + (cat.services?.length || 0),
                    0
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Активних</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.reduce(
                    (total, cat) =>
                      total + cat.services.filter((s) => s.isActive).length,
                    0
                  )}
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Середня ціна
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.length > 0
                    ? Math.round(
                        categories.reduce(
                          (total, cat) =>
                            total +
                            cat.services.reduce(
                              (catTotal, service) =>
                                catTotal + parseFloat(service.price || "0"),
                              0
                            ),
                          0
                        ) /
                          Math.max(
                            categories.reduce(
                              (total, cat) =>
                                total + (cat.services?.length || 0),
                              0
                            ),
                            1
                          )
                      )
                    : 0}{" "}
                  ₴
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Категорії */}
        <div className="space-y-6">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-24 h-24 text-gray-400 mx-auto mb-4"
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Немає категорій послуг
              </h3>
              <p className="text-gray-600 mb-4">
                Створіть першу категорію, щоб почати додавати послуги
              </p>
              <button
                onClick={() => openCategoryForm()}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Створити категорію
              </button>
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="rounded-lg shadow">
                {/* Заголовок категорії */}
                <div className="px-6 py-4 border-b border-gray-200 bg-white">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {category.categoryId}
                        </span>
                        <h2 className="text-xl font-bold text-gray-900">
                          {category.mainTitle}
                        </h2>
                      </div>
                      <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {category.priceRange}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openCategoryForm(category)}
                        className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                      >
                        Редагувати
                      </button>
                      <button
                        onClick={() => deleteCategory(category)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Видалити
                      </button>
                    </div>
                  </div>
                </div>

                {/* Послуги категорії */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Послуги ({category.services?.length || 0})
                    </h3>
                    <button
                      onClick={() => openServiceForm(category.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Додати послугу
                    </button>
                  </div>

                  {(category.services?.length || 0) === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 mb-4">
                        У цій категорії ще немає послуг
                      </p>
                      <button
                        onClick={() => openServiceForm(category.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Додати першу послугу
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Мобільний свайпер */}
                      {isMobile ? (
                        <div className="md:hidden">
                          <Swiper
                            modules={[]}
                            spaceBetween={10}
                            slidesPerView={1}
                            onSwiper={(swiper) =>
                              setSwiperForCategory(category.id, swiper)
                            }
                            className="services-swiper"
                          >
                            {category.services?.map((service) => (
                              <SwiperSlide key={service.id}>
                                <div
                                  className={`border rounded-lg p-4 ${
                                    service.isActive
                                      ? "border-gray-200 bg-white"
                                      : "border-red-200 bg-red-50"
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span
                                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        service.type === "Tooth"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {service.type}
                                    </span>
                                  </div>

                                  <h4 className="font-medium text-gray-900 mb-2 text-center">
                                    {service.name}
                                  </h4>

                                  <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-green-600">
                                      {service.price} ₴
                                    </span>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() =>
                                          openServiceForm(category.id, service)
                                        }
                                        className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        onClick={() => deleteService(service)}
                                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </SwiperSlide>
                            ))}
                          </Swiper>
                        </div>
                      ) : (
                        /* Десктоп grid */
                        <div className="hidden md:grid md:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {category.services?.map((service) => (
                            <div
                              key={service.id}
                              className={`border rounded-lg p-4 ${
                                service.isActive
                                  ? "border-gray-200 bg-white"
                                  : "border-red-200 bg-red-50"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    service.type === "Tooth"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {service.type}
                                </span>
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    service.isActive
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {service.isActive ? "Активна" : "Неактивна"}
                                </span>
                              </div>

                              <h4 className="font-medium text-gray-900 mb-2 text-center">
                                {service.name}
                              </h4>

                              <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-green-600">
                                  {service.price} ₴
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      openServiceForm(category.id, service)
                                    }
                                    className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => deleteService(service)}
                                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* SliderNav під кожною категорією */}
                      {isMobile &&
                        category.services &&
                        category.services.length > 1 && (
                          <div className="mt-4 flex justify-center">
                            <SliderNav
                              activeIndex={
                                isMobile ? activeIndexes[category.id] || 0 : 0
                              }
                              dots={category.services.length}
                              onPrev={() => handlePrev(category.id)}
                              onNext={() => handleNext(category.id)}
                              onDotClick={(index) =>
                                handleDotClick(category.id, index)
                              }
                              buttonBgColor="#3B82F6"
                            />
                          </div>
                        )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Форма категорії */}
        {showCategoryForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">
                {editingCategory
                  ? "Редагувати категорію"
                  : "Створити категорію"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID категорії
                  </label>
                  <input
                    type="text"
                    value={categoryForm.categoryId}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        categoryId: e.target.value,
                      })
                    }
                    className="w-full border rounded px-3 py-2 placeholder-gray-400 text-black"
                    placeholder="01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Назва категорії
                  </label>
                  <input
                    type="text"
                    value={categoryForm.mainTitle}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        mainTitle: e.target.value,
                      })
                    }
                    className="w-full border rounded px-3 py-2 placeholder-gray-400 text-black"
                    placeholder="Обстеження"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Діапазон цін
                  </label>
                  <input
                    type="text"
                    value={categoryForm.priceRange}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        priceRange: e.target.value,
                      })
                    }
                    className="w-full border rounded px-3 py-2 placeholder-gray-400 text-black"
                    placeholder="100-500 ГРН"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Порядок
                  </label>
                  <input
                    type="number"
                    value={categoryForm.order}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full border rounded px-3 py-2 placeholder-gray-400 text-black"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={editingCategory ? updateCategory : createCategory}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  {editingCategory ? "Оновити" : "Створити"}
                </button>
                <button
                  onClick={() => {
                    setShowCategoryForm(false);
                    setEditingCategory(null);
                    setCategoryForm({
                      categoryId: "",
                      mainTitle: "",
                      priceRange: "",
                      order: 0,
                    });
                  }}
                  className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
                >
                  Скасувати
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Форма послуги */}
        {showServiceForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4 text-black">
                {editingService ? "Редагувати послугу" : "Створити послугу"}
              </h3>
              {selectedCategoryId && (
                <p className="text-sm text-gray-600 mb-4">
                  Категорія: {getCategoryName(selectedCategoryId)}
                </p>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Тип
                  </label>
                  <input
                    type="text"
                    value={serviceForm.type}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, type: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2 placeholder-gray-400 text-black"
                    placeholder="Tooth"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Назва послуги
                  </label>
                  <input
                    type="text"
                    value={serviceForm.name}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, name: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2 placeholder-gray-400 text-black"
                    placeholder="Консультація"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ціна
                  </label>
                  <input
                    type="text"
                    value={serviceForm.price}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, price: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2 placeholder-gray-400 text-black"
                    placeholder="500.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Порядок
                  </label>
                  <input
                    type="number"
                    value={serviceForm.order}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full border rounded px-3 py-2 placeholder-gray-400 text-black"
                    min="0"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={serviceForm.isActive}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        isActive: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">Активна</label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={editingService ? updateService : createService}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  {editingService ? "Оновити" : "Створити"}
                </button>
                <button
                  onClick={() => {
                    setShowServiceForm(false);
                    setEditingService(null);
                    setSelectedCategoryId(null);
                    setServiceForm({
                      type: "",
                      name: "",
                      price: "",
                      isActive: true,
                      order: 0,
                    });
                  }}
                  className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
                >
                  Скасувати
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Інструкції */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">
            📋 Інструкції
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">
                🔧 Управління категоріями:
              </h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Натисніть "Додати категорію" для створення нової</li>
                <li>• Кожна категорія має унікальний ID (01, 02, etc.)</li>
                <li>• Вкажіть діапазон цін для категорії</li>
                <li>• Використовуйте порядок для сортування</li>
                <li>
                  • ⚠️ Категорії не мають поля "Активна" (на відміну від послуг)
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">
                💼 Управління послугами:
              </h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Натисніть "Додати послугу" в межах категорії</li>
                <li>• Тип послуги: Tooth, Surgery, etc.</li>
                <li>• Ціна в форматі: 500.00</li>
                <li>• Послуги можна деактивувати</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">
                📝 Тестові дані:
              </h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Натисніть "📝 Заповнити тестовими даними"</li>
                <li>• Створить 7 категорій з усіма послугами</li>
                <li>• Включає всі надані вами дані</li>
                <li>• Послуги будуть активними за замовчуванням</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Стилізовані повідомлення */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Підтвердження */}
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
