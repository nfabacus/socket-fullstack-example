require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true
  }
});

let sessions = [];

function formatSessions(sessions) {
  const sessionsWithUsers = sessions.reduce((acc, session) => {
    if(acc[session.sessionId]) {
      acc[session.sessionId].push(session.userId);
    } else {
      acc[session.sessionId] = [session.userId];
    }
    return acc;
  }, {});
  return Object.keys(sessionsWithUsers).map((key) => {
    return {
      sessionId: key,
      userIds: sessionsWithUsers[key]
    }
  });
}

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('chatMessage', (data) => {
    const {sendTos, message} = data;
    console.log('data >>>', data);
    if (sendTos.length > 0) {
      socket.to(sendTos).emit('message', data);
    }
  });
  socket.on('joinSession', ({ sessionId, userId }, callback) => {
    console.log('joinSession', sessionId, userId);
    socket.join(sessionId);
    sessions = [...sessions, { sessionId, userId }];
    console.log('join sessions', sessions, formatSessions(sessions));
    io.to('admin').emit('sessions', formatSessions(sessions));
    socket.on('leaveSession', ({ sessionId, userId }, callback) => {
      console.log('leaveSession', sessionId, userId);
      socket.leave(sessionId);
      sessions = sessions.filter((session, index) => !(session.sessionId === sessionId && session.userId === userId));

      io.to('admin').emit('sessions', formatSessions(sessions));
      callback();
    });
    socket.on('disconnect', () => {
      console.log('user disconnected');
      console.log('leaveSession sessions before', sessions);
      sessions = sessions.filter((session, index) => !(session.sessionId === sessionId && session.userId === userId));
      console.log('leaveSession sessions after', sessions);
      io.to('admin').emit('sessions', formatSessions(sessions));
    });
    callback();
  });
  socket.on('joinAdmin', (callback) => {
    socket.join('admin');
    socket.on('sessions', (callback)=> {
      console.log('sessions from joinAdmin', sessions);
      // todo: check if the user is authorized to get the sessions.
      callback(formatSessions(sessions));
    });
    callback();
  });
});

server.listen(4000, () => {
  console.log('listening on *:4000');
});