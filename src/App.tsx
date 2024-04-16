import { Route, Routes } from 'react-router-dom'
import './App.css'
import { Chat } from './pages/Chat'
import { Groupchat } from './pages/Groupchat'
import Login from './pages/Login'
import { MyChats } from './pages/MyChats'

function App() {
  return (
    <div className='App'>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/chat' element={<Chat />} />
        <Route path='/groupchat' element={<Groupchat />} />
        <Route path='/mychats' element={<MyChats />} />
      </Routes>
    </div>
  )
}

export default App
