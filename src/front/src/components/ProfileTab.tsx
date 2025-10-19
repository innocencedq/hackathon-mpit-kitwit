import {
  User,
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
// import { Badge } from './ui/badge';
import { useUser } from '../hooks/useUser';

// interface MenuItem {
//   icon: LucideIcon;
//   label: string;
//   count?: number;
// }

// const menuItems: MenuItem[] = [
//   { icon: Package, label: 'Мои объявления', count: 4 },
// ];

export function ProfileTab() {
  const { user, isLoading: userLoading } = useUser();

  if (userLoading) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-white p-4 shadow-sm font-medium">
          <h1>Профиль</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 pb-4">
          <Card className="border-0 shadow-sm mb-4">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full">
                    <User size={36} className="text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="h-4 bg-gray-200 rounded mb-1 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="text-center border-l border-r">
                  <div className="h-4 bg-gray-200 rounded mb-1 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="text-center">
                  <div className="h-4 bg-gray-200 rounded mb-1 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white p-4 shadow-sm font-medium">
        <h1>Профиль</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4 pb-4">
        <Card className="border-0 shadow-sm mb-4">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full">
                  <User size={36} className="text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="mb-1">
                  {user?.name || 'Пользователь'}
                </h2>
                <p className="text-sm text-gray-500">
                  @{user?.username || `ID: ${user?.id || 'Неизвестно'}`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-1">Объявлений</p>
                <p>0</p>
              </div>
              <div className="text-center border-l border-r">
                <p className="text-gray-500 text-sm mb-1">Сделок</p>
                <p>0</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-1">Заработано</p>
                <p>{user?.balance || 0} ₽</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* <Card className="border-0 shadow-sm mb-4">
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <button
                key={item.label}
                className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                  index !== menuItems.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className="text-gray-600" />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.count && (
                    <Badge variant="secondary" className="rounded-full">
                      {item.count}
                    </Badge>
                  )}
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </button>
            ))}
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}