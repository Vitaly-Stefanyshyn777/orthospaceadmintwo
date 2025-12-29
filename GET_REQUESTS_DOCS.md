# 📸 **GET ЗАПИТИ ДЛЯ ГАЛЕРЕЇ**

## 🌐 **ПУБЛІЧНІ ЗАПИТИ (без авторизації):**

### **1. Отримати всі альбоми:**

```javascript
GET http://localhost:3003/api/v1/public/gallery/albums
```

### **2. Звичайна галерея:**

```javascript
// Отримати звичайну галерею
GET http://localhost:3003/api/v1/public/gallery/albums/general

// Отримати тільки звичайні фото
GET http://localhost:3003/api/v1/public/gallery/albums/general?tag=general
```

### **3. Галерея "До і Після":**

```javascript
// Отримати альбом "До і Після"
GET http://localhost:3003/api/v1/public/gallery/albums/before-after

// Отримати тільки фото "До"
GET http://localhost:3003/api/v1/public/gallery/albums/before-after?tag=before

// Отримати тільки фото "Після"
GET http://localhost:3003/api/v1/public/gallery/albums/before-after?tag=after
```

## 🔐 **АДМІНСЬКІ ЗАПИТИ (з авторизацією):**

### **1. Отримати всі альбоми:**

```javascript
GET http://localhost:3003/api/v1/gallery/albums
```

### **2. Звичайна галерея (альбом ID 1):**

```javascript
// Отримати всі фото звичайної галереї
GET http://localhost:3003/api/v1/gallery/albums/1/photos

// Отримати тільки звичайні фото
GET http://localhost:3003/api/v1/gallery/albums/1/photos?tag=general
```

### **3. Галерея "До і Після" (альбом ID 2):**

```javascript
// Отримати всі фото альбому
GET http://localhost:3003/api/v1/gallery/albums/2/photos

// Отримати тільки фото "До"
GET http://localhost:3003/api/v1/gallery/albums/2/photos?tag=before

// Отримати тільки фото "Після"
GET http://localhost:3003/api/v1/gallery/albums/2/photos?tag=after

// Отримати пари "До і Після"
GET http://localhost:3003/api/v1/gallery/albums/2/pairs
```

## 📝 **JavaScript приклади:**

### **Публічні запити:**

```javascript
// Звичайна галерея
const getGeneralGallery = async () => {
  const response = await fetch(
    "http://localhost:3003/api/v1/public/gallery/albums/general?tag=general"
  );
  const data = await response.json();
  return data.photos;
};

// Галерея "До і Після"
const getBeforeAfterGallery = async () => {
  const response = await fetch(
    "http://localhost:3003/api/v1/public/gallery/albums/before-after"
  );
  const data = await response.json();

  return {
    beforePhotos: data.photos.filter((p) => p.tag === "before"),
    afterPhotos: data.photos.filter((p) => p.tag === "after"),
    pairs: data.pairs,
    collections: data.collections,
  };
};

// Всі альбоми
const getAllAlbums = async () => {
  const response = await fetch(
    "http://localhost:3003/api/v1/public/gallery/albums"
  );
  const data = await response.json();
  return data.albums;
};
```

### **Адмінські запити:**

```javascript
// Звичайна галерея (адмін)
const getAdminGeneralGallery = async () => {
  const token = localStorage.getItem("authToken");
  const response = await fetch(
    "http://localhost:3003/api/v1/gallery/albums/1/photos?tag=general",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.json();
};

// Галерея "До і Після" (адмін)
const getAdminBeforeAfterGallery = async () => {
  const token = localStorage.getItem("authToken");
  const response = await fetch(
    "http://localhost:3003/api/v1/gallery/albums/2/photos",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await response.json();

  return {
    beforePhotos: data.photos.filter((p) => p.tag === "before"),
    afterPhotos: data.photos.filter((p) => p.tag === "after"),
  };
};

// Пари "До і Після" (адмін)
const getAdminPairs = async () => {
  const token = localStorage.getItem("authToken");
  const response = await fetch(
    "http://localhost:3003/api/v1/gallery/albums/2/pairs",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.json();
};
```

## 🎯 **Структура відповіді:**

### **Альбоми:**

```json
{
  "albums": [
    {
      "id": 1,
      "name": "Звичайна галерея",
      "slug": "general",
      "type": "GENERAL",
      "photoCount": 5
    },
    {
      "id": 2,
      "name": "До і Після",
      "slug": "before-after",
      "type": "BEFORE_AFTER",
      "photoCount": 8
    }
  ],
  "total": 2
}
```

