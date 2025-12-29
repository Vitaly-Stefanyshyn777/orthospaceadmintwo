// Глобальний масив для зберігання завантажених фото
interface Photo {
  id: number;
  albumId: number;
  url: string;
  title: string;
  description: string;
  tag: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
}

// Використовуємо глобальну змінну для зберігання
declare global {
  var __photos: Photo[] | undefined;
}

// Ініціалізуємо глобальний масив
if (!global.__photos) {
  global.__photos = [];
}

const uploadedPhotos: Photo[] = global.__photos;

// Функція для додавання фото
export function addPhoto(photo: Photo) {
  uploadedPhotos.push(photo);
  console.log(`📸 Додано нове фото: ${photo.fileName} (ID: ${photo.id})`);
}

// Функція для отримання всіх фото
export function getAllPhotos(): Photo[] {
  return uploadedPhotos;
}

// Функція для видалення фото за ID
export function deletePhotoById(photoId: number): Photo | null {
  const photoIndex = uploadedPhotos.findIndex((photo) => photo.id === photoId);

  if (photoIndex === -1) {
    return null;
  }

  const deletedPhoto = uploadedPhotos.splice(photoIndex, 1)[0];
  console.log(`🗑️ Видалено фото з ID: ${photoId}`);
  return deletedPhoto;
}

// Функція для видалення фото за ID (повертає boolean)
export function removePhotoById(photoId: number): boolean {
  const photoIndex = uploadedPhotos.findIndex((photo) => photo.id === photoId);

  if (photoIndex === -1) {
    return false;
  }

  uploadedPhotos.splice(photoIndex, 1);
  console.log(`🗑️ Видалено фото з ID: ${photoId}`);
  return true;
}

// Функція для оновлення фото за ID
export function updatePhotoById(
  photoId: number,
  updates: Partial<Photo>
): Photo | null {
  const photoIndex = uploadedPhotos.findIndex((photo) => photo.id === photoId);

  if (photoIndex === -1) {
    return null;
  }

  uploadedPhotos[photoIndex] = {
    ...uploadedPhotos[photoIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return uploadedPhotos[photoIndex];
}
