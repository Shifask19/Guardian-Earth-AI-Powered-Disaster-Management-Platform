import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';

import Navbar from './components/Navbar';
import Home from './pages/Home';
// import Dashboard from './pages/Dashboard'; // Replaced with DashboardNew
import Map from './pages/Map';
import Alerts from './pages/Alerts';
import Volunteers from './pages/Volunteers';
import Donations from './pages/Donations';
import News from './pages/News';
import Community from './pages/Community';
import Preparedness from './pages/Preparedness';
import Chatbot from './pages/Chatbot';
import Login from './pages/Login';
import Register from './pages/Register';
import Demo from './pages/Demo';
import SafetyZone from './pages/SafetyZone';
import DashboardNew from './pages/DashboardNew';
import CommunityNew from './pages/CommunityNew';
import NewsNew from './pages/NewsNew';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import RealTimeStatus from './components/RealTimeStatus';
import NotificationCenter from './components/NotificationCenter';
import './i18n';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Green for earth/nature
    },
    secondary: {
      main: '#FF6B35', // Orange for alerts/warnings
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
});

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <SocketProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <div className="App">
                <Navbar />
                <NotificationCenter />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/dashboard" element={<DashboardNew />} />
                  {/* <Route path="/dashboard-old" element={<Dashboard />} /> */}
                  <Route path="/map" element={<Map />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/volunteers" element={<Volunteers />} />
                  <Route path="/donations" element={<Donations />} />
                  <Route path="/news" element={<NewsNew />} />
                  <Route path="/news-old" element={<News />} />
                  <Route path="/community" element={<CommunityNew />} />
                  <Route path="/community-old" element={<Community />} />
                  <Route path="/preparedness" element={<Preparedness />} />
                  <Route path="/chatbot" element={<Chatbot />} />
                  <Route path="/demo" element={<Demo />} />
                  <Route path="/safety-zone" element={<SafetyZone />} />
                </Routes>
                <RealTimeStatus />
              </div>
            </Router>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;