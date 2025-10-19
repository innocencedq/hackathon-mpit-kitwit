import { useState, useEffect } from 'react';
import { ArrowLeft, Package, Edit, Trash2, Phone, Search, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import type { Listing, ListingDetailProps, ListingsTabProps } from '../interface/Listings';
import request from '../utils/api';
import * as chatApi from '../utils/chatApi';

interface ExtendedListingsTabProps extends ListingsTabProps {
  listingsUpdated?: number;
}

export function ListingDetail({
  listing,
  currentUserId,
  onBack,
  onEdit,
  onDelete,
  onContact
}: ListingDetailProps) {
  const isOwner = currentUserId === listing.owner_id;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-4 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-semibold">Детали инструмента</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* pics */}
        <div className="relative aspect-square bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-center h-full">
            <Package size={64} className="text-blue-600" />
          </div>

          {!listing.available && (
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="bg-black text-white border-0">
                Занято
              </Badge>
            </div>
          )}

          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
              {listing.category}
            </Badge>
          </div>
        </div>

        {/* box */}
        <div className="p-4 space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{listing.title}</h1>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-600">
                {listing.price} ₽
              </span>
              <span className="text-gray-500">/ {listing.period}</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Залог</div>
            <div className="text-lg font-semibold">{listing.deposit} ₽</div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Описание</h3>
            <p className="text-gray-700 leading-relaxed">
              {listing.description}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Характеристики</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Минимальный срок</span>
                <span>1 {listing.period}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Статус</span>
                <span>{listing.available ? 'Доступен' : 'Занят'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Категория</span>
                <span>{listing.category}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Владелец</span>
                <span>{listing.owner_name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* buttons */}
      <div className="p-4 border-t bg-white">
        {isOwner ? (
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onEdit(listing)}
            >
              <Edit size={18} className="mr-2" />
              Редактировать
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => onDelete(listing.id)}
            >
              <Trash2 size={18} className="mr-2" />
              Удалить
            </Button>
          </div>
        ) : (
          <Button
            className="w-full"
            size="lg"
            disabled={!listing.available}
            onClick={() => onContact(listing)}
          >
            <Phone size={18} className="mr-2" />
            {listing.available ? 'Связаться с владельцем' : 'Инструмент занят'}
          </Button>
        )}
      </div>
    </div>
  );
}

export function ListingsTab({ 
  currentUserId, 
  currentUserName, 
  onContact, 
  onEditListing, 
  onCreateListing,
  onNavigateToChat,
  listingsUpdated 
}: ExtendedListingsTabProps) {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');

  useEffect(() => {
    loadListings();
  }, [listingsUpdated]);

  const loadListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await request("advert/get/all");
      
      const listingsData = response?.data?.adverts || [];
      
      const safeListings = listingsData.map((listing: any) => ({
        id: listing.id || 0,
        title: listing.title || 'Без названия',
        description: listing.description || '',
        price: listing.price || 0,
        deposit: listing.deposit || 0,
        period: listing.period || 'день',
        category: listing.category || 'Другое',
        available: listing.available ?? true,
        owner_id: listing.owner_id || 0,
        owner_name: listing.owner_name || 'Неизвестный пользователь',
        created_at: listing.created_at,
        updated_at: listing.updated_at
      })) as Listing[];
      
      setListings(safeListings);
    } catch (err) {
      console.error('Error loading listings:', err);
      setError('Ошибка при загрузке объявлений');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleListingClick = (listing: Listing) => {
    setSelectedListing(listing);
    setViewMode('detail');
  };

  const handleBack = () => {
    setViewMode('grid');
    setSelectedListing(null);
  };

  const handleDelete = async (listingId: number) => {
    if (!confirm('Вы уверены, что хотите удалить это объявление?')) {
      return;
    }

    try {
      await request(`advert/delete?id=${listingId}`, 'DELETE');
      setListings(prevListings => prevListings.filter(listing => listing.id !== listingId));
      handleBack();
    } catch (err) {
      console.error('Error deleting listing:', err);
      setError('Ошибка при удалении объявления');
    }
  };

  const handleContact = async (listing: Listing) => {
    if (!currentUserId || !currentUserName) {
      setError('Необходимо войти в систему');
      return;
    }

    try {
      setError(null);
      
      const chatData = {
        advert_id: listing.id,
        user1_id: currentUserId,
        user2_id: listing.owner_id,
        user1_name: currentUserName,
        user2_name: listing.owner_name
      };

      const response = await chatApi.createChat(chatData);
      
      if (response.success) {
        onNavigateToChat();
        onContact(listing);
      } else {
        setError(response.error || 'Ошибка создания чата');
      }
    } catch (err) {
      console.error('Error creating chat:', err);
      setError('Ошибка при создании чата');
    }
  };

  const handleEdit = (listing: Listing) => {
    onEditListing(listing);
  };

  const filteredListings = listings.filter(listing => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      listing.title.toLowerCase().includes(searchLower) ||
      listing.description.toLowerCase().includes(searchLower);
    
    const matchesCategory = selectedCategory === 'Все' || listing.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['Все', ...Array.from(new Set(
    listings
      .map(listing => listing.category)
      .filter(Boolean)
  ))];

  if (viewMode === 'detail' && selectedListing) {
    return (
      <ListingDetail
        listing={selectedListing}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        onBack={handleBack}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onContact={handleContact}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Поиск инструментов..."
              className="pl-10 pr-4 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {categories.map(category => (
            <Badge 
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="rounded-full whitespace-nowrap cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-500">Загрузка объявлений...</div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-32 space-y-2">
            <div className="text-red-500 text-center">{error}</div>
            <Button variant="outline" onClick={loadListings}>
              Повторить попытку
            </Button>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500 space-y-2">
            <div>Объявления не найдены</div>
            {(searchQuery || selectedCategory !== 'Все') && (
              <Button 
                variant="outline" 
                onClick={() => { 
                  setSearchQuery(''); 
                  setSelectedCategory('Все'); 
                }}
              >
                Сбросить поиск
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-4">
            {filteredListings.map((listing) => (
              <Card 
                key={listing.id} 
                className="overflow-hidden border-0 shadow-sm relative cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleListingClick(listing)}
              >
                <CardContent className="p-3">
                  <div className="relative flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg aspect-square mb-3 overflow-hidden">
                    <Package size={48} className="text-blue-600" />
                    {!listing.available && (
                      <>
                        <div className="absolute inset-0 bg-black/50"></div>
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <Badge variant="secondary" className="bg-black text-white border-0">
                            Занято
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <Badge variant="outline" className="mb-2 text-xs">
                    {listing.category}
                  </Badge>
                  <h3 className="line-clamp-2 mb-2 text-sm font-medium">{listing.title}</h3>
                  
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-blue-600 font-semibold">{listing.price} ₽</span>
                    <span className="text-xs text-gray-500">/ {listing.period}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Залог: {listing.deposit} ₽
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Button 
        className="fixed bottom-21 right-6 rounded-full w-14 h-14 shadow-lg "
        onClick={onCreateListing}
      >
        <Plus size={24} />
      </Button>
    </div>
  );
}