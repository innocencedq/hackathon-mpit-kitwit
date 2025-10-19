export interface Message {
  id: number;
  chat_id: number;
  text: string;
  timestamp: string;
  is_own: boolean;
  read: boolean;
}

export interface Chat {
  id: number;
  name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  online: boolean;
  partner_id: number;
  advert_id: number;
}

export interface SendMessageRequest {
  chat_id: number;
  text: string;
  sender_id: number;
}

export interface CreateChatRequest {
  advert_id: number;
  user1_id: number;
  user2_id: number;
  user1_name: string;
  user2_name: string;
}

export interface UserStatus {
  user_id: number;
  user_name: string;
  online: boolean;
  last_seen: string;
}

export interface FrontendChat {
  id: number;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
  partner_id: number;
  advert_id: number;
}

export interface FrontendMessage {
  id: number;
  chatId: number;
  text: string;
  timestamp: string;
  isOwn: boolean;
  read: boolean;
}