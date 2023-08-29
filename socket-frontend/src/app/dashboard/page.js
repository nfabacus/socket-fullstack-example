'use client';

import { useState, useEffect } from 'react';
import {useGlobalContext} from "@/app/components/Providers/GlobalProvider";
import ChatBox from "@/app/components/ChatBox";

export default function Dashboard() {
  const { socket, socketId, selectedSessionId, handleOnSelectSession } = useGlobalContext();
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if(socketId) {
      socket.emit('joinAdmin', () => {
        socket.emit('sessions', (sessions) => {
          console.log('sessions >>> ', sessions);
          setSessions(sessions);
          socket.on('sessions', (sessions) => {
            setSessions(sessions);
          });
        });
      });
    }
  }, [socketId]);

  const handleOnSessionSelect = (sessionId) => {
    handleOnSelectSession(sessionId, 'adminUser1');
  };

  console.log('sessions', sessions);

  const isMatchingSession = (sessionId) => {
    return selectedSessionId === sessionId;
  }

  return (
    <main className="min-h-screen p-24">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div>
        <h2 className="text-xl">Sessions</h2>
        <ul>
          {
            sessions.map((session, index) => (
              <li key={index}>
                <button className={`border border-2 border-blue-950 px-2 mb-2 ${isMatchingSession(session.sessionId) ? 'bg-cyan-200' : ''}`} onClick={() => handleOnSessionSelect(session?.sessionId)}>
                  {session?.sessionId}: {session?.userIds?.length}
                </button>
              </li>
            ))
          }
        </ul>
      </div>
      <div>
        {
          selectedSessionId && (
            <ChatBox hideSessionButton />
          )
        }
      </div>
    </main>
  )
}