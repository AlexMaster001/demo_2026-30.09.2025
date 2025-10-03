// src/App.jsx
import { useState } from "react";
import { Routes, Route, HashRouter } from 'react-router-dom';
import LoginForm from "./LoginForm";
import Store from "./Store";
import Orders from "./Orders";

function App() {
  const [user, setUser] = useState({ role: 'не авторизован', name: null });
  const [notification, setNotification] = useState(null);

  const showNotification = (text, type = 'info') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <>
      <img className="logo" src="/assets/icon.JPG" alt="icon" />
      {user.name ? <h1>{`${user.name} | Роль: ${user.role}`}</h1> : <h1>Гость</h1>}
      
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.text}
        </div>
      )}

      <HashRouter>
        <Routes>
          <Route path='/' element={<LoginForm setUser={setUser} showNotification={showNotification} />} />
          <Route path='/main' element={<Store user={user} setUser={setUser} showNotification={showNotification} />} />
          <Route path='/orders' element={<Orders user={user} showNotification={showNotification} />} />
        </Routes>
      </HashRouter>
    </>
  );
}

export default App;
