import { NextRequest, NextResponse } from "next/server";
import { getAllPhotos } from "@/lib/photoStorage";

// GET - отримати альбом за slug з фільтрацією
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get("tag");

  console.log(
    `🌐 GET /api/v1/public/gallery/albums/${slug} - Отримання альбому з фільтром: ${
      tag || "всі"
    }`
  );

  try {
    const photos = getAllPhotos();

    // Визначаємо albumId за slug
    let albumId: number;
    let albumName: string;
    let albumType: string;

    switch (slug) {
      case "general":
        albumId = 1;
        albumName = "Звичайна галерея";
        albumType = "GENERAL";
        break;
      case "before-after":
        albumId = 2;
        albumName = "До і Після";
        albumType = "BEFORE_AFTER";
        break;
      default:
        // Спробуємо витягти ID з slug
        const match = slug.match(/album-(\d+)/);
        if (match) {
          albumId = parseInt(match[1]);
          albumName = `Альбом ${albumId}`;
          albumType = "GENERAL";
        } else {
          return NextResponse.json(
            { error: "Album not found" },
            { status: 404 }
          );
        }
    }

    // Фільтруємо фото по альбому
    let albumPhotos = photos.filter((photo) => photo.albumId === albumId);

    // Додаткова фільтрація по тегу
    if (tag) {
      albumPhotos = albumPhotos.filter((photo) => photo.tag === tag);
    }

    // Створюємо структуру відповіді
    const album = {
      id: albumId,
      name: albumName,
      slug: slug,
      type: albumType,
      photoCount: albumPhotos.length,
    };

    // Якщо це альбом "До і Після", створюємо пари
    const pairs = [];
    let collections = [];

    if (albumType === "BEFORE_AFTER") {
      const beforePhotos = albumPhotos.filter(
        (photo) => photo.tag === "before"
      );
      const afterPhotos = albumPhotos.filter((photo) => photo.tag === "after");

      // Створюємо пари (простий алгоритм - по порядку)
      const minLength = Math.min(beforePhotos.length, afterPhotos.length);
      for (let i = 0; i < minLength; i++) {
        pairs.push({
          id: i + 1,
          beforePhoto: beforePhotos[i],
          afterPhoto: afterPhotos[i],
          collectionId: Math.floor(i / 3) + 1, // Групуємо по 3 пари в колекцію
        });
      }

      // Створюємо колекції
      const collectionsMap = new Map();
      pairs.forEach((pair) => {
        const collectionId = pair.collectionId;
        if (!collectionsMap.has(collectionId)) {
          collectionsMap.set(collectionId, {
            id: collectionId,
            pairs: [],
            count: 0,
          });
        }
        collectionsMap.get(collectionId).pairs.push(pair);
        collectionsMap.get(collectionId).count++;
      });

      collections = Array.from(collectionsMap.values());
    }

    console.log(
      `✅ GET /api/v1/public/gallery/albums/${slug} - Знайдено ${albumPhotos.length} фото`
    );

    return NextResponse.json({
      album,
      photos: albumPhotos,
      pairs: pairs,
      collections: collections,
    });
  } catch (error) {
    console.error(
      `❌ GET /api/v1/public/gallery/albums/${slug} - Помилка:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to fetch album" },
      { status: 500 }
    );
  }
}
