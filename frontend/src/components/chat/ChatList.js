import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useCall } from '../../contexts/CallContext';
import { chatsAPI } from '../../services/api';
import { FaSearch, FaPlus, FaSignOutAlt, FaVideo, FaPhone } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const { initiateCall } = useCall();
  const navigate = useNavigate();

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new_message', handleNewMessage);
      socket.on('message_delivered', handleMessageDelivered);
      socket.on('user_status_changed', handleUserStatusChange);
      
      return () => {
        socket.off('new_message');
        socket.off('message_delivered');
        socket.off('user_status_changed');
      };
    }
  }, [socket]);

  const fetchChats = async () => {
    try {
      const chatList = await chatsAPI.getChats();
      setChats(chatList);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    setChats(prevChats => {
      const updatedChats = [...prevChats];
      const chatIndex = updatedChats.findIndex(chat => chat._id === message.chatId);
      
      if (chatIndex !== -1) {
        updatedChats[chatIndex].lastMessage = message;
        updatedChats[chatIndex].unreadCount = (updatedChats[chatIndex].unreadCount || 0) + 1;
        // Move chat to top
        const chat = updatedChats.splice(chatIndex, 1)[0];
        updatedChats.unshift(chat);
      }
      
      return updatedChats;
    });
  };

  const handleMessageDelivered = (data) => {
    setChats(prevChats => 
      prevChats.map(chat => 
        chat._id === data.chatId 
          ? { ...chat, unreadCount: data.count }
          : chat
      )
    );
  };

  const handleUserStatusChange = (data) => {
    setChats(prevChats =>
      prevChats.map(chat => ({
        ...chat,
        participants: chat.participants.map(participant =>
          participant._id === data.userId
            ? { ...participant, isOnline: data.isOnline, lastSeen: data.lastSeen }
            : participant
        )
      }))
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const startVideoCall = (chat) => {
    const otherParticipant = getOtherParticipant(chat);
    if (otherParticipant) {
      initiateCall(otherParticipant._id, 'video');
    }
  };

  const startVoiceCall = (chat) => {
    const otherParticipant = getOtherParticipant(chat);
    if (otherParticipant) {
      initiateCall(otherParticipant._id, 'voice');
    }
  };

  const getOtherParticipant = (chat) => {
    return chat.participants.find(p => p._id !== user.id);
  };

  const goToTestCall = () => {
    navigate('/test-call');
  };

  const filteredChats = chats.filter(chat => {
    const otherParticipant = chat.participants.find(p => p._id !== user.id);
    return otherParticipant?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-whatsapp-green"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-whatsapp-green text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=25D366&color=fff`}
            alt="Profile" 
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <h1 className="text-xl font-semibold">Chats</h1>
            <p className="text-sm text-green-100">{user?.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={goToTestCall}
            className="p-2 hover:bg-green-600 rounded-full transition-colors"
            title="Test Video/Voice Call"
          >
            <FaVideo className="text-xl" />
          </button>
          <button 
            onClick={() => setShowNewChat(!showNewChat)}
            className="p-2 hover:bg-green-600 rounded-full transition-colors"
          >
            <FaPlus className="text-xl" />
          </button>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-green-600 rounded-full transition-colors"
          >
            <FaSignOutAlt className="text-xl" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white border-b">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-green focus:border-transparent"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-lg">No chats found</p>
            <p className="text-sm">Start a new conversation</p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const otherParticipant = getOtherParticipant(chat);
            const isOnline = otherParticipant?.isOnline;
            
            return (
              <div
                key={chat._id}
                onClick={() => navigate(`/chat/${chat._id}`)}
                className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
              >
                <div className="relative">
                  <img
                    src={otherParticipant?.avatar || `https://ui-avatars.com/api/?name=${otherParticipant?.name}&background=25D366&color=fff`}
                    alt={otherParticipant?.name}
                    className="w-12 h-12 rounded-full"
                  />
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 ml-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">{otherParticipant?.name || 'Unknown User'}</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startVideoCall(chat);
                        }}
                        className="p-1 hover:bg-green-100 rounded-full transition-colors"
                        title="Video Call"
                      >
                        <FaVideo className="text-green-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startVoiceCall(chat);
                        }}
                        className="p-1 hover:bg-green-100 rounded-full transition-colors"
                        title="Voice Call"
                      >
                        <FaPhone className="text-green-600" />
                      </button>
                      <span className="text-sm text-gray-500">
                        {formatLastMessageTime(chat.lastMessage?.createdAt)}
                      </span>
                      {chat.unreadCount > 0 && (
                        <span className="bg-whatsapp-green text-white text-xs font-bold px-2 py-1 rounded-full">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm truncate">
                    {chat.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Start New Chat</h2>
            <p className="text-gray-600 mb-4">This feature will be implemented soon!</p>
            <button
              onClick={() => setShowNewChat(false)}
              className="w-full bg-whatsapp-green text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;
