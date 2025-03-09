
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { formatConnectionError, diagnoseWebSocketConnectivity } from '@/utils/chatUtils';

// Define the server URL with fallback options
// The server can be configured via environment variable or explicitly defined here
const SERVER_URLS = [
  // Primary server URL (user provided)
  "https://chatiwy-connection-space.onrender.com",
  // Try HTTP version if HTTPS fails
  "http://chatiwy-connection-space.onrender.com",
  // Try WebSocket protocols explicitly
  "wss://chatiwy-connection-space.onrender.com",
  "ws://chatiwy-connection-space.onrender.com",
  // Try the origin (if this app is deployed with the backend)
  window.location.origin.replace(/^https/, 'wss').replace(/^http/, 'ws'),
  // Alternative WebSocket protocol if 'wss://' doesn't work
  window.location.origin,
  // Try local development server with different ports
  'http://localhost:5000',
  'http://localhost:3001',
  'http://localhost:8080',
  'ws://localhost:5000',
  'ws://localhost:3001',
  'ws://localhost:8080',
  // Add additional fallback servers here if needed
].filter(Boolean); // Remove undefined values

// Create an interface for connected users
interface ConnectedUser {
  id: string;
  username: string;
  isBot?: boolean;
  isAdmin?: boolean;
  isOnline?: boolean;
  lastSeen?: Date;
  sessionId?: string;
}

// Define the message interface
interface MessageData {
  to?: string;
  content: string;
  messageId?: string;
  image?: {
    url: string;
    blurred: boolean;
  };
}

// Create a class to manage socket connections
class SocketService {
  private socket: Socket | null = null;
  private registeredCallbacks: Map<string, Function[]> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 7; // Increased from 5
  private currentServerIndex: number = 0;
  private connectionInProgress: boolean = false;
  private userId: string | null = null;
  private blockedUsers: Set<string> = new Set();
  public connectedUsers: Map<string, ConnectedUser> = new Map();
  private typingTimeoutRef: NodeJS.Timeout | null = null;
  private connectionTimer: NodeJS.Timeout | null = null;
  private lastError: string | null = null;
  private successfulConnectionUrl: string | null = null;
  private connectionDiagnostics: Record<string, any> = {};
  private messageCallbacks: Map<string, (data: any) => void> = new Map();

  // Initialize the socket connection
  connect(): Promise<Socket> {
    if (this.connectionInProgress) {
      return Promise.reject(new Error('Connection attempt already in progress'));
    }
    
    console.log('Starting socket connection attempt...');
    this.connectionInProgress = true;
    this.reconnectAttempts += 1;
    
    // Reset server index if we've exceeded max reconnect attempts
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
      
      // Log connection diagnostics
      console.debug('Connection diagnostics:', this.connectionDiagnostics);
      
      toast.error('Unable to connect to chat server. Using offline mode.');
      reject(new Error('All connection attempts failed'));
      return;
    }
    
    const serverUrl = SERVER_URLS[this.currentServerIndex];
    console.log(`Attempting to connect to WebSocket server at: ${serverUrl} (attempt ${this.currentServerIndex + 1}/${SERVER_URLS.length})`);
    
