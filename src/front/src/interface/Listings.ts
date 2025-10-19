export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  deposit: number;
  period: string;
  category: string;
  available: boolean;
  owner_id: number;
  owner_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface ListingDetailProps {
  listing: Listing;
  currentUserId?: number;
  currentUserName?: string;
  onBack: () => void;
  onEdit: (listing: Listing) => void;
  onDelete: (listingId: number) => void;
  onContact: (listing: Listing) => void;
}

export interface ListingsTabProps {
  currentUserId?: number;
  currentUserName?: string;
  onContact: (listing: Listing) => void;
  onEditListing: (listing: Listing) => void;
  onCreateListing: () => void;
  onNavigateToChat: () => void;
}

export interface CreateListingData {
  title: string;
  description: string;
  price: number;
  deposit: number;
  period: string;
  category: string;
  available: boolean;
  owner_id: number;
  owner_name: string;
}

export interface UpdateListingData {
  title?: string;
  description?: string;
  price?: number;
  deposit?: number;
  period?: string;
  category?: string;
  available?: boolean;
}