import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/config";

// GET - проксувати запит до backend для отримання альбому "До і Після"
export async function GET(request: NextRequest) {
  console.log(
    "🌐 GET /api/v1/public/gallery/albums/before-after - Проксування до backend"
  );

  try {
    const { searchParams } = new URL(request.url);
    const backendUrl = `${BACKEND_URL}/api/v1/public/gallery/albums/before-after${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();

    console.log(
      `✅ GET /api/v1/public/gallery/albums/before-after - Отримано дані з backend`
    );

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      "❌ GET /api/v1/public/gallery/albums/before-after - Помилка:",
      error
    );
    return NextResponse.json(
      { error: "Failed to fetch album from backend" },
      { status: 500 }
    );
  }
}

