import React from 'react';
import './styles/ModelInfo.css'; // Assuming you have a CSS file for styles
function ModelInfo({ modelInfo, setShowModelInfo }) {
  return (
    <div className="bg-white shadow-md p-4 m-2 rounded-lg">
      <h2 className="text-lg font-semibold mb-2">Model Information</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium">Type:</h3>
          <p>{modelInfo.type}</p>
        </div>
        <div>
          <h3 className="font-medium">Framework:</h3>
          <p>{modelInfo.framework}</p>
        </div>
        <div>
          <h3 className="font-medium">Channels:</h3>
          <p>{modelInfo.channels ? modelInfo.channels.join(', ') : 'N/A'}</p>
        </div>
        <div>
          <h3 className="font-medium">Posterior Samples:</h3>
          <p>{modelInfo.posterior_samples || 'N/A'}</p>
        </div>
      </div>
      <div className="mt-3">
        <h3 className="font-medium">Available Variables:</h3>
        <p className="text-sm">{modelInfo.variables ? modelInfo.variables.join(', ') : 'N/A'}</p>
      </div>
      <button 
        onClick={() => setShowModelInfo(false)}
        className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-800"
      >
        Close
      </button>
    </div>
  );
}

export default ModelInfo;