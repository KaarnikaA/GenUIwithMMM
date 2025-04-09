// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// // This code is updated with neon db
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, TextField, Button, Paper, Typography, List, ListItem, 
  CircularProgress, Divider, Chip, Avatar, IconButton, Collapse,
  Dialog, DialogTitle, DialogContent, DialogActions, Badge
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import InfoIcon from '@mui/icons-material/Info';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import WarningIcon from '@mui/icons-material/Warning';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import ReactMarkdown from 'react-markdown';
import { v4 as uuidv4 } from 'uuid';
import ChartRenderer from './ChartRenderer';

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);
  const [showModelInfo, setShowModelInfo] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);

  // Initialize session ID
  useEffect(() => {
    const savedSession = localStorage.getItem('mmm_chat_session');
    if (savedSession) {
      setSessionId(savedSession);
      // Load previous messages for this session
      fetchChatHistory(savedSession);
    } else {
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      localStorage.setItem('mmm_chat_session', newSessionId);
    }
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch model info on mount
  useEffect(() => {
    fetch('http://localhost:5000/model-info')
      .then(res => res.json())
      .then(data => {
        setModelInfo(data);
      })
      .catch(err => console.error("Failed to fetch model info:", err));
  }, []);


// Updated handleSubmit function with better error handling
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!input.trim() || loading) return;
  
  setLoading(true);
  const userMessage = { text: input, sender: 'user' };
  setMessages(prev => [...prev, userMessage]);
  setInput('');
  
  try {
    const response = await fetch('http://localhost:5000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: input,
        session_id: sessionId
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status}. ${errorText}`);
    }
    
    const data = await response.json();
    
    const botMessage = { 
      text: data.response || "An error occurred while processing your request.",
      sender: 'bot',
      data: data.model_results,
      chartUrls: data.model_results?.chart_url ? [data.model_results.chart_url] : [],
      source: data.model_results?.error ? 'error' : 'gemini'
    };
    
    setMessages(prev => [...prev, botMessage]);
  } catch (error) {
    console.error("Error in request:", error);
    setMessages(prev => [...prev, { 
      text: `Error: ${error.message}`, 
      sender: 'bot',
      isError: true,
      source: 'error'
    }]);
  } finally {
    setLoading(false);
  }
};

// Updated fetchChatHistory function
const fetchChatHistory = async (sessionId) => {
  try {
    const response = await fetch(`http://localhost:5000/chat-history/${sessionId}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch history: ${response.status}. ${errorText}`);
      return;
    }
    
    const history = await response.json();
    if (history.history && history.history.length > 0) {
      // Transform history to match our messages format
      const formattedMessages = history.history.map(msg => ({
        text: msg.text,
        sender: msg.sender,
        timestamp: msg.timestamp,
        chartUrls: msg.charts || [],
        source: msg.sender === 'bot' ? 'gemini' : undefined
      }));
      setMessages(formattedMessages);
    }
  } catch (error) {
    console.error("Error fetching chat history:", error);
    // Don't throw error - just continue with empty history
  }
};