### **Фото альбому:**

```json
{
  "photos": [
    {
      "id": 1,
      "albumId": 2,
      "url": "data:image/jpeg;base64,/9j/4AAQ...",
      "title": "До 1",
      "description": "Фото до процедури",
      "tag": "before",
      "fileName": "before1.jpg",
      "fileSize": 1536,
      "mimeType": "image/jpeg",
      "createdAt": "2025-10-19T18:10:30.868Z",
      "updatedAt": "2025-10-19T18:10:30.868Z"
    }
  ],
  "total": 1,
  "albumId": 2,
  "tag": "all"
}
```

### **Пари "До і Після":**

```json
{
  "pairs": [
    {
      "id": 1,
      "beforePhoto": {
        "id": 1,
        "url": "data:image/jpeg;base64,/9j/4AAQ...",
        "title": "До 1",
        "tag": "before"
      },
      "afterPhoto": {
        "id": 2,
        "url": "data:image/jpeg;base64,/9j/4AAQ...",
        "title": "Після 1",
        "tag": "after"
      },
      "collectionId": 1
    }
  ],
  "collections": [
    {
      "id": 1,
      "pairs": [...],
      "count": 3
    }
  ],
  "total": 1,
  "albumId": 2
}
```

## 🧪 **Тестування запитів:**

### **Публічні запити:**

```bash
# Всі альбоми
curl -X GET "http://localhost:3003/api/v1/public/gallery/albums"

# Звичайна галерея
curl -X GET "http://localhost:3003/api/v1/public/gallery/albums/general"

# Галерея "До і Після"
curl -X GET "http://localhost:3003/api/v1/public/gallery/albums/before-after"

# Фото "До"
curl -X GET "http://localhost:3003/api/v1/public/gallery/albums/before-after?tag=before"

# Фото "Після"
curl -X GET "http://localhost:3003/api/v1/public/gallery/albums/before-after?tag=after"
```

### **Адмінські запити:**

```bash
# Всі альбоми
curl -X GET "http://localhost:3003/api/v1/gallery/albums" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Фото альбому 1
curl -X GET "http://localhost:3003/api/v1/gallery/albums/1/photos?tag=general" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Фото альбому 2
curl -X GET "http://localhost:3003/api/v1/gallery/albums/2/photos" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Пари "До і Після"
curl -X GET "http://localhost:3003/api/v1/gallery/albums/2/pairs" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📱 **React компонент приклад:**

```jsx
const GalleryComponent = () => {
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [pairs, setPairs] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Завантажуємо альбоми
        const albumsResponse = await fetch(
          "http://localhost:3003/api/v1/public/gallery/albums"
        );
        const albumsData = await albumsResponse.json();
        setAlbums(albumsData.albums);

        // Завантажуємо фото "До і Після"
        const photosResponse = await fetch(
          "http://localhost:3003/api/v1/public/gallery/albums/before-after"
        );
        const photosData = await photosResponse.json();
        setPhotos(photosData.photos);
        setPairs(photosData.pairs);
      } catch (error) {
        console.error("Помилка завантаження даних:", error);
      }
    };

    loadData();
  }, []);

  return (
    <div>
      <h2>Альбоми</h2>
      {albums.map((album) => (
        <div key={album.id}>
          <h3>{album.name}</h3>
          <p>Фото: {album.photoCount}</p>
        </div>
      ))}

      <h2>Фото "До і Після"</h2>
      {photos.map((photo) => (
        <div key={photo.id}>
          <img src={photo.url} alt={photo.title} />
          <p>
            {photo.title} ({photo.tag})
          </p>
        </div>
      ))}

      <h2>Пари</h2>
      {pairs.map((pair) => (
        <div key={pair.id}>
          <img src={pair.beforePhoto.url} alt="До" />
          <img src={pair.afterPhoto.url} alt="Після" />
        </div>
      ))}
    </div>
  );
};
```

## 🔑 **Авторизація:**

Для адмінських запитів потрібен Bearer token:

```javascript
const headers = {
  Authorization: "Bearer YOUR_JWT_TOKEN_HERE",
  "Content-Type": "application/json",
};
```

## 📊 **Статистика:**

- **Альбом 1 (Звичайна галерея):** `type: "GENERAL"`
- **Альбом 2 (До і Після):** `type: "BEFORE_AFTER"`
- **Теги:** `"general"`, `"before"`, `"after"`
- **Фільтрація:** По `albumId` та `tag`

**Всі GET запити готові для отримання даних галереї!** 🚀

