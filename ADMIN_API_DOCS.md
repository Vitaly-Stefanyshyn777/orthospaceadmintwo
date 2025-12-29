# 🔐 **АДМІНСЬКІ API ЕНДПОЇНТИ**

## 📸 **GET ЕНДПОЇНТИ ДЛЯ ОТРИМАННЯ ФОТО "ДО І ПІСЛЯ":**

### **🔐 Адмінські ендпоїнти (з авторизацією):**

#### **1. Отримати всі альбоми:**

```javascript
GET http://localhost:3003/api/v1/gallery/albums
```

#### **2. Отримати фото альбому:**

```javascript
// Всі фото альбому
GET http://localhost:3003/api/v1/gallery/albums/2/photos

// Тільки фото "До"
GET http://localhost:3003/api/v1/gallery/albums/2/photos?tag=before

// Тільки фото "Після"
GET http://localhost:3003/api/v1/gallery/albums/2/photos?tag=after

// Тільки звичайні фото
GET http://localhost:3003/api/v1/gallery/albums/1/photos?tag=general
```

#### **3. Отримати пари "До і Після":**

```javascript
GET http://localhost:3003/api/v1/gallery/albums/2/pairs
```

### **📝 Приклади використання:**

#### **Для адмін панелі:**

```javascript
// Отримати фото "До і Після" (альбом ID 2)
const getAdminBeforeAfterPhotos = async () => {
  const response = await fetch(
    "http://localhost:3003/api/v1/gallery/albums/2/photos",
    {
      headers: {
        Authorization: "Bearer YOUR_TOKEN_HERE",
      },
    }
  );
  return response.json();
};

// Отримати звичайні фото (альбом ID 1)
const getAdminGeneralPhotos = async () => {
  const response = await fetch(
    "http://localhost:3003/api/v1/gallery/albums/1/photos?tag=general",
    {
      headers: {
        Authorization: "Bearer YOUR_TOKEN_HERE",
      },
    }
  );
  return response.json();
};

// Отримати пари "До і Після"
const getAdminPairs = async () => {
  const response = await fetch(
    "http://localhost:3003/api/v1/gallery/albums/2/pairs",
    {
      headers: {
        Authorization: "Bearer YOUR_TOKEN_HERE",
      },
    }
  );
  return response.json();
};
```

### **🎯 Структура відповіді:**

#### **Альбоми:**

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

#### **Фото альбому:**

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

#### **Пари "До і Після":**

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

### **📱 React компонент приклад для адмін панелі:**

```jsx
const AdminBeforeAfterGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("authToken");

        // Завантажуємо фото
        const photosResponse = await fetch(
          "http://localhost:3003/api/v1/gallery/albums/2/photos",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const photosData = await photosResponse.json();
        setPhotos(photosData.photos);

        // Завантажуємо пари
        const pairsResponse = await fetch(
          "http://localhost:3003/api/v1/gallery/albums/2/pairs",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const pairsData = await pairsResponse.json();
        setPairs(pairsData.pairs);
      } catch (error) {
        console.error("Помилка завантаження даних:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div>Завантаження...</div>;
  }

  return (
    <div>
      <h3>Фото "До"</h3>
      {photos
        .filter((p) => p.tag === "before")
        .map((photo) => (
          <div key={photo.id}>
            <img src={photo.url} alt={photo.title} />
            <p>{photo.title}</p>
          </div>
        ))}

      <h3>Фото "Після"</h3>
      {photos
        .filter((p) => p.tag === "after")
        .map((photo) => (
          <div key={photo.id}>
            <img src={photo.url} alt={photo.title} />
            <p>{photo.title}</p>
          </div>
        ))}

      <h3>Пари</h3>
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

### **🔑 Авторизація:**

Всі адмінські ендпоїнти вимагають авторизації через Bearer token:

```javascript
const headers = {
  Authorization: "Bearer YOUR_JWT_TOKEN_HERE",
  "Content-Type": "application/json",
};
```

### **📊 Статистика:**

- **Альбом 1 (Звичайна галерея):** `type: "GENERAL"`
- **Альбом 2 (До і Після):** `type: "BEFORE_AFTER"`
- **Теги:** `"general"`, `"before"`, `"after"`
- **Фільтрація:** По `albumId` та `tag`

**Всі адмінські ендпоїнти готові для отримання фото "До і Після"!** 🚀

