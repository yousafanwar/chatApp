import './App.css'
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import ChatView from './views/ChatView';
import LoginView from './views/LoginView';

function App() {

  return (
    <Routes>
      <Route path='/login' element={<LoginView />} />
      <Route path='/' element={<ChatView />} />
    </Routes>
  )
}

export default App
