import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";

interface WSMessage {
  type: string;
  assignmentId?: string;
  result?: unknown;
  error?: string;
}

let wss: WebSocketServer | null = null;

export const initWebSocket = (server: Server): WebSocketServer => {
  wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket) => {
    console.log("🔌 WebSocket client connected");

    ws.on("message", (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString()) as WSMessage;
        console.log("📩 WS message received:", data.type);
      } catch (error) {
        console.error("❌ Invalid WebSocket message format");
      }
    });

    ws.on("close", () => {
      console.log("🔌 WebSocket client disconnected");
    });

    ws.on("error", (error: Error) => {
      console.error(`❌ WebSocket error: ${error.message}`);
    });

    // Send connection acknowledgment
    ws.send(JSON.stringify({ type: "connected", message: "WebSocket connected to VedaAI" }));
  });

  console.log("✅ WebSocket server initialized");
  return wss;
};

export const broadcastMessage = (message: WSMessage): void => {
  if (!wss) {
    console.error("❌ WebSocket server not initialized");
    return;
  }

  const payload = JSON.stringify(message);

  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
};

export const sendToClient = (ws: WebSocket, message: WSMessage): void => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
};

export const getWSS = (): WebSocketServer | null => wss;

export default { initWebSocket, broadcastMessage, sendToClient, getWSS };