// Initialize session and load history
useEffect(() => {
  const savedSession = localStorage.getItem('mmm_chat_session');
  if (savedSession) {
    setSessionId(savedSession);
    fetchChatHistory(savedSession).catch(console.error);
  } else {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    localStorage.setItem('mmm_chat_session', newSessionId);
  }
}, []);

  const toggleModelInfo = () => {
    setShowModelInfo(!showModelInfo);
  };

  const handleHistoryClick = () => {
    setHistoryOpen(true);
  };

  const loadHistoricalMessage = (sessionId, messageId) => {
    // Find the message in history
    const message = chatHistory.find(msg => msg.id === messageId);
    if (message) {
      setInput(message.text);
    }
    setHistoryOpen(false);
  };

  const startNewSession = () => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    localStorage.setItem('mmm_chat_session', newSessionId);
    setMessages([]);
    setHistoryOpen(false);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      p: 2,
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          Marketing Mix Model Chat
          <Chip 
            label={`Session: ${sessionId.slice(0, 8)}`} 
            size="small" 
            sx={{ ml: 2 }} 
          />
        </Typography>
        
        <Box>
          <IconButton onClick={handleHistoryClick} color="primary" sx={{ mr: 1 }}>
            <Badge badgeContent={chatHistory.length} color="secondary">
              <HistoryIcon />
            </Badge>
          </IconButton>
          <IconButton onClick={toggleModelInfo} color="primary">
            <InfoIcon />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={showModelInfo}>
        {modelInfo && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>Model Information</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip label={`Type: ${modelInfo.type || 'Marketing Mix Model'}`} />
              <Chip label={`Framework: ${modelInfo.framework || 'PyMC + ArviZ'}`} />
              <Chip label={`Channels: ${modelInfo.channels?.length || 0}`} />
            </Box>
            {modelInfo.channels && (
              <Box>
                <Typography variant="body2" gutterBottom>Available Channels:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {modelInfo.channels.map((channel, index) => (
                    <Chip 
                      key={index} 
                      label={channel} 
                      size="small" 
                      variant="outlined" 
                      color="primary"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        )}
      </Collapse>

      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <List>
            {messages.map((msg, index) => (
              <React.Fragment key={index}>
                <ListItem sx={{ 
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  flexDirection: 'column',
                  py: 1
                }}>
                  <Box sx={{ 
                    display: 'flex',
                    flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    gap: 1,
                    width: '100%'
                  }}>
                    <Avatar sx={{ 
                      bgcolor: msg.sender === 'user' ? 'primary.main' : 
                               msg.source === 'fallback' ? 'warning.main' : 
                               msg.isError ? 'error.main' : 'secondary.main',
                      width: 40, 
                      height: 40
                    }}>
                      {msg.sender === 'user' ? <AccountCircleIcon /> : 
                       msg.source === 'fallback' ? <WarningIcon /> : 
                       <SmartToyIcon />}
                    </Avatar>
                    <Box sx={{ display: 'flex', flexDirection: 'column', maxWidth: '80%' }}>
                      {msg.sender === 'bot' && (
                        <Chip
                          size="small"
                          label={msg.source === 'gemini' ? 'Gemini AI' : 
                                msg.source === 'fallback' ? 'Model Only (No AI)' : 'Error'}
                          color={msg.source === 'gemini' ? 'success' : 
                                msg.source === 'fallback' ? 'warning' : 'error'}
                          sx={{ mb: 1, alignSelf: 'flex-start' }}
                        />
                      )}
                      <Paper sx={{ 
                        p: 2,
                        bgcolor: msg.sender === 'user' ? 'primary.light' : 
                                  msg.source === 'fallback' ? 'warning.light' :
                                  msg.isError ? 'error.light' : 'background.paper',
                        color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                        borderRadius: 2,
                      }}>
                        {msg.sender === 'bot' ? (
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        ) : (
                          <Typography sx={{ whiteSpace: 'pre-wrap' }}>{msg.text}</Typography>
                        )}
                      </Paper>
                    </Box>
                  </Box>
                  
                  {msg.chartUrls && msg.chartUrls.length > 0 && (
                    <Box sx={{ 
                      mt: 2, 
                      width: '100%', 
                      pl: msg.sender === 'user' ? 0 : 6,
                      pr: msg.sender === 'user' ? 6 : 0,
                    }}>
                      {msg.chartUrls.map((chartUrl, chartIndex) => (
                        <ChartRenderer 
                          key={chartIndex}
                          src={chartUrl}
                          title={`Analysis Chart ${chartIndex + 1}`}
                        />
                      ))}
                    </Box>
                  )}
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
            <div ref={messagesEndRef} />
          </List>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about marketing channels or simulate scenarios..."
            disabled={loading}
            multiline
            maxRows={4}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            endIcon={loading ? <CircularProgress size={24} /> : <SendIcon />}
          >
            Send
          </Button>
        </Box>
      </Paper>

      {/* Chat History Dialog */}
      <Dialog 
        open={historyOpen} 
        onClose={() => setHistoryOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Chat History
          <IconButton
            aria-label="close"
            onClick={() => setHistoryOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <List>
            {chatHistory.length > 0 ? (
              chatHistory.map((msg) => (
                <ListItem 
                  key={msg.id}
                  button
                  onClick={() => loadHistoricalMessage(msg.session_id, msg.id)}
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    bgcolor: msg.session_id === sessionId ? 'action.selected' : 'background.paper',
                    mb: 1,
                    borderRadius: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ 
                      width: 24, 
                      height: 24, 
                      mr: 1,
                      bgcolor: msg.sender === 'user' ? 'primary.main' : 'secondary.main'
                    }}>
                      {msg.sender === 'user' ? <AccountCircleIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(msg.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography 
                    sx={{ 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      width: '100%'
                    }}
                  >
                    {msg.text}
                  </Typography>
                  {msg.charts && msg.charts.length > 0 && (
                    <Chip 
                      label={`${msg.charts.length} chart(s)`} 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  )}
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No chat history found
              </Typography>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={startNewSession} color="primary">
            Start New Session
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}