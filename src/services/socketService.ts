import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

// Define the server URL with fallback options
// The server can be configured via environment variable or explicitly defined here
const SERVER_URLS = [
  // Try connecting to a production server if defined
  process.env.REACT_APP_SOCKET_SERVER,
  // Try the user's Render.com deployment if provided
  // Replace this with your actual Render deployment URL once you have it
  "https://your-chatiwy-server.onrender.com",
  // Try the origin (if this app is deployed with the backend)
  window.location.origin.replace(/^https/, 'wss').replace(/^http/, 'ws'),
  // Try local development server
  'http://localhost:5000',
  // Add additional fallback servers here if needed
].filter(Boolean); // Remove undefined values

// Create a class to manage socket connections
class SocketService {
  private socket: Socket | null = null;
  private registeredCallbacks: Map<string, Function[]> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;
  private currentServerIndex: number = 0;
  private connectionInProgress: boolean = false;

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
        resolve(this.socket as Socket);
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
      toast.error('Chat server error: ' + error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      
      // Don't show error toast for client-initiated disconnects
      if (reason !== 'io client disconnect') {
        toast.error('Disconnected from chat server. Trying to reconnect...');
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
        resolve(data);
      });

      this.socket.once('registration_error', (error) => {
        reject(error);
      });
    });
  }

  // Send a message
  sendMessage(message: { to?: string; content: string }): void {
    if (!this.socket) {
      console.error('Cannot send message: Socket not connected');
      toast.warning('Message sent in offline mode');
      return;
    }
    this.socket.emit('send_message', message);
  }

  // Signal that the user is typing
  sendTyping(data: { to: string; isTyping: boolean }): void {
    if (!this.socket) return;
    this.socket.emit('typing', data);
  }

  // Block a user
  blockUser(userId: string): void {
    if (!this.socket) return;
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
