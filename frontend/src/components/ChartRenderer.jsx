//fixing above
import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';

export default function ChartRenderer({ src, title = 'Marketing Analysis Chart' }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format the URL correctly (handle both relative and absolute paths)
  const formattedSrc = src && !src.startsWith('http') 
    ? `http://localhost:5000${src.startsWith('/') ? '' : '/'}${src}` 
    : src;

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3, textAlign: 'center', overflow: 'hidden' }}>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={40} />
        </Box>
      )}
      
      {error && (
        <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1, my: 2 }}>
          <Typography color="error.dark">
            Failed to load chart: {error}
          </Typography>
        </Box>
      )}
      
      {src && (
        <img
          src={formattedSrc}
          alt={title}
          onLoad={() => setLoading(false)}
          onError={(e) => {
            console.error("Image failed to load:", e);
            setLoading(false);
            setError(`Unable to load chart from ${formattedSrc}`);
          }}
          style={{
            maxWidth: '100%',
            height: 'auto',
            display: loading ? 'none' : 'block',
            borderRadius: '4px',
            margin: '0 auto'
          }}
        />
      )}
      
      {!loading && !error && (
        <Typography variant="subtitle2" sx={{ mt: 1, color: 'text.secondary' }}>
          {title}
        </Typography>
      )}
    </Paper>
  );
}