import request from './api';
import type { 
  Message, 
  Chat, 
  SendMessageRequest, 
  CreateChatRequest, 
  UserStatus 
} from '../interface/Chat';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}


const transformBackendResponse = <T>(backendResponse: any): ApiResponse<T> => {
  if (backendResponse.success) {
    if (backendResponse.chats !== undefined) {
      return {
        success: true,
        data: {
          chats: backendResponse.chats
        } as T
      };
    }
    else if (backendResponse.messages !== undefined) {
      return {
        success: true,
        data: {
          messages: backendResponse.messages
        } as T
      };
    }
    else if (backendResponse.message !== undefined) {
      return {
        success: true,
        data: {
          message: backendResponse.message
        } as T
      };
    }
    else if (backendResponse.chat !== undefined) {
      return {
        success: true,
        data: {
          chat: backendResponse.chat,
          is_new: backendResponse.is_new
        } as T
      };
    }
    else if (backendResponse.status !== undefined) {
      return {
        success: true,
        data: {
          status: backendResponse.status,
          is_new: backendResponse.is_new
        } as T
      };
    }
    else {
      return backendResponse;
    }
  } else {
    return backendResponse;
  }
};


export const getChats = async (userId: number): Promise<ApiResponse<{ chats: Chat[] }>> => {
  try {
    const response = await request(`chats/${userId}`, 'GET');
    console.log('Raw getChats response:', response.data);
    
    return transformBackendResponse<{ chats: Chat[] }>(response.data);
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Ошибка загрузки чатов'
    };
  }
};


export const getChatMessages = async (chatId: number, userId: number): Promise<ApiResponse<{ messages: Message[] }>> => {
  try {
    const response = await request(`chats/${chatId}/messages/${userId}`, 'GET');
    console.log('Raw getChatMessages response:', response.data);
    
    return transformBackendResponse<{ messages: Message[] }>(response.data);
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Ошибка загрузки сообщений'
    };
  }
};


export const sendMessage = async (data: SendMessageRequest): Promise<ApiResponse<{ message: Message }>> => {
  try {
    const response = await request('messages/send', 'POST', data);
    console.log('Raw sendMessage response:', response.data);
    
    return transformBackendResponse<{ message: Message }>(response.data);
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Ошибка отправки сообщения'
    };
  }
};


export const createChat = async (data: CreateChatRequest): Promise<ApiResponse<{ chat: Chat; is_new: boolean }>> => {
  try {
    const response = await request('chats/create', 'POST', data);
    console.log('Raw createChat response:', response.data);
    
    return transformBackendResponse<{ chat: Chat; is_new: boolean }>(response.data);
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Ошибка создания чата'
    };
  }
};


export const searchChats = async (userId: number, query: string): Promise<ApiResponse<{ chats: Chat[] }>> => {
  try {
    const response = await request(`chats/search/${userId}?query=${encodeURIComponent(query)}`, 'GET');
    console.log('Raw searchChats response:', response.data);
    
    return transformBackendResponse<{ chats: Chat[] }>(response.data);
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Ошибка поиска чатов'
    };
  }
};


export const markAsRead = async (chatId: number, userId: number): Promise<ApiResponse> => {
  try {
    const response = await request('messages/mark-read', 'POST', { chat_id: chatId, user_id: userId });
    console.log('Raw markAsRead response:', response.data);
    
    if (response.data.success) {
      return { success: true };
    } else {
      return { success: false, error: response.data.error };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Ошибка обновления статуса сообщений'
    };
  }
};


export const updateUserStatus = async (userId: number, userName: string, online: boolean): Promise<ApiResponse<{ status: UserStatus; is_new: boolean }>> => {
  try {
    const response = await request('user-status/update', 'POST', {
      user_id: userId,
      user_name: userName,
      online
    });
    console.log('Raw updateUserStatus response:', response.data);
    
    return transformBackendResponse<{ status: UserStatus; is_new: boolean }>(response.data);
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Ошибка обновления статуса'
    };
  }
};


export const getUserStatus = async (userId: number): Promise<ApiResponse<{ status: UserStatus }>> => {
  try {
    const response = await request(`user-status/${userId}`, 'GET');
    console.log('Raw getUserStatus response:', response.data);
    
    return transformBackendResponse<{ status: UserStatus }>(response.data);
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Ошибка получения статуса'
    };
  }
};