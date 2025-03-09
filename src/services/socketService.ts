
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

// Define the server URL with fallback options
// The server can be configured via environment variable or explicitly defined here
const SERVER_URLS = [
  // Try the user's Render.com deployment if provided
  // Replace this with your actual Render deployment URL once you have it
  "https://chatiwy-test.onrender.com",
  // Try the origin (if this app is deployed with the backend)
  window.location.origin.replace(/^https/, 'wss').replace(/^http/, 'ws'),
  // Try local development server
  'http://localhost:5000',
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
  private maxReconnectAttempts: number = 3;
  private currentServerIndex: number = 0;
  private connectionInProgress: boolean = false;
  private userId: string | null = null;
  private blockedUsers: Set<string> = new Set();
  public connectedUsers: Map<string, ConnectedUser> = new Map();
  private typingTimeout: NodeJS.Timeout | null = null;

  // Initialize the socket connection
  connect(): Promise<Socket> {
    if (this.connectionInProgress) {
      return Promise.reject(new Error('Connection attempt already in progress'));
    }
    
    this.connectionInProgress = true;
    
    return new Promise<Socket>((resolve, reject) => {
      this.tryNextServer(resolve, reject);
    }).finally(() => {
      this.connectionInProgress = false;
    });
  }
  
  private tryNextServer(resolve: (socket: Socket) => void, reject: (error: Error) => void): void {
    if (this.currentServerIndex >= SERVER_URLS.length) {
      console.error('All server connection attempts failed');
      toast.error('Unable to connect to chat server. Using offline mode.');
      reject(new Error('All connection attempts failed'));
      return;
    }
    
    const serverUrl = SERVER_URLS[this.currentServerIndex];
    console.log(`Attempting to connect to WebSocket server at: ${serverUrl} (attempt ${this.currentServerIndex + 1}/${SERVER_URLS.length})`);
    
    try {
      // Disconnect previous socket if it exists
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
      
      // Configure socket with better connection options
      this.socket = io(serverUrl, {
        reconnectionAttempts: 2,
        timeout: 5000,
        transports: ['websocket', 'polling'], // Try WebSocket first, fall back to polling
        extraHeaders: {
          "Access-Control-Allow-Origin": "*"
        }
      });

      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        console.log(`Connection timeout for server ${serverUrl}`);
        this.socket?.disconnect();
        this.currentServerIndex++;
        this.tryNextServer(resolve, reject);
      }, 7000);

      this.socket.on('connect', () => {
        console.log(`Connected to WebSocket server: ${serverUrl}`);
        clearTimeout(connectionTimeout);
        this.reconnectAttempts = 0;
        this.setupEventListeners();
        resolve(this.socket);
      });

      this.socket.on('connect_error', (error) => {
        console.error(`Connection error for ${serverUrl}:`, error);
        clearTimeout(connectionTimeout);
        
        // Try next server in the list
        this.currentServerIndex++;
        this.tryNextServer(resolve, reject);
      });
    } catch (error) {
      console.error(`Socket connection error for ${serverUrl}:`, error);
      this.currentServerIndex++;
      this.tryNextServer(resolve, reject);
    }
  }

  // Setup default event listeners
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      // Don't show toast for socket errors, only UI relevant errors
      // toast.error('Chat server error: ' + error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      
      // Don't show error toast for client-initiated disconnects
      if (reason !== 'io client disconnect') {
        // Don't show disconnection toasts to not interfere with chat
        console.log('Disconnected from chat server:', reason);
      }
    });

    // Reapply all previously registered callbacks
    this.registeredCallbacks.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket?.on(event, (...args) => {
          callback(...args);
        });
      });
    });
  }

  // Register a user with the server
  registerUser(userProfile: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject('Socket not connected');
        return;
      }

      this.socket.emit('register_user', userProfile);

      this.socket.once('registration_success', (data) => {
        this.userId = data.id; // Save the user ID for message sending
        resolve(data);
      });

      this.socket.once('registration_error', (error) => {
        reject(error);
      });
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

    this.socket.emit('send_message', enhancedMessage);
  }

  // Signal that the user is typing
  sendTyping(data: { to: string; isTyping: boolean }): void {
    if (!this.socket) return;
    
    // Don't send typing indicators to blocked users
    if (data.to && this.blockedUsers.has(data.to)) {
      return;
    }
    
    // Clear previous timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }
    
    // Send typing status
    this.socket.emit('typing', data);
    
    // Set auto-clear timeout for typing indicator
    if (data.isTyping) {
      this.typingTimeout = setTimeout(() => {
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
  
  // Retry connection
  retryConnection(): Promise<Socket> {
    this.currentServerIndex = 0; // Reset to try all servers again
    return this.connect();
  }

  // Update the server URL array with a custom URL
  setCustomServerUrl(url: string): void {
    if (url && typeof url === 'string' && url.trim() !== '') {
      // Insert the custom URL at the beginning of the array
      SERVER_URLS.splice(1, 0, url.trim());
      console.log("Added custom server URL:", url);
      console.log("Server URLs:", SERVER_URLS);
    }
  }
}

// Create and export a singleton instance
const socketService = new SocketService();
export default socketService;