    // Run diagnostic check before attempting connection
    try {
      const diagnosis = await diagnoseWebSocketConnectivity(serverUrl);
      this.connectionDiagnostics[serverUrl] = diagnosis;
      
      if (diagnosis.canConnect) {
        console.log(`Diagnostic check successful for ${serverUrl}: ${JSON.stringify(diagnosis)}`);
      } else {
        console.warn(`Diagnostic check failed for ${serverUrl}: ${JSON.stringify(diagnosis)}`);
        // If diagnostic clearly shows we can't connect, try next server
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
      // Disconnect previous socket if it exists
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
      
      // Clear any existing connection timer
      if (this.connectionTimer) {
        clearTimeout(this.connectionTimer);
      }
      
      // Configure socket with better connection options
      this.socket = io(serverUrl, {
        reconnectionAttempts: 3,
        timeout: 15000, // Increased timeout
        transports: ['websocket', 'polling'], // Try WebSocket first, fall back to polling
        forceNew: true, // Force a new connection
        extraHeaders: {
          "Access-Control-Allow-Origin": "*"
        }
      });

      // Set a connection timeout
      this.connectionTimer = setTimeout(() => {
        console.log(`Connection timeout for server ${serverUrl}`);
        
        // Log detailed debugging information
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
      }, 15000); // Increased from 12000

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
        
        // Try next server in the list
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

  // Setup default event listeners
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.lastError = formatConnectionError(error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      
      // Don't show error toast for client-initiated disconnects
      if (reason !== 'io client disconnect') {
        console.log('Disconnected from chat server:', reason);
      }
    });

    // Add explicit message event handler
    this.socket.on('message', (data) => {
      console.log('Received message event:', data);
      
      // Process the message and notify any registered callbacks
      this.processIncomingMessage(data);
    });

    // Add a ping/pong to check connection health
    setInterval(() => {
      if (this.socket?.connected) {
        const start = Date.now();
        
        this.socket.emit('ping', () => {
          const latency = Date.now() - start;
          console.debug(`WebSocket latency: ${latency}ms`);
        });
      }
    }, 30000);

    // Reapply all previously registered callbacks
    this.registeredCallbacks.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket?.on(event, (...args) => {
          callback(...args);
        });
      });
    });
  }

  // Process incoming messages
  private processIncomingMessage(data: any) {
    try {
      console.log('Processing incoming message:', data);
      // Check if the message is from a blocked user
      if (data.from && this.blockedUsers.has(data.from)) {
        console.log(`Ignoring message from blocked user: ${data.from}`);
        return;
      }

      // Notify any registered callbacks for 'receive_message'
      const callbacks = this.registeredCallbacks.get('receive_message') || [];
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in message callback:', error);
        }
      });
    } catch (error) {
      console.error('Error processing incoming message:', error);
    }
  }

  // Register a user with the server
  registerUser(userProfile: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject('Socket not connected');
        return;
      }

      console.log('Attempting to register user:', userProfile.username);
      
      this.socket.emit('register_user', userProfile);

      // Add timeouts to prevent hanging
      const registrationTimeout = setTimeout(() => {
        reject('Registration timeout. Server did not respond in time.');
      }, 15000);

      this.socket.once('registration_success', (data) => {
        clearTimeout(registrationTimeout);
        console.log('User registration successful:', data);
        this.userId = data.id; // Save the user ID for message sending
        
        // Automatically subscribe to message events for this user
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
  
  // Set up message receiving after registration
  private setupMessageReceiving() {
    if (!this.socket || !this.userId) return;
    
    console.log(`Setting up message receiving for user ID: ${this.userId}`);
    
    // Listen for direct messages to this user
    this.socket.on('direct_message', (data) => {
      console.log('Received direct message:', data);
      this.processIncomingMessage(data);
    });
    
    // Listen for general messages (if applicable)
    this.socket.on('chat_message', (data) => {
      console.log('Received chat message:', data);
      this.processIncomingMessage(data);
    });
  }

  // Add user to blocked list
  addBlockedUser(userId: string): void {
    this.blockedUsers.add(userId);
  }

  // Remove user from blocked list
  removeBlockedUser(userId: string): void {
    this.blockedUsers.delete(userId);
  }

  // Check if user is blocked
  isUserBlocked(userId: string): boolean {
    return this.blockedUsers.has(userId);
  }

  // Get all blocked users
  getBlockedUsers(): string[] {
    return Array.from(this.blockedUsers);
  }

  // Send a message
  sendMessage(message: MessageData): void {
    if (!this.socket) {
      console.error('Cannot send message: Socket not connected');
      toast.warning('Message sent in offline mode');
      return;
    }

    // Check if recipient is blocked
    if (message.to && this.blockedUsers.has(message.to)) {
      toast.error('Cannot send message to blocked user');
      return;
    }

    const enhancedMessage = {
      ...message,
      from: this.userId, // Include sender's ID
      recipientId: message.to, // Ensure recipientId is set explicitly
      messageId: message.messageId || Math.random().toString(36).substring(2, 15)
    };

    console.log('Sending message:', enhancedMessage);
    this.socket.emit('send_message', enhancedMessage);
    
    // Also listen for acknowledgment of this specific message
    const messageId = enhancedMessage.messageId;
    this.socket.once(`message_sent_${messageId}`, (confirmation) => {
      console.log('Message sent confirmation:', confirmation);
    });
  }

  // Signal that the user is typing
  sendTyping(data: { to: string; isTyping: boolean }): void {
    if (!this.socket) return;
    
    // Don't send typing indicators to blocked users
    if (data.to && this.blockedUsers.has(data.to)) {
      return;
    }
    
    // Clear previous timeout
    if (this.typingTimeoutRef) {
      clearTimeout(this.typingTimeoutRef);
      this.typingTimeoutRef = null;
    }
    
    // Send typing status
    this.socket.emit('typing', data);
    
    // Set auto-clear timeout for typing indicator
    if (data.isTyping) {
      this.typingTimeoutRef = setTimeout(() => {
        if (this.socket && data.to) {
          this.socket.emit('typing', { to: data.to, isTyping: false });
        }
      }, 5000);
    }
  }

  // Block a user
  blockUser(userId: string): void {
    if (!this.socket) return;
    
    // Add to local blocked list
    this.addBlockedUser(userId);
    
    // Emit block event to server
    this.socket.emit('block_user', userId);
  }

  // Subscribe to an event
  on(event: string, callback: Function): void {
    if (!this.socket) {
      console.error('Cannot subscribe to event: Socket not connected');
      return;
    }

    console.log(`Subscribing to event: ${event}`);
    
    // Store callback for potential reconnects
    if (!this.registeredCallbacks.has(event)) {
      this.registeredCallbacks.set(event, []);
    }
    this.registeredCallbacks.get(event)?.push(callback);

    // Add the listener
    this.socket.on(event, (...args) => {
      callback(...args);
    });
  }

  // Unsubscribe from an event
  off(event: string, callback?: Function): void {
    if (!this.socket) return;

    if (callback) {
      // Remove specific callback
      const callbacks = this.registeredCallbacks.get(event) || [];
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
        this.registeredCallbacks.set(event, callbacks);
      }
      this.socket.off(event, callback as any);
    } else {
      // Remove all callbacks for this event
      this.registeredCallbacks.delete(event);
      this.socket.off(event);
    }
  }

  // Check if socket is connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Disconnect the socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Get the socket ID
  getSocketId(): string | null {
    return this.socket?.id || null;
  }
  
  // Get the user ID
  getUserId(): string | null {
    return this.userId;
  }
  
  // Get the last error message
  getLastError(): string | null {
    return this.lastError;
  }
  
  // Get connection details for debugging
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
  
  // Get connection diagnostics
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
  
  // Run a diagnostic test
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
  
  // Get all attempted servers and their status
  getAttemptedServers(): { url: string, status: string, diagnostic: any }[] {
    return Object.keys(this.connectionDiagnostics).map(url => ({
      url,
      status: url === this.successfulConnectionUrl ? 'connected' : 'failed',
      diagnostic: this.connectionDiagnostics[url]
    }));
  }

  // Retry connection
  retryConnection(): Promise<Socket> {
    console.log('Manually retrying connection...');
    this.currentServerIndex = 0; // Reset to try all servers again
    this.reconnectAttempts = 1;  // Reset reconnect attempts counter
    return this.connect();
  }

  // Update the server URL array with a custom URL
  setCustomServerUrl(url: string): void {
    if (url && typeof url === 'string' && url.trim() !== '') {
      // Insert the custom URL at the beginning of the array if it's not already there
      const trimmedUrl = url.trim();
      if (!SERVER_URLS.includes(trimmedUrl)) {
        SERVER_URLS.unshift(trimmedUrl);
        console.log("Added custom server URL:", url);
        console.log("Server URLs:", SERVER_URLS);
      }
    }
  }
}

// Create and export a singleton instance
const socketService = new SocketService();
export default socketService;
