import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/config";

// GET - проксувати запит до backend для отримання всіх фото
export async function GET(request: NextRequest) {
  console.log("🔍 GET /api/v1/photos - Проксування до backend");

  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const backendUrl = `${BACKEND_URL}/api/v1/photos`;

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ GET /api/v1/photos - Backend error: ${response.status}`,
        errorText
      );
      return NextResponse.json(
        { error: errorText || "Backend fetch failed" },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log(`✅ GET /api/v1/photos - Отримано дані з backend`);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("❌ GET /api/v1/photos - Помилка:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos from backend" },
      { status: 500 }
    );
  }
}

// DELETE - проксувати запит до backend для видалення фото
export async function DELETE(request: NextRequest) {
  console.log("🗑️ DELETE /api/v1/photos - Проксування до backend");

  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get("id");

    if (!photoId) {
      return NextResponse.json(
        { error: "Photo ID is required" },
        { status: 400 }
      );
    }

    const backendUrl = `${BACKEND_URL}/api/v1/photos?id=${photoId}`;

    const response = await fetch(backendUrl, {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ DELETE /api/v1/photos - Backend error: ${response.status}`,
        errorText
      );
      return NextResponse.json(
        { error: errorText || "Backend deletion failed" },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log(`✅ DELETE /api/v1/photos - Фото ${photoId} видалено через backend`);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("❌ DELETE /api/v1/photos - Помилка:", error);
    return NextResponse.json(
      { error: "Failed to delete photo from backend" },
      { status: 500 }
    );
  }
}
