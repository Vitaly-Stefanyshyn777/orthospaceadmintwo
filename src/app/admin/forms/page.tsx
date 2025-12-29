"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "@/lib/config";

type FormItem = {
  id: number;
  email: string;
  phone: string;
  name: string;
  address: string;
  workType: string;
  message: string;
  createdAt: string;
};

export default function FormsListPage() {
  const [items, setItems] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForms = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${BACKEND_URL}/api/v1/public/form?limit=50`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: "no-store",
        }
      );
      if (!res.ok) throw new Error("Не вдалося завантажити заявки");
      const data = await res.json();
      // очікуємо або масив без обгортки, або {items: [...]} – нормалізуємо
      const list = Array.isArray(data) ? data : data.items || [];
      setItems(
        list.map((i: FormItem) => ({
          id: i.id,
          email: i.email,
          phone: i.phone,
          name: i.name,
          address: i.address,
          workType: i.workType,
          message: i.message,
          createdAt: i.createdAt,
        }))
      );
    } catch (e: unknown) {
      setError((e as Error).message || "Помилка завантаження");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Заявки форми</h1>
          <button
            onClick={fetchForms}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Оновити
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-600 py-12">Завантаження...</div>
        ) : error ? (
          <div className="text-center text-red-600 py-12">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-center text-gray-600 py-12">
            Заявок поки немає
          </div>
        ) : (
          <div>
            {/* Desktop/tablet table */}
            <div className="hidden md:block overflow-x-auto bg-white shadow rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Телефон
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Імʼя
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Адреса
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Тип роботи
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Створено
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((i) => (
                    <tr key={i.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {i.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {i.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {i.phone}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {i.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {i.address}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {i.workType}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(i.createdAt).toLocaleString("uk-UA")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/forms/${i.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Деталі
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {items.map((i) => (
                <div key={i.id} className="bg-white shadow rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-gray-900">
                      #{i.id}
                    </div>
                    <Link
                      href={`/admin/forms/${i.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Деталі
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <div className="text-gray-500">Email</div>
                      <div className="text-gray-800 break-words">
                        {i.email || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Телефон</div>
                      <div className="text-gray-800">{i.phone || "—"}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Імʼя</div>
                      <div className="text-gray-800">{i.name || "—"}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Адреса</div>
                      <div className="text-gray-800">{i.address || "—"}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Тип роботи</div>
                      <div className="text-gray-800">{i.workType || "—"}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Створено</div>
                      <div className="text-gray-800">
                        {new Date(i.createdAt).toLocaleString("uk-UA")}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
