
import React, { useState, useRef, useEffect } from 'react';
import { Box, VStack, Input, Button, Flex } from '@chakra-ui/react';
import Message from './Message';

function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      sender: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        sender: 'bot',
        content: data.candidates[0].content.parts[0].text,
        timestamp: new Date(),
        chartUrl: data.model_results?.chart_url
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        sender: 'bot',
        content: 'Sorry, there was an error processing your request.',
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={6} bg="white" height="500px" display="flex" flexDirection="column">
      <VStack flex={1} overflowY="auto" spacing={4} align="stretch">
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </VStack>
      <Box as="form" onSubmit={handleSubmit} mt={4}>
        <Flex gap={2}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your marketing mix model..."
            disabled={loading}
          />
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={loading}
            loadingText="Sending"
          >
            Send
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}

export default ChatInterface;