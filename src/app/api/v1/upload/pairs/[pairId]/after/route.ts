import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/config";

// PUT - проксувати запит до backend для заміни фото "Після" в парі
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ pairId: string }> }
) {
  const { pairId } = await params;

  console.log(
    `🔄 PUT /api/v1/upload/pairs/${pairId}/after - Проксування до backend`
  );

  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Отримуємо FormData з запиту
    const formData = await request.formData();

    // Проксуємо запит до backend
    const backendUrl = `${BACKEND_URL}/api/v1/upload/pairs/${pairId}/after`;

    const response = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        Authorization: authHeader,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ PUT /api/v1/upload/pairs/${pairId}/after - Backend error: ${response.status}`,
        errorText
      );
      return NextResponse.json(
        { error: errorText || "Backend replacement failed" },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log(
      `✅ PUT /api/v1/upload/pairs/${pairId}/after - Фото замінено через backend`
    );

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      `❌ PUT /api/v1/upload/pairs/${pairId}/after - Помилка:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to replace photo in backend" },
      { status: 500 }
    );
  }
}

