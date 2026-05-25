import { WSMessage } from "@/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5000";

type WSCallback = (message: WSMessage) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private listeners: WSCallback[] = [];
  private reconnectInterval: number = 3000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect: boolean = true;

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log("🔌 WebSocket connected");
        this.notifyListeners({
          type: "connected",
          message: "WebSocket connected",
        });
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const message: WSMessage = JSON.parse(event.data as string);
          this.notifyListeners(message);
        } catch (error) {
          console.error("❌ Failed to parse WebSocket message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("🔌 WebSocket disconnected");
        if (this.shouldReconnect) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error: Event) => {
        console.error("❌ WebSocket error:", error);
      };
    } catch (error) {
      console.error("❌ Failed to create WebSocket connection:", error);
      if (this.shouldReconnect) {
        this.scheduleReconnect();
      }
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      console.log("🔄 Attempting WebSocket reconnection...");
      this.connect();
    }, this.reconnectInterval);
  }

  disconnect(): void {
    this.shouldReconnect = false;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  addListener(callback: WSCallback): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners(message: WSMessage): void {
    this.listeners.forEach((callback) => {
      try {
        callback(message);
      } catch (error) {
        console.error("❌ WebSocket listener error:", error);
      }
    });
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
const wsClient = new WebSocketClient();

export default wsClient;
