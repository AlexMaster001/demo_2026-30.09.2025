import LoginForm from "./LoginForm"
import Store from "./Store"
import { useState } from "react"
import { Routes, Route, HashRouter } from 'react-router'

function App() {

  const [user, setUser] = useState({ role: 'не авторизован', name: null })
  return (
    <>
      <img className="logo" src="src/assets/icon.JPG" alt="icon" />
      {user.name ? <h1>{`${user.name} Роль: ${user.role}`}</h1> : <h1>Гость</h1>}
      <HashRouter>
        <Routes>
          <Route path='/' element={<LoginForm setUser={setUser} />} />
          <Route path='/main' element={<Store user={user} setUser={setUser} />} />
        </Routes>
      </HashRouter>
    </>
  )
}

export default App

