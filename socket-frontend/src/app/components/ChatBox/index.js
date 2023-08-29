'use client';
import { useState, useEffect } from 'react';
import {useGlobalContext} from "@/app/components/Providers/GlobalProvider";

export default function ChatBox({ hideSessionButton=false }) {
  const { socket, socketId, selectedSessionId, sessionId, handleOnSelectSession, messages, setMessages } = useGlobalContext();
  const [chatText, setChatText] = useState('');

  const handleSetChatText = (e) => {
    setChatText(e.target.value);
  }

  const handleOnSubmit = (e) => {
    e.preventDefault();
    console.log('chatText', chatText);
    if(chatText && selectedSessionId) {
      setMessages(currentMessages => [...currentMessages, {message: chatText}]);
      socket.emit('chatMessage', {message: chatText, sendTos: [selectedSessionId] });
      setChatText('');
    }
  }

  return (
    <main className="min-h-screen p-24">
      <h1 className="text-2xl font-bold">Chat</h1>
      <h2>SocketId: {socketId}</h2>
      {
        !hideSessionButton && (
          <button className={`border border-blue-950 p-2 mb-2 mr-2 ${selectedSessionId ? "bg-cyan-200" : ""}`} onClick={() => handleOnSelectSession()}>{selectedSessionId ? "Leave" : "Join"} {sessionId || selectedSessionId}</button>
        )
      }
      <div>
        {
          selectedSessionId && (
            <div>
              <div>
                {messages.map((message, index) => (
                  <div key={index}>{message.message}</div>
                ))}
              </div>
              <form onSubmit={handleOnSubmit}>
                <input
                  id="text"
                  name="text"
                  type="text"
                  placeholder="chat text"
                  className="block border border-1 border-blue-950 mb-2"
                  value={chatText}
                  onChange={handleSetChatText}
                />
                <input type="submit" value="submit" />
              </form>
            </div>
          )
        }
      </div>
    </main>
  )
}
