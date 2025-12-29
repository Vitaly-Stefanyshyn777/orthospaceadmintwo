import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/config";

// POST - проксувати запит до backend для завантаження фото
export async function POST(request: NextRequest) {
  console.log("📤 POST /api/v1/upload/photo - Проксування до backend");

  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Отримуємо FormData з запиту
    const formData = await request.formData();

    // Проксуємо запит до backend
    const backendUrl = `${BACKEND_URL}/api/v1/upload/photo`;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ POST /api/v1/upload/photo - Backend error: ${response.status}`,
        errorText
      );
      return NextResponse.json(
        { error: errorText || "Backend upload failed" },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log(
      `✅ POST /api/v1/upload/photo - Фото завантажено через backend`
    );

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("❌ POST /api/v1/upload/photo - Помилка:", error);
    return NextResponse.json(
      { error: "Failed to upload photo to backend" },
      { status: 500 }
    );
  }
}
