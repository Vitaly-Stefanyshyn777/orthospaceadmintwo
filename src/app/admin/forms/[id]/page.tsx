"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BACKEND_URL } from "@/lib/config";

interface FormSubmission {
  id: number;
  email: string;
  phone: string;
  name: string;
  address: string;
  workType: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export default function FormDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [item, setItem] = useState<FormSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `${BACKEND_URL}/api/v1/public/form/${id}`,
          {
            cache: "no-store",
          }
        );
        if (!res.ok) throw new Error("Не вдалося завантажити заявку");
        const data = await res.json();
        setItem(data);
      } catch (e: unknown) {
        setError((e as Error).message || "Помилка завантаження");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Назад
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Заявка #{id}</h1>
        {loading ? (
          <div className="text-gray-600">Завантаження...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : !item ? (
          <div className="text-gray-600">Не знайдено</div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 space-y-3">
            <Field label="Email" value={item.email} />
            <Field label="Телефон" value={item.phone} />
            <Field label="Імʼя" value={item.name} />
            <Field label="Адреса" value={item.address} />
            <Field label="Тип роботи" value={item.workType} />
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">
                Повідомлення
              </div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 rounded p-3 border">
                {item.message}
              </div>
            </div>
            <Field
              label="Створено"
              value={new Date(item.createdAt).toLocaleString("uk-UA")}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>
      <div className="text-sm text-gray-800">{value || "—"}</div>
    </div>
  );
}
