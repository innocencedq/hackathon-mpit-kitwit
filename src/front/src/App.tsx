import { useState } from 'react';
import { Grid3x3, Handshake, MessageSquare, User, type LucideIcon } from 'lucide-react';
import { ListingsTab } from './components/ListingsTab';
import { DealsTab } from './components/DealsTab';
import { ChatTab } from './components/ChatTab';
import { ProfileTab } from './components/ProfileTab';
import { CreateEditListingModal } from './components/CreateEditListingModal';
import { useQuery } from '@tanstack/react-query';
import type { IUser } from './interface/IUser';
import type { Listing, CreateListingData, UpdateListingData } from './interface/Listings';
import request from './utils/api';
import { init, initData, viewport } from '@telegram-apps/sdk';

init();
viewport.mount();

initData.restore();
viewport.expand();

type TabType = 'listings' | 'deals' | 'chat' | 'profile';

interface Tab {
  id: TabType;
  label: string;
  icon: LucideIcon;
}

export default function App() {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      return (await request("users/get")).data;
    },
    select: (data) => data.user as IUser
  });
  
  const [activeTab, setActiveTab] = useState<TabType>('listings');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [listingsUpdated, setListingsUpdated] = useState(0);

  const tabs: Tab[] = [
    { id: 'listings', label: 'Объявления', icon: Grid3x3 },
    { id: 'chat', label: 'Чат', icon: MessageSquare },
    { id: 'deals', label: 'Сделки', icon: Handshake },
    { id: 'profile', label: 'Профиль', icon: User },
  ];


  const handleContact = (listing: Listing) => {
    console.log('Contact listing:', listing);
    setActiveTab('chat');
  };

  const handleEditListing = (listing: Listing) => {
    setEditingListing(listing);
  };

  const handleCreateListing = () => {
    setIsCreateModalOpen(true);
  };

  const handleNavigateToChat = () => {
    setActiveTab('chat');
  };


  const refreshListings = () => {
    setListingsUpdated(prev => prev + 1);
  };

  const handleSubmitListing = async (data: CreateListingData | UpdateListingData) => {
    try {
      if (editingListing) {
        const response = await request(`advert/update/${editingListing.id}`, 'PUT', data);
        if (response.data.success) {
          console.log('Объявление обновлено:', response.data.advert);

          refreshListings();
        }
      } else {
        const response = await request('advert/create', 'POST', data);
        if (response.data.success) {
          console.log('Объявление создано:', response.data.advert);

          refreshListings();
        }
      }
    } catch (error) {
      console.error('Ошибка при сохранении объявления:', error);

      return false;
    }
    

    handleCloseModal();
    return true;
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingListing(null);
  };

  return (
    <div className="h-screen flex flex-col max-w-md mx-auto bg-white shadow-xl">
      {/* main */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'listings' && (
          <ListingsTab 
            currentUserId={user?.id} 
            currentUserName={user?.name}
            onContact={handleContact}
            onEditListing={handleEditListing}
            onCreateListing={handleCreateListing}
            onNavigateToChat={handleNavigateToChat}
            listingsUpdated={listingsUpdated}
          />
        )}
        {activeTab === 'chat' && <ChatTab />}
        {activeTab === 'deals' && <DealsTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </div>

      {/* nizhnya panelka */}
      <nav className="bg-white border-t border-gray-200 px-2 py-2 safe-area-bottom">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <CreateEditListingModal
        isOpen={isCreateModalOpen || !!editingListing}
        onClose={handleCloseModal}
        onSubmit={handleSubmitListing}
        listing={editingListing}
        currentUserId={user?.id}
        currentUserName={user?.name}
      />
    </div>
  );
}