import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_URL } from "@/lib/config";

export function middleware(request: NextRequest) {
  // Обробка CORS для всіх API роутів
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const response = NextResponse.next();

    // Додаємо CORS заголовки
    response.headers.set(
      "Access-Control-Allow-Origin",
      "orthospaceabackendtwo-production.up.railway.app"
    );
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    // Обробка preflight запитів
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
