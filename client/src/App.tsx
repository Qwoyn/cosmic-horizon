import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Game from './pages/Game';
import * as api from './services/api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = useCallback(async (username: string, password: string) => {
    const { data } = await api.login(username, password);
    setIsLoggedIn(true);
    return data.player;
  }, []);

  const handleRegister = useCallback(async (username: string, email: string, password: string, race: string) => {
    const { data } = await api.register(username, email, password, race);
    setIsLoggedIn(true);
    return data.player;
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onRegister={handleRegister} />} />
        <Route path="/game" element={isLoggedIn ? <Game /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={isLoggedIn ? '/game' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
