import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/config";

// GET - отримати всі альбоми (адмін) - проксуємо до backend
export async function GET(request: NextRequest) {
  console.log(
    "🔐 GET /api/v1/gallery/albums - Отримання всіх альбомів (адмін)"
  );

  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      console.log("❌ GET /api/v1/gallery/albums - No authorization header");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Проксуємо запит до справжнього backend
    const backendUrl = `${BACKEND_URL}/api/v1/gallery/albums`;
    console.log("Проксування до:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
    });

    const data = await response.json();

    console.log(
      `✅ GET /api/v1/gallery/albums - Отримано відповідь від backend, статус: ${response.status}`
    );

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Access-Control-Allow-Origin": request.headers.get("origin") || "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    console.error("❌ GET /api/v1/gallery/albums - Помилка проксі:", error);
    return NextResponse.json(
      { error: "Backend connection failed" },
      { status: 500 }
    );
  }
}

