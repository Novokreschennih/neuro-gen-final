import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import PinValidation from './components/PinValidation';
import MainApp from './components/MainApp';
import { AUTH_STORAGE_KEY, APP_ID } from './constants';
import useLocalStorage from './hooks/useLocalStorage';

type View = 'landing' | 'pin' | 'app';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage(AUTH_STORAGE_KEY, false);
  
  // Determine initial view. If authenticated, go to app. Otherwise, start at landing.
  const getInitialView = (): View => {
    if (isAuthenticated) {
      return 'app';
    }
    return 'landing';
  };

  const [view, setView] = useState<View>(getInitialView());

  const handleEnter = () => {
    setView('pin');
  };

  const handleSuccess = () => {
    setIsAuthenticated(true);
    setView('app');
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    setView('landing');
  };

  // Render component based on the current view
  switch (view) {
    case 'landing':
      return <LandingPage onEnter={handleEnter} />;
    case 'pin':
      return <PinValidation onSuccess={handleSuccess} appId={APP_ID} />;
    case 'app':
      // If user is not authenticated but somehow lands here, redirect to landing
      if (!isAuthenticated) {
        return <LandingPage onEnter={handleEnter} />;
      }
      return <MainApp onLogout={handleLogout} />;
    default:
      return <LandingPage onEnter={handleEnter} />;
  }
}

export default App;
