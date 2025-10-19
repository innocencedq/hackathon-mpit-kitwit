import { useState, useEffect } from 'react';
import { Search, User, Send, ArrowLeft, RefreshCw } from 'lucide-react';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useChat } from '../hooks/useChat';
import type { FrontendChat, FrontendMessage } from '../interface/Chat';

export function ChatTab() {
  const {
    chats,
    selectedChat,
    messages,
    loading,
    error,
    searchQuery,
    selectChat,
    sendMessage,
    searchChats,
    setError,
    loadChats,
    loadMessages
  } = useChat();

  const [newMessage, setNewMessage] = useState('');

  const handleRefresh = () => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    } else {
      loadChats();
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    sendMessage(newMessage.trim());
    setNewMessage('');
  };

  const handleSearch = (query: string) => {
    searchChats(query);
  };

  useEffect(() => {
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  if (selectedChat) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-white p-4 shadow-sm border-b flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => selectChat(null)}
            className="md:hidden"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="relative">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full">
              <User size={20} className="text-blue-600" />
            </div>
            {selectedChat.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium">{selectedChat.name}</p>
            <p className="text-sm text-gray-500">
              {selectedChat.online ? 'online' : 'был(а) недавно'}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 messages-container">
          {messages.length === 0 && !loading ? (
            <div className="text-center text-gray-500 py-8">
              Нет сообщений. Начните диалог!
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          {loading && (
            <div className="flex justify-center">
              <div className="text-gray-500">Загрузка...</div>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="bg-white p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Введите сообщение..."
              className="flex-1"
              disabled={loading}
            />
            <Button 
              type="submit" 
              disabled={!newMessage.trim() || loading}
              className="flex-shrink-0"
            >
              <Send size={20} />
            </Button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 text-sm flex justify-between items-center">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={() => setError(null)}>
              ×
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white p-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-semibold">Сообщения</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Поиск чатов..."
            className="pl-10 pr-4 rounded-full"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="text-gray-500">Загрузка чатов...</div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-2">
            <div className="text-red-500 text-center">{error}</div>
            <Button variant="outline" onClick={handleRefresh}>
              Повторить попытку
            </Button>
          </div>
        ) : (
          chats.map((chat, index) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              isLast={index === chats.length - 1}
              onClick={() => selectChat(chat)}
            />
          ))
        )}
        {chats.length === 0 && !loading && !error && (
          <div className="text-center p-8 text-gray-500">
            {searchQuery ? 'Чаты не найдены' : 'У вас пока нет чатов'}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 text-sm flex justify-between items-center">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={() => setError(null)}>
            ×
          </Button>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: FrontendMessage }) {
  return (
    <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          message.isOwn
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-white text-gray-800 rounded-bl-none border'
        }`}
      >
        <p className="break-words">{message.text}</p>
        <p
          className={`text-xs mt-1 ${
            message.isOwn ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          {message.timestamp}
        </p>
      </div>
    </div>
  );
}

function ChatListItem({ 
  chat, 
  isLast, 
  onClick 
}: { 
  chat: FrontendChat; 
  isLast: boolean; 
  onClick: () => void; 
}) {
  return (
    <div
      className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
        !isLast ? 'border-b' : ''
      }`}
      onClick={onClick}
    >
      <div className="relative">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full">
          <User size={24} className="text-blue-600" />
        </div>
        {chat.online && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="font-medium truncate">{chat.name}</p>
          <span className="text-sm text-gray-500 ml-2 flex-shrink-0">
            {chat.timestamp}
          </span>
        </div>
        <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
      </div>

      {chat.unread > 0 && (
        <Badge 
          variant="default" 
          className="rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
        >
          {chat.unread}
        </Badge>
      )}
    </div>
  );
}