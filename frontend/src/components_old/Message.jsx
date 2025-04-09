import React from 'react';
import './styles/Message.css';
function Message({ message }) {
  const formatTimestamp = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-3xl rounded-lg p-4 ${
          message.sender === 'user'
            ? 'bg-blue-500 text-white'
            : message.isError
            ? 'bg-red-100 text-red-800 border border-red-200'
            : 'bg-white text-gray-800 shadow'
        }`}
      >
        <div className="flex justify-between items-start mb-1">
          <span className="font-semibold">
            {message.sender === 'user' ? 'You' : 'Marketing Mix Model Assistant'}
          </span>
          <span className="text-xs opacity-75 ml-4">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
        <div className="whitespace-pre-wrap">{message.content}</div>
        
        {/* Chart display */}
        {message.chartUrl && (
          <div className="mt-4 bg-gray-50 p-2 rounded border">
            <img 
              src={message.chartUrl} 
              alt="Analysis Chart" 
              className="w-full rounded"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/600x400?text=Chart+unavailable";
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Message;