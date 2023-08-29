'use client';
import {createContext, useEffect, useState,useContext} from 'react';
import {io} from 'socket.io-client';
import {useSearchParams} from "next/navigation";

const Context = createContext(undefined);

export default function GlobalProvider({ children }) {
  const searchParams = useSearchParams();
  const paramSessionId = searchParams.get('sessionId');
  const paramUserId = searchParams.get('userId');

  const [ socket, setSocket ] = useState(null);
  const [socketId, setSocketId] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if(!socket) {
      const socket = io('http://localhost:4000', { withCredentials: true });
      setSocket(socket);
    }
  }, []);

  useEffect(() => {
    if(socket) {
      socket.on('connect', () => {
        console.log('You are connected with socket id: ', socket.id);
        setSocketId(socket.id);
      });
    }
  }, [socket]);

  useEffect(() => {
    if(socketId) {
      socket.on('message', (msg) => {
        console.log('message: ' + msg);
        setMessages(currentMessages => [...currentMessages, msg]);
      });
    }
  }, [socketId]);

  const handleOnSelectSession = (session_id, user_id) => {
    const sessionId = session_id || paramSessionId;
    const userId = user_id || paramUserId;
    console.log('handleOnSelectSession', sessionId, '-', selectedSessionId);
    if(selectedSessionId === sessionId) {
      socket.emit('leaveSession', { sessionId, userId }, () => {
        console.log('leaving session: ', sessionId);
        setSelectedSessionId('');
        setMessages([])
      });
    } else if (selectedSessionId) {
      socket.emit('leaveSession', { sessionId: selectedSessionId, userId }, () => {
        console.log('leaving session: ', sessionId);
        setSelectedSessionId('');
        setMessages([])
        socket.emit('joinSession', { sessionId, userId }, () => {
          console.log('joining session: ', sessionId);
          setMessages([]);
          setSelectedSessionId(sessionId);
        });
      });
    } else {
      socket.emit('joinSession', { sessionId, userId }, () => {
        console.log('joining session: ', sessionId);
        setMessages([]);
        setSelectedSessionId(sessionId);
      });
    }
  }

  const sessionId = paramSessionId;
  return (
    <Context.Provider value={{
      socket,
      socketId,
      selectedSessionId,
      setSelectedSessionId,
      messages,
      setMessages,
      sessionId,
      handleOnSelectSession,
    }}>
      {children}
    </Context.Provider>
  );
}

export const useGlobalContext = () => {
  return useContext(Context);
};