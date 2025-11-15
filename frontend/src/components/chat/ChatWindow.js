import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useCall } from '../../contexts/CallContext';
import { chatsAPI, messagesAPI } from '../../services/api';
import { FaArrowLeft, FaPaperPlane, FaPhone, FaVideo, FaSmile, FaPaperclip } from 'react-icons/fa';
import MessageList from './MessageList';
import TypingIndicator from './TypingIndicator';

const ChatWindow = () => {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  
  const { user } = useAuth();
  const { socket } = useSocket();
  const { initiateCall } = useCall();
  const { chatId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (chatId) {
      fetchChatData();
    }
  }, [chatId]);

  useEffect(() => {
    if (socket) {
      socket.on('new_message', handleNewMessage);
      socket.on('typing', handleTyping);
      socket.on('stop_typing', handleStopTyping);
      
      return () => {
        socket.off('new_message');
        socket.off('typing');
        socket.off('stop_typing');
      };
    }
  }, [socket, chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatData = async () => {
    try {
      const [chatData, messagesData] = await Promise.all([
        chatsAPI.getChat(chatId),
        messagesAPI.getMessages(chatId)
      ]);
      
      setChat(chatData);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error fetching chat data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    if (message.chatId === chatId) {
      setMessages(prev => [...prev, message]);
    }
  };

  const handleTyping = (data) => {
    if (data.chatId === chatId && data.userId !== user.id) {
      setTypingUsers(prev => {
        if (!prev.includes(data.userId)) {
          return [...prev, data.userId];
        }
        return prev;
      });
    }
  };

  const handleStopTyping = (data) => {
    if (data.chatId === chatId) {
      setTypingUsers(prev => prev.filter(userId => userId !== data.userId));
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const messageData = {
        content: newMessage.trim(),
        type: 'text'
      };

      const message = await messagesAPI.sendMessage(chatId, messageData);
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Emit message to socket
      if (socket) {
        socket.emit('send_message', {
          chatId,
          message: message
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleTypingChange = (e) => {
    setNewMessage(e.target.value);
    
    if (socket) {
      if (!isTyping) {
        setIsTyping(true);
        socket.emit('typing', { chatId, userId: user.id });
      }
      
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socket.emit('stop_typing', { chatId, userId: user.id });
      }, 1000);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherParticipant = () => {
    if (!chat) return null;
    return chat.participants.find(p => p._id !== user.id);
  };

  const handleVideoCall = () => {
    const otherParticipant = getOtherParticipant();
    if (otherParticipant) {
      initiateCall(otherParticipant._id, 'video');
    }
  };

  const handleVoiceCall = () => {
    const otherParticipant = getOtherParticipant();
    if (otherParticipant) {
      initiateCall(otherParticipant._id, 'voice');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-whatsapp-green"></div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Chat not found</h2>
          <button
            onClick={() => navigate('/chats')}
            className="text-whatsapp-green hover:text-green-600"
          >
            Back to chats
          </button>
        </div>
      </div>
    );
  }

  const otherParticipant = getOtherParticipant();

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-whatsapp-green text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/chats')}
            className="mr-4 p-2 hover:bg-green-600 rounded-full transition-colors"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <img
            src={otherParticipant?.avatar || `https://ui-avatars.com/api/?name=${otherParticipant?.name}&background=25D366&color=fff`}
            alt={otherParticipant?.name}
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <h3 className="text-lg font-semibold">{otherParticipant?.name || 'Unknown User'}</h3>
            <span className="text-sm text-green-100">
              {otherParticipant?.isOnline ? 'Online' : 'Last seen recently'}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleVoiceCall}
            className="p-2 hover:bg-green-600 rounded-full transition-colors"
          >
            <FaPhone className="text-xl" />
          </button>
          <button
            onClick={handleVideoCall}
            className="p-2 hover:bg-green-600 rounded-full transition-colors"
          >
            <FaVideo className="text-xl" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <MessageList messages={messages} currentUserId={user.id} />
        <TypingIndicator typingUsers={typingUsers} />
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-whatsapp-green transition-colors"
          >
            <FaSmile className="text-xl" />
          </button>
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-whatsapp-green transition-colors"
          >
            <FaPaperclip className="text-xl" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={handleTypingChange}
            placeholder="Type a message..."
            className="flex-1 p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-whatsapp-green focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-whatsapp-green hover:bg-green-600 text-white p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPaperPlane className="text-xl" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
