import { NextResponse } from "next/server";
import { getAllPhotos } from "@/lib/photoStorage";

// GET - отримати всі альбоми
export async function GET() {
  console.log("🌐 GET /api/v1/public/gallery/albums - Отримання всіх альбомів");

  try {
    const photos = getAllPhotos();

    // Групуємо фото по альбомах
    const albumsMap = new Map();

    photos.forEach((photo) => {
      const albumId = photo.albumId;
      if (!albumsMap.has(albumId)) {
        albumsMap.set(albumId, {
          id: albumId,
          name:
            albumId === 1
              ? "Звичайна галерея"
              : albumId === 2
              ? "До і Після"
              : `Альбом ${albumId}`,
          slug:
            albumId === 1
              ? "general"
              : albumId === 2
              ? "before-after"
              : `album-${albumId}`,
          type: albumId === 2 ? "BEFORE_AFTER" : "GENERAL",
          photoCount: 0,
          createdAt: photo.createdAt,
        });
      }

      albumsMap.get(albumId).photoCount++;
    });

    const albums = Array.from(albumsMap.values());

    console.log(
      `✅ GET /api/v1/public/gallery/albums - Знайдено ${albums.length} альбомів`
    );

    return NextResponse.json({
      albums,
      total: albums.length,
    });
  } catch (error) {
    console.error("❌ GET /api/v1/public/gallery/albums - Помилка:", error);
    return NextResponse.json(
      { error: "Failed to fetch albums" },
      { status: 500 }
    );
  }
}
