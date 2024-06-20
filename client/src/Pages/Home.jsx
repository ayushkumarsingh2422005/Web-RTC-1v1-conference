import React, { useEffect, useState } from 'react';
import { useSocket } from '../Providers/Socket';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const socket = useSocket();
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const navigate = useNavigate();

  const handleRoomJoin = () => {
    if (socket) {
      socket.emit('join-room', { roomId: room, email: email });
    }
  }

  const handleRoomJoined = ({ roomId }) => {
    navigate(`/room/${roomId}`);
  }

  useEffect(() => {
    if (socket) {
      socket.on('joined-room', handleRoomJoined);

      return () => {
        socket.off('joined-room', handleRoomJoined);
      };
    }
  }, [socket]);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <input
          type="email"
          placeholder="Enter email"
          className="block w-full px-4 py-2 border border-gray-300 rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter room ID"
          className="block w-full px-4 py-2 border border-gray-300 rounded mb-4"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <button
          className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          onClick={handleRoomJoin}
        >
          Enter room
        </button>
      </div>
    </div>
  );
}
