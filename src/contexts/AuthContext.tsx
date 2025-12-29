"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Отримуємо токен з localStorage
      const token = localStorage.getItem("authToken");

      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Перевіряємо авторизацію безпечним GET-запитом до локального API роуту
      const response = await fetch("/api/v1/gallery/albums", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (response.ok) {
        // Якщо токен валідний, встановлюємо користувача
        setUser({
          id: "1",
          name: "Admin",
          email: "admin@example.com",
        });
      } else {
        setUser(null);
        localStorage.removeItem("authToken");
      }
    } catch (error) {
      console.error("Помилка перевірки авторизації:", error);
      setUser(null);
      localStorage.removeItem("authToken");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Спроба логіну з:", email);

      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("Відповідь логіну:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Отримані дані:", data);
        console.log("Токен:", data.accessToken);

        // Зберігаємо токен в localStorage (старий сервер повертає accessToken)
        localStorage.setItem("authToken", data.accessToken);
        setUser(data.user);
        return true;
      } else {
        const errorText = await response.text();
        console.error("Помилка логіну:", response.status, errorText);
        return false;
      }
    } catch (error) {
      console.error("Помилка логіну:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Видаляємо токен з localStorage
      localStorage.removeItem("authToken");
      setUser(null);
    } catch (error) {
      console.error("Помилка логауту:", error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
