// Центральне місце для перемикання базового домену бекенду
// Локальна розробка (закоментовано):
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "orthospaceabackendtwo-production.up.railway.app";

// Поточний прод (активний):
// export const BACKEND_URL =
//   "https://rekogrinikfrontbeck-production-a699.up.railway.app";
