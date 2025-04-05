
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { CalendarDays, Users, BarChart3, BookOpen, Menu, X } from "lucide-react";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navigation = [
    { name: "Главная", href: "/", icon: CalendarDays },
    { name: "База клиентов", href: "/clients", icon: Users },
    { name: "Аналитика", href: "/analytics", icon: BarChart3 },
    { name: "Категории раскладов", href: "/categories", icon: BookOpen },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar for larger screens */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-secondary">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-semibold text-primary">Мой Таро-Кабинет</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2 rounded-md ${
                location.pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-primary/10"
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile sidebar */}
      <div className="md:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 p-2 rounded-md bg-primary text-primary-foreground"
        >
          <Menu size={20} />
        </button>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div 
              className="fixed inset-0 bg-black/50" 
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative flex flex-col w-64 max-w-xs bg-secondary">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h1 className="text-xl font-semibold text-primary">Мой Таро-Кабинет</h1>
                <button onClick={() => setSidebarOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md ${
                      location.pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-primary/10"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;
