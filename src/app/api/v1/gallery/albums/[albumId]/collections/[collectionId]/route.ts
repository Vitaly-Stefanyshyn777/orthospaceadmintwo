import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/config";

// DELETE - проксувати запит до backend для видалення колекції
export async function DELETE(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ albumId: string; collectionId: string }> }
) {
  const { albumId, collectionId } = await params;
  const { searchParams } = new URL(request.url);
  const deletePhotos = searchParams.get("deletePhotos") === "true";

  console.log(
    `🗑️ DELETE /api/v1/gallery/albums/${albumId}/collections/${collectionId} - Проксування до backend (deletePhotos: ${deletePhotos})`
  );

  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Формуємо URL для backend
    const queryString = deletePhotos ? "?deletePhotos=true" : "";
    const backendUrl = `${BACKEND_URL}/api/v1/gallery/albums/${albumId}/collections/${collectionId}${queryString}`;

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
        `❌ DELETE /api/v1/gallery/albums/${albumId}/collections/${collectionId} - Backend error: ${response.status}`,
        errorText
      );
      return NextResponse.json(
        { error: errorText || "Backend deletion failed" },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log(
      `✅ DELETE /api/v1/gallery/albums/${albumId}/collections/${collectionId} - Колекція видалена через backend`
    );

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      `❌ DELETE /api/v1/gallery/albums/${albumId}/collections/${collectionId} - Помилка:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to delete collection from backend" },
      { status: 500 }
    );
  }
}

