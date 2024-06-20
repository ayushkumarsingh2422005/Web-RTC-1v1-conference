import { useState } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import { SocketProvider } from './Providers/Socket'
import Room from './Pages/Room'
import { PeerProvider } from './Providers/Peer'

function App() {

  return (
    <div>
      <SocketProvider>
        <PeerProvider>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/room/:roomId' element={<Room />} />
          </Routes>
        </PeerProvider>
      </SocketProvider>
    </div>
  )
}

export default App
