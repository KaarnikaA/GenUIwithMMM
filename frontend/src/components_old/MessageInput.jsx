import React from 'react';
import SendIcon from './icons/SendIcon';
import LoadingIcon from './icons/LoadingIcon';
import './styles/MessageInput.css'; 
function MessageInput({ input, setInput, handleSubmit, loading }) {
  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white shadow-lg">
      <div className="flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your marketing model or run a simulation..."
          className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="p-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {loading ? <LoadingIcon size={20} /> : <SendIcon size={20} />}
        </button>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        <p>Try asking about channel performance, ROI comparisons, or what-if scenarios.</p>
        <p>Example: "What if we increase spending on Channel_1 by 15%?"</p>
      </div>
    </form>
  );
}

export default MessageInput;