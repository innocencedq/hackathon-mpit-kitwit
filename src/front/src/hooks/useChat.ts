import { useState, useEffect, useCallback, useRef } from 'react';
import type { Chat, FrontendChat, FrontendMessage, Message, SendMessageRequest } from '../interface/Chat';
import * as chatApi from "../utils/chatApi";
import { useUser } from './useUser';

export const useChat = () => {
  const [chats, setChats] = useState<FrontendChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<FrontendChat | null>(null);
  const [messages, setMessages] = useState<FrontendMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user, isLoading: userLoading } = useUser();
  
  const chatsIntervalRef = useRef<number | null>(null);
  const messagesIntervalRef = useRef<number | null>(null);
  const selectedChatRef = useRef<FrontendChat | null>(null);
  const messagesRef = useRef<FrontendMessage[]>([]);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
    messagesRef.current = messages;
  }, [selectedChat, messages]);

  const transformChat = (chat: Chat): FrontendChat => ({
    id: chat.id,
    name: chat.name,
    lastMessage: chat.last_message,
    timestamp: chat.last_message_time,
    unread: chat.unread_count,
    online: chat.online,
    partner_id: chat.partner_id,
    advert_id: chat.advert_id
  });

  const transformMessage = (message: Message): FrontendMessage => ({
    id: message.id,
    chatId: message.chat_id,
    text: message.text,
    timestamp: message.timestamp,
    isOwn: message.is_own,
    read: message.read
  });

  const loadChats = useCallback(async () => {
    if (!user?.id) {
      console.log('User ID not available, waiting for user...');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await chatApi.getChats(user.id);
      console.log('Processed chats response:', response);
      
      if (response.success && response.data) {
        const transformedChats = response.data.chats.map(transformChat);
        console.log('Transformed chats:', transformedChats);
        setChats(transformedChats);
      } else {
        const errorMsg = response.error || 'Ошибка загрузки чатов';
        console.error('Chats error:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Exception in loadChats:', err);
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const loadMessages = useCallback(async (chatId: number) => {
    if (!user?.id) return;

    try {
      const response = await chatApi.getChatMessages(chatId, user.id);
      console.log('Processed messages response:', response);
      
      if (response.success && response.data) {
        const transformedMessages = response.data.messages.map(transformMessage);
        setMessages(transformedMessages);
        
        setChats(prevChats => 
          prevChats.map(c => 
            c.id === chatId ? { ...c, unread: 0 } : c
          )
        );
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  }, [user?.id]);

  const selectChat = useCallback(async (chat: FrontendChat | null) => {
    if (!chat) {
      setSelectedChat(null);
      setMessages([]);
      if (messagesIntervalRef.current) {
        clearInterval(messagesIntervalRef.current);
        messagesIntervalRef.current = null;
      }
      return;
    }

    setSelectedChat(chat);
    setLoading(true);
    setError(null);

    try {
      await loadMessages(chat.id);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Ошибка загрузки сообщений');
    } finally {
      setLoading(false);
    }
  }, [loadMessages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!selectedChat || !user?.id) return;

    const requestData: SendMessageRequest = {
      chat_id: selectedChat.id,
      text,
      sender_id: user.id
    };

    setError(null);
    try {
      const response = await chatApi.sendMessage(requestData);
      console.log('Processed send message response:', response);
      
      if (response.success && response.data) {
        const transformedMessage = transformMessage(response.data.message);
        
        setMessages(prev => [...prev, transformedMessage]);
        
        setChats(prevChats =>
          prevChats.map(chat =>
            chat.id === selectedChat.id
              ? {
                  ...chat,
                  lastMessage: text,
                  timestamp: transformedMessage.timestamp,
                  unread: 0
                }
              : chat
          )
        );
      } else {
        setError(response.error || 'Ошибка отправки сообщения');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Ошибка отправки сообщения');
    }
  }, [selectedChat, user?.id]);

  const searchChats = useCallback(async (query: string) => {
    if (!user?.id) return;
    
    setSearchQuery(query);
    
    if (!query.trim()) {
      await loadChats();
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await chatApi.searchChats(user.id, query);
      
      if (response.success && response.data) {
        const transformedChats = response.data.chats.map(transformChat);
        setChats(transformedChats);
      } else {
        setError(response.error || 'Ошибка поиска');
      }
    } catch (err) {
      console.error('Error searching chats:', err);
      setError('Ошибка поиска');
    } finally {
      setLoading(false);
    }
  }, [loadChats, user?.id]);

  const updateOnlineStatus = useCallback(async (online: boolean) => {
    if (!user?.id || !user?.name) return;
    
    try {
      await chatApi.updateUserStatus(user.id, user.name, online);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  }, [user?.id, user?.name]);

  const startChatsPolling = useCallback(() => {
    if (chatsIntervalRef.current) {
      clearInterval(chatsIntervalRef.current);
    }
    
    chatsIntervalRef.current = window.setInterval(() => {
      loadChats();
    }, 5000); // timeout chats
  }, [loadChats]);

  const startMessagesPolling = useCallback(() => {
    if (messagesIntervalRef.current) {
      clearInterval(messagesIntervalRef.current);
    }
    
    messagesIntervalRef.current = window.setInterval(() => {
      if (selectedChatRef.current) {
        loadMessages(selectedChatRef.current.id);
      }
    }, 3000); // timeout messages
  }, [loadMessages]);

  const stopAllPolling = useCallback(() => {
    if (chatsIntervalRef.current) {
      clearInterval(chatsIntervalRef.current);
      chatsIntervalRef.current = null;
    }
    if (messagesIntervalRef.current) {
      clearInterval(messagesIntervalRef.current);
      messagesIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (user?.id && !userLoading) {
      console.log('User loaded, loading chats... User ID:', user.id);
      loadChats();
      updateOnlineStatus(true);
      startChatsPolling();
    }
  }, [user?.id, userLoading, loadChats, updateOnlineStatus, startChatsPolling]);

  useEffect(() => {
    if (selectedChat) {
      startMessagesPolling();
    } else {
      if (messagesIntervalRef.current) {
        clearInterval(messagesIntervalRef.current);
        messagesIntervalRef.current = null;
      }
    }
    
    return () => {
      if (messagesIntervalRef.current) {
        clearInterval(messagesIntervalRef.current);
        messagesIntervalRef.current = null;
      }
    };
  }, [selectedChat, startMessagesPolling]);

  useEffect(() => {
    return () => {
      stopAllPolling();
      if (user?.id) {
        updateOnlineStatus(false);
      }
    };
  }, [user?.id, updateOnlineStatus, stopAllPolling]);

  return {
    chats,
    selectedChat,
    messages,
    loading: loading || userLoading,
    error,
    searchQuery,
    selectChat,
    sendMessage,
    searchChats,
    setError,
    updateOnlineStatus,
    loadChats,
    loadMessages,
    stopAllPolling,
    startChatsPolling,
    startMessagesPolling
  };
};