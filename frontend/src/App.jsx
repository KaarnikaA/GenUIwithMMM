
// //simplified 
// //src/app.jsx
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { ThemeProvider, createTheme } from '@mui/material/styles';
// import CssBaseline from '@mui/material/CssBaseline';
// import ChatInterface from './components/ChatInterface';

// const theme = createTheme({
//   palette: {
//     mode: 'dark',
//     primary: {
//       main: '#3f51b5',
//     },
//     secondary: {
//       main: '#f50057',
//     },
//     background: {
//       default: '#121212',
//       paper: '#1e1e1e',
//     },
//   },
//   typography: {
//     fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
//   },
// });
// const handleSubmit = async (e, customInput) => {
//   e.preventDefault();
//   const question = customInput || input;
//   if (!question.trim()) return;
  
//   setLoading(true);
//   const userMessage = { text: question, sender: 'user' };
//   setMessages(prev => [...prev, userMessage]);
//   if (!customInput) setInput('');
  
//   try {
//     const isSimulation = question.toLowerCase().includes('what if') || 
//                         question.toLowerCase().includes('simulate') ||
//                         question.toLowerCase().includes('increase') ||
//                         question.toLowerCase().includes('decrease');

//     let response;
//     if (isSimulation) {
//       const parts = question.toLowerCase().split(' ');
//       const type = parts.includes('increase') ? 'increase' : 'decrease';
//       const channelIndex = parts.findIndex(p => 
//         ['tv', 'digital', 'radio', 'print', 'outdoor'].includes(p)
//       );
//       const channel = channelIndex >= 0 ? parts[channelIndex] : '';
//       const percentageIndex = parts.findIndex(p => p.includes('%'));
//       const percentage = percentageIndex >= 0 ? 
//         parseInt(parts[percentageIndex].replace('%', '')) : 10;

//       response = await fetch('http://localhost:5000/simulate-scenario', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           scenario: {
//             channel_increase: {
//               channel: channel.charAt(0).toUpperCase() + channel.slice(1),
//               percentage: type === 'increase' ? percentage : -percentage
//             }
//           }
//         })
//       });
//     } else {
//       response = await fetch('http://localhost:5000/chat', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ message: question })
//       });
//     }
    
//     if (!response.ok) {
//       throw new Error(`Server returned ${response.status}`);
//     }
    
//     const data = await response.json();
    
//     let botMessage = { 
//       text: data.error ? `Error: ${data.error}` : 
//            data.candidates?.[0]?.content?.parts?.[0]?.text || 
//            "Received analysis response",
//       sender: 'bot', 
//       charts: [], 
//       data: data.model_results || data 
//     };
    
//     // Handle chart URLs safely
//     if (data.model_results?.chart_url) {
//       botMessage.charts = [data.model_results.chart_url];
//     } else if (data.model_results?.channel_charts) {
//       botMessage.charts = data.model_results.channel_charts
//         .filter(c => c.chart_url)
//         .map(c => c.chart_url);
//     } else if (data.chart_url) {
//       botMessage.charts = [data.chart_url];
//     }
    
//     setMessages(prev => [...prev, botMessage]);
//   } catch (error) {
//     setMessages(prev => [...prev, { 
//       text: `Error processing request: ${error.message}`, 
//       sender: 'bot',
//       isError: true
//     }]);
//   } finally {
//     setLoading(false);
//   }
// };
// function App() {
//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <Router>
//         <div className="app">
//           <Routes>
//             <Route path="/" element={<ChatInterface />} />
//           </Routes>
//         </div>
//       </Router>
//     </ThemeProvider>
//   );
// }

// export default App;


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//with neon db
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ChatInterface from './components/ChatInterface';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5',
      light: '#757de8',
      dark: '#002984',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f50057',
      light: '#ff5983',
      dark: '#bb002f',
      contrastText: '#ffffff',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '8px 16px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(63, 81, 181, 0.16)',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className="app" style={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
            <Routes>
              <Route path="/" element={<ChatInterface />} />
              <Route path="/chat" element={<ChatInterface />} />
              <Route path="*" element={<ChatInterface />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </LocalizationProvider>
  );
}

export default App;