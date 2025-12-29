# 📸 **ПУБЛІЧНІ API ENDPOINTS ДЛЯ ГАЛЕРЕЇ**

## 🌐 **Публічні ендпоінти (без авторизації):**

### **1. Отримати всі альбоми:**

```javascript
GET http://localhost:3003/api/v1/public/gallery/albums
```

**Відповідь:**

```json
{
  "albums": [
    {
      "id": 1,
      "name": "Звичайна галерея",
      "slug": "general",
      "type": "GENERAL",
      "photoCount": 2,
      "createdAt": "2025-10-19T17:09:40.984Z"
    },
    {
      "id": 2,
      "name": "До і Після",
      "slug": "before-after",
      "type": "BEFORE_AFTER",
      "photoCount": 4,
      "createdAt": "2025-10-19T17:09:40.984Z"
    }
  ],
  "total": 2
}
```

### **2. Отримати альбом за slug:**

```javascript
GET http://localhost:3003/api/v1/public/gallery/albums/:slug
```

### **3. Отримати фото альбому з фільтрацією:**

```javascript
GET http://localhost:3003/api/v1/public/gallery/albums/:slug?tag=before
GET http://localhost:3003/api/v1/public/gallery/albums/:slug?tag=after
GET http://localhost:3003/api/v1/public/gallery/albums/:slug?tag=general
```

## 📝 **Приклади використання:**

### **Отримати всі альбоми:**

```javascript
const getAlbums = async () => {
  const response = await fetch(
    "http://localhost:3003/api/v1/public/gallery/albums"
  );
  const data = await response.json();
  return data.albums;
};
```

### **Отримати звичайні фото:**

```javascript
const getGeneralPhotos = async () => {
  const response = await fetch(
    "http://localhost:3003/api/v1/public/gallery/albums/general?tag=general"
  );
  const data = await response.json();
  return data.photos; // Масив звичайних фото
};
```

### **Отримати фото "До":**

```javascript
const getBeforePhotos = async () => {
  const response = await fetch(
    "http://localhost:3003/api/v1/public/gallery/albums/before-after?tag=before"
  );
  const data = await response.json();
  return data.photos; // Масив фото "До"
};
```

### **Отримати фото "Після":**

```javascript
const getAfterPhotos = async () => {
  const response = await fetch(
    "http://localhost:3003/api/v1/public/gallery/albums/before-after?tag=after"
  );
  const data = await response.json();
  return data.photos; // Масив фото "Після"
};
```

### **Отримати всі фото альбому:**

```javascript
const getAllPhotos = async (albumSlug) => {
  const response = await fetch(
    `http://localhost:3003/api/v1/public/gallery/albums/${albumSlug}`
  );
  const data = await response.json();
  return {
    album: data.album,
    photos: data.photos, // Всі фото
    pairs: data.pairs, // Пари "До і Після"
    collections: data.collections, // Колекції пар
  };
};
```

## 🎯 **Структура відповіді:**

### **Альбом з фільтрацією:**

```json
{
  "album": {
    "id": 2,
    "name": "До і Після",
    "slug": "before-after",
    "type": "BEFORE_AFTER",
    "photoCount": 4
  },
  "photos": [
    {
      "id": 3,
      "albumId": 2,
      "url": "data:image/jpeg;base64,/9j/4AAQ...",
      "title": "До 1",
      "description": "Фото до процедури",
      "tag": "before",
      "fileName": "before1.jpg",
      "fileSize": 1536,
      "mimeType": "image/jpeg",
      "createdAt": "2025-10-19T17:09:40.984Z",
      "updatedAt": "2025-10-19T17:09:40.984Z"
    }
  ],
  "pairs": [
    {
      "id": 1,
      "beforePhoto": { "id": 3, "url": "...", "title": "До 1" },
      "afterPhoto": { "id": 4, "url": "...", "title": "Після 1" },
      "collectionId": 1
    }
  ],
  "collections": [
    {
      "id": 1,
      "pairs": [...],
      "count": 2
    }
  ]
}
```

## 🔄 **Повний приклад використання:**

```javascript
// Отримати всі типи фото з одного альбому
const getGalleryData = async (albumSlug) => {
  try {
    // Всі фото
    const allPhotos = await fetch(
      `http://localhost:3003/api/v1/public/gallery/albums/${albumSlug}`
    );
    const allData = await allPhotos.json();

    // Тільки звичайні
    const generalPhotos = allData.photos.filter(
      (photo) => photo.tag === "general"
    );

    // Тільки "До"
    const beforePhotos = allData.photos.filter(
      (photo) => photo.tag === "before"
    );

    // Тільки "Після"
    const afterPhotos = allData.photos.filter((photo) => photo.tag === "after");

    return {
      album: allData.album,
      generalPhotos,
      beforePhotos,
      afterPhotos,
      pairs: allData.pairs,
      collections: allData.collections,
    };
  } catch (error) {
    console.error("Помилка отримання галереї:", error);
  }
};

// Використання
const galleryData = await getGalleryData("before-after");
console.log("Звичайні фото:", galleryData.generalPhotos);
console.log('Фото "До":', galleryData.beforePhotos);
console.log('Фото "Після":', galleryData.afterPhotos);
console.log("Колекції:", galleryData.collections);
```

## 📱 **React компонент приклад:**

```jsx
const GalleryComponent = ({ albumSlug }) => {
  const [photos, setPhotos] = useState({
    general: [],
    before: [],
    after: [],
  });

  useEffect(() => {
    const loadPhotos = async () => {
      const response = await fetch(
        `http://localhost:3003/api/v1/public/gallery/albums/${albumSlug}`
      );
      const data = await response.json();

      setPhotos({
        general: data.photos.filter((p) => p.tag === "general"),
        before: data.photos.filter((p) => p.tag === "before"),
        after: data.photos.filter((p) => p.tag === "after"),
      });
    };

    loadPhotos();
  }, [albumSlug]);

  return (
    <div>
      <h3>Звичайні фото</h3>
      {photos.general.map((photo) => (
        <img key={photo.id} src={photo.url} alt={photo.title} />
      ))}

      <h3>До</h3>
      {photos.before.map((photo) => (
        <img key={photo.id} src={photo.url} alt={photo.title} />
      ))}

      <h3>Після</h3>
      {photos.after.map((photo) => (
        <img key={photo.id} src={photo.url} alt={photo.title} />
      ))}
    </div>
  );
};
```

## ✅ **Перевірка роботи:**

### **Тестові дані:**

- **Звичайна галерея** (albumId: 1): 2 фото з тегом "general"
- **До і Після** (albumId: 2): 4 фото (2 "before" + 2 "after")

### **Результати тестування:**

- ✅ **GET /api/v1/public/gallery/albums** - працює
- ✅ **GET /api/v1/public/gallery/albums/general** - працює
- ✅ **GET /api/v1/public/gallery/albums/before-after** - працює
- ✅ **Фільтрація по тегах** - працює
- ✅ **Пари та колекції** - працює

**Всі ендпоінти працюють без авторизації для публічного доступу!** 🚀

