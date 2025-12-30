import Link from "next/link";

export default function AdminPage() {
  const features = [
    {
      name: "Звичайна галерея",
      href: "/admin/gallery",
      description: "Завантаження фото в звичайну галерею",
      icon: "🖼️",
      color: "green",
    },
    {
      name: "Наші Послуги",
      href: "/admin/services",
      description: "Управління категоріями та послугами клініки",
      icon: "🦷",
      color: "purple",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Адмін панель
          </h1>
          <p className="text-xl text-gray-600">
            Оберіть тип галереї для завантаження фото
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature) => (
            <Link
              key={feature.name}
              href={feature.href}
              className="group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-8"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.name}
                </h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <div
                  className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                    feature.color === "blue"
                      ? "bg-blue-100 text-blue-800 group-hover:bg-blue-200"
                      : feature.color === "green"
                      ? "bg-green-100 text-green-800 group-hover:bg-green-200"
                      : "bg-purple-100 text-purple-800 group-hover:bg-purple-200"
                  }`}
                >
                  Перейти до {feature.name}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Інструкції по використанню
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-green-900 mb-2">
                🖼️ Звичайна галерея
              </h3>
              <ul className="text-green-800 space-y-1">
                <li>• Завантажуйте будь-яку кількість фото</li>
                <li>• Фото зберігаються в звичайний альбом</li>
                <li>• Використовуйте ID звичайного альбому</li>
                <li>
                  • Мітка автоматично встановлюється як &quot;general&quot;
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-purple-900 mb-2">
                🦷 Наші Послуги
              </h3>
              <ul className="text-purple-800 space-y-1">
                <li>• Створюйте та редагуйте категорії послуг</li>
                <li>• Додавайте окремі послуги з цінами</li>
                <li>• Послуги можна активувати/деактивувати</li>
                <li>• Послуги будуть активними за замовчуванням</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
