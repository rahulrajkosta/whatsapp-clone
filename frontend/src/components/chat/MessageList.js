import React from 'react';
import { format } from 'date-fns';
import { FaCheck, FaCheckDouble } from 'react-icons/fa';

const MessageList = ({ messages, currentUserId }) => {
  const formatMessageTime = (timestamp) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  const isMessageRead = (message) => {
    return message.readBy && message.readBy.length > 0;
  };

  const getMessageStatus = (message) => {
    if (message.sender === currentUserId) {
      if (isMessageRead(message)) {
        return <FaCheckDouble className="text-blue-500 ml-1" />;
      } else {
        return <FaCheck className="text-gray-400 ml-1" />;
      }
    }
    return null;
  };

  return (
    <div className="p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-lg">No messages yet</p>
          <p className="text-sm">Start the conversation!</p>
        </div>
      ) : (
        messages.map((message) => {
          const isOwnMessage = message.sender === currentUserId;
          
          return (
            <div
              key={message._id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwnMessage
                    ? 'bg-whatsapp-green text-white'
                    : 'bg-white text-gray-800 shadow-sm'
                }`}
              >
                {message.replyTo && (
                  <div className={`text-sm mb-2 p-2 rounded ${
                    isOwnMessage ? 'bg-green-600' : 'bg-gray-100'
                  }`}>
                    <p className="font-semibold">Reply to:</p>
                    <p className="truncate">{message.replyTo.content}</p>
                  </div>
                )}
                
                <div className="break-words">
                  {message.type === 'text' && (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                  
                  {message.type === 'image' && (
                    <div>
                      <img
                        src={message.mediaMeta?.url}
                        alt="Shared image"
                        className="max-w-full h-auto rounded-lg mb-2"
                      />
                      {message.content && (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  )}
                  
                  {message.type === 'video' && (
                    <div>
                      <video
                        src={message.mediaMeta?.url}
                        controls
                        className="max-w-full h-auto rounded-lg mb-2"
                      />
                      {message.content && (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  )}
                  
                  {message.type === 'file' && (
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <p className="font-semibold">{message.mediaMeta?.fileName}</p>
                        <p className="text-sm opacity-75">
                          {(message.mediaMeta?.fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <a
                        href={message.mediaMeta?.url}
                        download
                        className="bg-white bg-opacity-20 px-3 py-1 rounded text-sm"
                      >
                        Download
                      </a>
                    </div>
                  )}
                  
                  {message.type === 'audio' && (
                    <div>
                      <audio
                        src={message.mediaMeta?.url}
                        controls
                        className="w-full"
                      />
                      {message.content && (
                        <p className="whitespace-pre-wrap mt-2">{message.content}</p>
                      )}
                    </div>
                  )}
                </div>
                
                {message.reactions && message.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {message.reactions.map((reaction, index) => (
                      <span
                        key={index}
                        className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm"
                      >
                        {reaction.emoji}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className={`flex items-center justify-end mt-1 text-xs ${
                  isOwnMessage ? 'text-green-100' : 'text-gray-500'
                }`}>
                  <span>{formatMessageTime(message.createdAt)}</span>
                  {getMessageStatus(message)}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MessageList;
