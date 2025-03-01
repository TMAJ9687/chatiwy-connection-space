
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

// Define the server URL with fallback options
// In development, try connecting to the local server first
// For the Lovable environment, we need to use a different approach
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const SERVER_URL = isLocalhost 
  ? 'http://localhost:5000' 
  : window.location.origin.replace(/^https/, 'http');

// Create a class to manage socket connections
class SocketService {
  private socket: Socket | null = null;
  private registeredCallbacks: Map<string, Function[]> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;

  // Initialize the socket connection
  connect(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      try {
        console.log('Attempting to connect to WebSocket server at:', SERVER_URL);
        
        // Configure socket with better connection options
        this.socket = io(SERVER_URL, {
          reconnectionAttempts: this.maxReconnectAttempts,
          timeout: 5000,
          transports: ['websocket', 'polling'], // Try WebSocket first, fall back to polling
        });

        this.socket.on('connect', () => {
          console.log('Connected to WebSocket server');
          this.reconnectAttempts = 0;
          resolve(this.socket as Socket);
        });

        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          this.reconnectAttempts++;
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            toast.error('Unable to connect to chat server. Using offline mode.');
            reject(error);
          } else {
            console.log(`Connection attempt ${this.reconnectAttempts} failed, retrying...`);
          }
        });

        // Setup default event listeners
        this.setupEventListeners();
      } catch (error) {
        console.error('Socket connection error:', error);
        toast.error('Unable to connect to chat server. Using offline mode.');
        reject(error);
      }
    });
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
}

// Create and export a singleton instance
const socketService = new SocketService();
export default socketService;
