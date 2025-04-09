// // ScenarioSimulation.js
import React, { useState } from 'react';
import axios from 'axios';

const ScenarioSimulation = ({ modelInfo, onSimulationResults }) => {
  const [selectedChannel, setSelectedChannel] = useState(modelInfo?.channels?.[0] || '');
  const [increasePercentage, setIncreasePercentage] = useState(10);
  const [isSimulating, setIsSimulating] = useState(false);
  const [modelDetailsOpen, setModelDetailsOpen] = useState(false);

  const handleRunSimulation = async () => {
    if (!selectedChannel) return;
    
    setIsSimulating(true);
    try {
      const res = await axios.post("http://localhost:5000/simulate-scenario", {
        channel_increase: {
          channel: selectedChannel,
          percentage: increasePercentage
        }
      });
      
      if (res.data) {
        onSimulationResults(res.data);
      }
    } catch (error) {
      console.error("Simulation error:", error);
      alert("Failed to run simulation. Please check the server connection.");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="scenario-simulation-wrapper">
      <div className="model-details-toggle">
        <button 
          className="toggle-button"
          onClick={() => setModelDetailsOpen(!modelDetailsOpen)}
        >
          {modelDetailsOpen ? 'Hide Model Details' : 'Show Model Details'} 
          <span className="toggle-icon">{modelDetailsOpen ? '▲' : '▼'}</span>
        </button>
      </div>
      
      {modelDetailsOpen && modelInfo && (
        <div className="model-info-panel">
          <div className="model-info-grid">
            <div className="info-card">
              <h4>Model Type</h4>
              <p>{modelInfo.type}</p>
            </div>
            <div className="info-card">
              <h4>Framework</h4>
              <p>{modelInfo.framework}</p>
            </div>
            <div className="info-card">
              <h4>Samples</h4>
              <p>{modelInfo.posterior_samples} draws</p>
            </div>
            <div className="info-card">
              <h4>Chains</h4>
              <p>{modelInfo.chains}</p>
            </div>
          </div>
          
          <div className="channels-section">
            <h4>Marketing Channels</h4>
            <div className="channel-badges">
              {modelInfo.channels?.map((channel, index) => (
                <span key={index} className="channel-badge">{channel}</span>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="simulation-card">
        <h3>What-If Scenario Analysis</h3>
        <p className="simulation-description">
          Simulate how changes in your marketing channels would affect your overall performance.
        </p>
        
        <div className="simulation-controls">
          <div className="form-group">
            <label htmlFor="channel-select">Channel to modify:</label>
            <select 
              id="channel-select"
              value={selectedChannel} 
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="select-control"
            >
              {modelInfo?.channels?.map((channel, index) => (
                <option key={index} value={channel}>{channel}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="percentage-input">Increase performance by:</label>
            <div className="percentage-input-wrapper">
              <input 
                id="percentage-input"
                type="number" 
                min="1" 
                max="100" 
                value={increasePercentage} 
                onChange={(e) => setIncreasePercentage(parseInt(e.target.value))}
                className="input-control"
              />
              <span className="percentage-symbol">%</span>
            </div>
          </div>
          
          <button 
            className="simulation-button"
            onClick={handleRunSimulation}
            disabled={isSimulating || !selectedChannel}
          >
            {isSimulating ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScenarioSimulation;