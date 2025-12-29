import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/config";

// Проксі до backend сервера
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Перенаправляємо запит до backend сервера
    const backendUrl = `${BACKEND_URL}/api/v1/auth/login`;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Access-Control-Allow-Origin": BACKEND_URL,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    console.error("Помилка проксі:", error);
    return NextResponse.json(
      { error: "Backend connection failed" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": BACKEND_URL,
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  }
}
