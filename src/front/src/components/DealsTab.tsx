import { Calendar, Clock, MapPin, MessageSquare, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

type DealType = 'rent';
type DealStatus = 'active' | 'completed';

interface Deal {
  id: number;
  item: string;
  renter: string;
  startDate: string;
  endDate: string;
  status: DealStatus;
  price: number;
  deposit: number;
  location?: string;
  type: DealType;
}

const activeDeals: Deal[] = [
  {
    id: 1,
    item: 'MOCK',
    renter: 'MOCKED',
    startDate: '2345',
    endDate: '2345',
    status: 'active',
    price: 1234,
    deposit: 1234,
    location: 'asdf',
    type: 'rent',
  },
  {
    id: 2,
    item: 'MOCK',
    renter: 'mocked',
    startDate: '17534',
    endDate: '19345',
    status: 'active',
    price: 5345,
    deposit: 5345,
    location: 'asdf',
    type: 'rent',
  },
];

const completedDeals: Deal[] = [
  {
    id: 3,
    item: 'MOCK',
    renter: 'mocked',
    startDate: '10312',
    endDate: '12312',
    status: 'completed',
    price: 345,
    deposit: 543543,
    type: 'rent',
  },
];

export function DealsTab() {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm font-medium">
        <h1>Сделки</h1>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="flex-1 flex flex-col overflow-hidden ">
        <TabsList className="w-full rounded-none border-b bg-white shrink-0 px-4 gap-2 py-1">
          <TabsTrigger 
            value="active" 
            className="flex-1 space-y-1 transition-all duration-300 text-white 
            data-[state=active]:bg-black 
            data-[state=active]:text-white 
            data-[state=active]:font-medium 
            data-[state=inactive]:bg-transparent 
            data-[state=inactive]:text-black 
            data-[state=inactive]:hover:bg-gray-50"
          >
            Активные
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="flex-1 space-y-1 transition-all duration-300 text-white 
            data-[state=active]:bg-black 
            data-[state=active]:text-white 
            data-[state=active]:font-medium 
            data-[state=inactive]:bg-transparent 
            data-[state=inactive]:text-black 
            data-[state=inactive]:hover:bg-gray-50"
          >
            Завершенные
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="flex-1 overflow-y-auto p-4 mt-0 h-0">
          <div className="space-y-3 pb-4">
            {activeDeals.map((deal) => (
              <Card key={deal.id} className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2">{deal.item}</CardTitle>
                      <Badge variant={deal.type === 'rent' ? 'default' : 'secondary'} className="rounded-full">
                        {deal.type === 'rent' ? 'Сдаю' : 'Арендую'}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Активна
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                      <User size={24} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p>{deal.renter}</p>
                      <p className="text-sm text-gray-500">
                        {deal.type === 'rent' ? 'Арендатор' : 'Владелец'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-3 border-t border-b">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      <div>
                        <p className="text-sm text-gray-500">Начало</p>
                        <p>{deal.startDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={16} />
                      <div>
                        <p className="text-sm text-gray-500">Конец</p>
                        <p>{deal.endDate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} />
                    <span>{deal.location}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span>Сумма:</span>
                      <span className="text-blue-600">{deal.price} ₽</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span>Залог:</span>
                      <span className="text-gray-600">{deal.deposit} ₽</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" size="sm">
                      <MessageSquare size={16} className="mr-2" />
                      Написать
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="flex-1 overflow-y-auto p-4 mt-0 h-0">
          <div className="space-y-3 pb-4">
            {completedDeals.map((deal) => (
              <Card key={deal.id} className="border-0 shadow-sm opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2">{deal.item}</CardTitle>
                      <Badge variant={deal.type === 'rent' ? 'default' : 'secondary'} className="rounded-full">
                        {deal.type === 'rent' ? 'Сдавал' : 'Арендовал'}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                      Завершена
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                      <User size={24} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p>{deal.renter}</p>
                      <p className="text-sm text-gray-500">
                        {deal.type === 'rent' ? 'Арендатор' : 'Владелец'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span>Сумма:</span>
                      <span className="text-blue-600">{deal.price} ₽</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span>Залог:</span>
                      <span className="text-gray-600">{deal.deposit} ₽</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
