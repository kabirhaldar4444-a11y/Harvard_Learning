import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/common/Header';
import AdminDashboard from './components/admin/AdminDashboard';
import CandidateDashboard from './components/candidate/CandidateDashboard';
import ExamPortal from './components/candidate/ExamPortal';
import AdminLogin from './pages/AdminLogin';
import CandidateLogin from './pages/CandidateLogin';
import Profile from './pages/Profile';
import Users from './pages/admin/Users';
import CreateUser from './components/admin/CreateUser';
import EditUser from './components/admin/EditUser';
import CompleteProfile from './pages/candidate/CompleteProfile';
import supabase from './utils/supabase';
import './index.css';

function App() {
  return (
    <div style={{ padding: '50px', background: 'black', color: 'white', minHeight: '100vh' }}>
      <h1>App.jsx is rendering!</h1>
      <p>Now we will re-enable pieces one by one.</p>
    </div>
  );
}

export default App;
