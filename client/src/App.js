import React, { useState } from 'react';
import { Container } from '@material-ui/core';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar  from './components/Navbar/Navbar';
import Home    from './components/Home/Home';
import Auth    from './components/Auth/Auth';
import Profile from './components/Profile/Profile';
import Search  from './components/Search/Search';

const ProtectedRoute = ({ children }) => {
  const { idToken } = useSelector((s) => s.auth);
  return idToken ? children : <Navigate to="/auth" replace />;
};

const App = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <BrowserRouter>
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <Search open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Container maxWidth="lg" style={{ paddingTop: 16 }}>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/profile/:sub" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
};

export default App;
