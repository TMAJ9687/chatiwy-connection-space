import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { formatConnectionError, diagnoseWebSocketConnectivity } from '@/utils/chatUtils';

const SERVER_URLS = [
  "https://chatiwy-connection-space.onrender.com",
  "http://chatiwy-connection-space.onrender.com",
  "wss://chatiwy-connection-space.onrender.com",
  "ws://chatiwy-connection-space.onrender.com",
  window.location.origin.replace(/^https/, 'wss').replace(/^http/, 'ws'),
  window.location.origin,
  "http://localhost:5000",
  "http://localhost:3001",
  "http://localhost:8080",
  "ws://localhost:5000",
  "ws://localhost:3001",
  "ws://localhost:8080"
].filter(Boolean);

interface ConnectedUser {
  id: string;
  username: string;
  isBot?: boolean;
  isAdmin?: boolean;
  isOnline?: boolean;
  lastSeen?: Date;
  sessionId?: string;
}

interface MessageData {
  to?: string;
  from?: string;
  sender?: string;
  content: string;
  messageId?: string;
  image?: {
    url: string;
    blurred: boolean;
  };
}

class SocketService {
  private socket: Socket | null = null;
  private registeredCallbacks: Map<string, Function[]> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 7;
  private currentServerIndex: number = 0;
  private connectionInProgress: boolean = false;
  private userId: string | null = null;
  private username: string | null = null;
  private blockedUsers: Set<string> = new Set();
  public connectedUsers: Map<string, ConnectedUser> = new Map();
  private typingTimeoutRef: NodeJS.Timeout | null = null;
  private connectionTimer: NodeJS.Timeout | null = null;
  private lastError: string | null = null;
  private successfulConnectionUrl: string | null = null;
  private connectionDiagnostics: Record<string, any> = {};
  private messageCallbacks: Map<string, (data: any) => void> = new Map();
  private activeListeners: Set<string> = new Set();

  connect(): Promise<Socket> {
    if (this.connectionInProgress) {
      return Promise.reject(new Error('Connection attempt already in progress'));
    }
    
    console.log('Starting socket connection attempt...');
    this.connectionInProgress = true;
    this.reconnectAttempts += 1;
    
    if (this.reconnectAttempts > this.maxReconnectAttempts) {
      console.log(`Exceeded max reconnect attempts (${this.maxReconnectAttempts}). Resetting server index.`);
      this.currentServerIndex = 0;
      this.reconnectAttempts = 1;
    }
    
    return new Promise<Socket>((resolve, reject) => {
      this.tryNextServer(resolve, reject);
    }).finally(() => {
      this.connectionInProgress = false;
    });
  }

