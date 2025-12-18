import * as signalR from '@microsoft/signalr';
import API_URL from '../config';

let connection = null;
let startingPromise = null;

const getToken = () => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u?.token || null;
  } catch {
    return null;
  }
};

export const getChatHubConnection = () => {
  if (connection) return connection;

  const baseUrl = API_URL.replace(/\/api\/?$/i, '');

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${baseUrl}/hubs/chat`, {
      accessTokenFactory: () => getToken() || ''
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  return connection;
};

export const startChatHub = async () => {
  const conn = getChatHubConnection();
  if (conn.state === signalR.HubConnectionState.Connected) return conn;

  if (!startingPromise) {
    startingPromise = conn
      .start()
      .catch((e) => {
        startingPromise = null;
        throw e;
      })
      .then(() => {
        startingPromise = null;
        return conn;
      });
  }

  return startingPromise;
};

export const isChatHubConnected = () => {
  const conn = getChatHubConnection();
  return conn.state === signalR.HubConnectionState.Connected;
};

export const joinConversationGroup = async (conversationId) => {
  const conn = await startChatHub();
  try {
    await conn.invoke('JoinConversation', Number(conversationId));
  } catch {
  }
};

export const leaveConversationGroup = async (conversationId) => {
  const conn = getChatHubConnection();
  if (conn.state !== signalR.HubConnectionState.Connected) return;
  try {
    await conn.invoke('LeaveConversation', Number(conversationId));
  } catch {
  }
};
