import React from 'react';

const TypingIndicator = ({ typingUsers }) => {
  if (typingUsers.length === 0) return null;

  return (
    <div className="flex justify-start p-4">
      <div className="bg-white rounded-lg shadow-sm p-3 max-w-xs">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
          </div>
          <span className="text-sm text-gray-600">
            {typingUsers.length === 1 ? 'Someone is typing...' : 'Multiple people are typing...'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