  private async tryNextServer(resolve: (socket: Socket) => void, reject: (error: Error) => void): Promise<void> {
    if (this.currentServerIndex >= SERVER_URLS.length) {
      console.error('All server connection attempts failed');
      this.lastError = 'All connection attempts failed';
      
      console.debug('Connection diagnostics:', this.connectionDiagnostics);
      
      toast.error('Unable to connect to chat server. Using offline mode.');
      reject(new Error('All connection attempts failed'));
      return;
    }
    
    const serverUrl = SERVER_URLS[this.currentServerIndex];
    console.log(`Attempting to connect to WebSocket server at: ${serverUrl} (attempt ${this.currentServerIndex + 1}/${SERVER_URLS.length})`);
    
    try {
      const diagnosis = await diagnoseWebSocketConnectivity(serverUrl);
      this.connectionDiagnostics[serverUrl] = diagnosis;
      
      if (diagnosis.canConnect) {
        console.log(`Diagnostic check successful for ${serverUrl}: ${JSON.stringify(diagnosis)}`);
      } else {
        console.warn(`Diagnostic check failed for ${serverUrl}: ${JSON.stringify(diagnosis)}`);
        if (diagnosis.error?.includes('WebSocket initialization error') || 
            diagnosis.error?.includes('HTTP connection failed')) {
          console.log(`Skipping ${serverUrl} due to diagnosis failure`);
          this.currentServerIndex++;
          this.tryNextServer(resolve, reject);
          return;
        }
      }
    } catch (error) {
      console.warn(`Error running diagnostic for ${serverUrl}:`, error);
    }
    
    try {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
      
      if (this.connectionTimer) {
        clearTimeout(this.connectionTimer);
      }
      
      this.socket = io(serverUrl, {
        reconnectionAttempts: 3,
        timeout: 15000,
        transports: ['websocket', 'polling'],
        forceNew: true,
        extraHeaders: {
          "Access-Control-Allow-Origin": "*"
        }
      });

      this.connectionTimer = setTimeout(() => {
        console.log(`Connection timeout for server ${serverUrl}`);
        
        console.debug('Connection details:', {
          url: serverUrl,
          attempt: this.currentServerIndex + 1,
          totalServers: SERVER_URLS.length,
        });
        
        if (this.socket) {
          this.socket.disconnect();
        }
        this.currentServerIndex++;
        this.tryNextServer(resolve, reject);
      }, 15000);

      this.socket.on('connect', () => {
        console.log(`Connected to WebSocket server: ${serverUrl}`);
        if (this.connectionTimer) {
          clearTimeout(this.connectionTimer);
        }
        this.reconnectAttempts = 0;
        this.lastError = null;
        this.successfulConnectionUrl = serverUrl;
        this.setupEventListeners();
        resolve(this.socket);
      });

      this.socket.on('connect_error', (error) => {
        console.error(`Connection error for ${serverUrl}:`, error);
        this.lastError = formatConnectionError(error);
        
        console.debug('Connection error details:', {
          url: serverUrl,
          error: this.lastError,
          transportType: this.socket?.io?.engine?.transport?.name,
        });
        
        if (this.connectionTimer) {
          clearTimeout(this.connectionTimer);
        }
        
        this.currentServerIndex++;
        this.tryNextServer(resolve, reject);
      });
    } catch (error) {
      console.error(`Socket connection error for ${serverUrl}:`, error);
      this.lastError = formatConnectionError(error);
      
      if (this.connectionTimer) {
        clearTimeout(this.connectionTimer);
      }
      
      this.currentServerIndex++;
      this.tryNextServer(resolve, reject);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.lastError = formatConnectionError(error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      
      if (reason !== 'io client disconnect') {
        console.log('Disconnected from chat server:', reason);
      }
    });

    const messageEvents = ['message', 'direct_message', 'chat_message', 'receive_message'];
    
    messageEvents.forEach(eventType => {
      if (!this.activeListeners.has(eventType)) {
        this.socket?.on(eventType, (data) => {
          console.log(`Received ${eventType} event:`, data);
          this.processIncomingMessage(data);
        });
        this.activeListeners.add(eventType);
      }
    });

    if (!this.activeListeners.has('*')) {
      this.socket.onAny((eventName, ...args) => {
        console.log(`Received event ${eventName}:`, args);
        if (eventName.includes('message') && args.length > 0) {
          this.processIncomingMessage(args[0]);
        }
      });
      this.activeListeners.add('*');
    }

    setInterval(() => {
      if (this.socket?.connected) {
        const start = Date.now();
        
        this.socket.emit('ping', () => {
          const latency = Date.now() - start;
          console.debug(`WebSocket latency: ${latency}ms`);
        });
      }
    }, 30000);

    this.registeredCallbacks.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket?.on(event, (...args) => {
          callback(...args);
        });
      });
    });
  }

  private processIncomingMessage(data: any) {
    try {
      console.log('Processing incoming message:', data);
      
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          data = { content: data };
        }
      }
      
      const normalizedData = this.normalizeMessageData(data);
      
      if (!normalizedData.content && !normalizedData.image) {
        console.log('Skipping empty message');
        return;
      }
      
      if (normalizedData.from && this.blockedUsers.has(normalizedData.from)) {
        console.log(`Ignoring message from blocked user: ${normalizedData.from}`);
        return;
      }

      const callbacks = this.registeredCallbacks.get('receive_message') || [];
      callbacks.forEach(callback => {
        try {
          callback(normalizedData);
        } catch (error) {
          console.error('Error in message callback:', error);
        }
      });
    } catch (error) {
      console.error('Error processing incoming message:', error);
    }
  }

  private normalizeMessageData(data: any): any {
    const normalized: any = { ...data };
    
    normalized.from = data.from || data.senderId || data.userId || data.sender;
    normalized.sender = data.sender || data.username || data.from || 'Unknown';
    normalized.content = data.content || data.message || data.text || '';
    normalized.timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
    normalized.messageId = data.messageId || data.id || Math.random().toString(36).substring(2, 15);
    
    if (data.image) {
      normalized.image = data.image;
    }
    
    return normalized;
  }

  registerUser(userProfile: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject('Socket not connected');
        return;
      }

      console.log('Attempting to register user:', userProfile.username);
      
      this.username = userProfile.username;
      this.userId = userProfile.id;
      
      const profileWithId = {
        ...userProfile,
        originalId: userProfile.id
      };
      
      this.socket.emit('register_user', profileWithId);

      const registrationTimeout = setTimeout(() => {
        reject('Registration timeout. Server did not respond in time.');
      }, 15000);

      this.socket.once('registration_success', (data) => {
        clearTimeout(registrationTimeout);
        console.log('User registration successful:', data);
        
        if (data.id) {
          this.userId = data.id;
        }
        
        this.setupMessageReceiving();
        
        resolve(data);
      });

      this.socket.once('registration_error', (error) => {
        clearTimeout(registrationTimeout);
        console.error('User registration error:', error);
        reject(error);
      });
    });
  }

  private setupMessageReceiving() {
    if (!this.socket || !this.userId) return;
    
    console.log(`Setting up message receiving for user ID: ${this.userId}`);
    
    const messageEvents = ['message', 'direct_message', 'chat_message', 'receive_message'];
    
    messageEvents.forEach(eventType => {
      if (!this.activeListeners.has(eventType)) {
        this.socket?.on(eventType, (data) => {
          console.log(`Received ${eventType} event:`, data);
          this.processIncomingMessage(data);
        });
        this.activeListeners.add(eventType);
      }
    });
    
    this.socket.emit('subscribe', { userId: this.userId, username: this.username });
  }

  addBlockedUser(userId: string): void {
    this.blockedUsers.add(userId);
  }

  removeBlockedUser(userId: string): void {
    this.blockedUsers.delete(userId);
  }

  isUserBlocked(userId: string): boolean {
    return this.blockedUsers.has(userId);
  }

  getBlockedUsers(): string[] {
    return Array.from(this.blockedUsers);
  }

  sendMessage(message: MessageData): void {
    if (!this.socket) {
      console.error('Cannot send message: Socket not connected');
      toast.warning('Message sent in offline mode');
      return;
    }

    if (message.to && this.blockedUsers.has(message.to)) {
      toast.error('Cannot send message to blocked user');
      return;
    }

    const enhancedMessage = {
      ...message,
      from: this.userId,
      senderId: this.userId,
      sender: this.username,
      username: this.username,
      recipientId: message.to,
      to: message.to,
      messageId: message.messageId || Math.random().toString(36).substring(2, 15),
      timestamp: new Date()
    };

    console.log('Sending message:', enhancedMessage);
    
    this.socket.emit('send_message', enhancedMessage);
    this.socket.emit('direct_message', enhancedMessage);
    this.socket.emit('message', enhancedMessage);
    
    const messageId = enhancedMessage.messageId;
    this.socket.once(`message_sent_${messageId}`, (confirmation) => {
      console.log('Message sent confirmation:', confirmation);
    });
  }

  sendTyping(data: { to: string; isTyping: boolean }): void {
    if (!this.socket) return;
    
    if (data.to && this.blockedUsers.has(data.to)) {
      return;
    }
    
    if (this.typingTimeoutRef) {
      clearTimeout(this.typingTimeoutRef);
      this.typingTimeoutRef = null;
    }
    
    this.socket.emit('typing', {
      ...data,
      username: this.username
    });
    
    if (data.isTyping) {
      this.typingTimeoutRef = setTimeout(() => {
        if (this.socket && data.to) {
          this.socket.emit('typing', { 
            to: data.to, 
            isTyping: false,
            username: this.username
          });
        }
      }, 5000);
    }
  }

  blockUser(userId: string): void {
    if (!this.socket) return;
    
    this.addBlockedUser(userId);
    
    this.socket.emit('block_user', userId);
  }

  on(event: string, callback: Function): void {
    if (!this.socket) {
      console.error('Cannot subscribe to event: Socket not connected');
      return;
    }

    console.log(`Subscribing to event: ${event}`);
    
    if (!this.registeredCallbacks.has(event)) {
      this.registeredCallbacks.set(event, []);
    }
    this.registeredCallbacks.get(event)?.push(callback);

    this.socket.on(event, (...args) => {
      callback(...args);
    });
    
    this.activeListeners.add(event);
  }

  off(event: string, callback?: Function): void {
    if (!this.socket) return;

    if (callback) {
      const callbacks = this.registeredCallbacks.get(event) || [];
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
        this.registeredCallbacks.set(event, callbacks);
      }
      this.socket.off(event, callback as any);
    } else {
      this.registeredCallbacks.delete(event);
      this.socket.off(event);
      this.activeListeners.delete(event);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocketId(): string | null {
    return this.socket?.id || null;
  }

  getUserId(): string | null {
    return this.userId;
  }

  getUsername(): string | null {
    return this.username;
  }

  getLastError(): string | null {
    return this.lastError;
  }

  getConnectionDetails(): {
    connected: boolean;
    currentUrl: string | null;
    lastError: string | null;
    reconnectAttempts: number;
    transport?: string;
  } {
    return {
      connected: this.isConnected(),
      currentUrl: this.currentServerIndex < SERVER_URLS.length ? 
        SERVER_URLS[this.currentServerIndex] : null,
      lastError: this.lastError,
      reconnectAttempts: this.reconnectAttempts,
      transport: this.socket?.io?.engine?.transport?.name
    };
  }

  getDiagnostics(): Record<string, any> {
    return {
      connectionDiagnostics: this.connectionDiagnostics,
      successfulUrl: this.successfulConnectionUrl,
      currentAttempt: this.currentServerIndex + 1,
      totalServers: SERVER_URLS.length,
      reconnectAttempts: this.reconnectAttempts,
      isConnected: this.isConnected(),
      lastError: this.lastError,
      transport: this.socket?.io?.engine?.transport?.name
    };
  }

  async runDiagnostic(url: string = ''): Promise<any> {
    const serverUrl = url || (this.currentServerIndex < SERVER_URLS.length ? 
                             SERVER_URLS[this.currentServerIndex] : SERVER_URLS[0]);
    try {
      return await diagnoseWebSocketConnectivity(serverUrl);
    } catch (error) {
      return {
        canConnect: false,
        error: formatConnectionError(error)
      };
    }
  }

  getAttemptedServers(): { url: string, status: string, diagnostic: any }[] {
    return Object.keys(this.connectionDiagnostics).map(url => ({
      url,
      status: url === this.successfulConnectionUrl ? 'connected' : 'failed',
      diagnostic: this.connectionDiagnostics[url]
    }));
  }

  retryConnection(): Promise<Socket> {
    console.log('Manually retrying connection...');
    this.currentServerIndex = 0;
    this.reconnectAttempts = 1;
    return this.connect();
  }

  setCustomServerUrl(url: string): void {
    if (url && typeof url === 'string' && url.trim() !== '') {
      const trimmedUrl = url.trim();
      if (!SERVER_URLS.includes(trimmedUrl)) {
        SERVER_URLS.unshift(trimmedUrl);
        console.log("Added custom server URL:", url);
        console.log("Server URLs:", SERVER_URLS);
      }
    }
  }
}

const socketService = new SocketService();
export default socketService;
