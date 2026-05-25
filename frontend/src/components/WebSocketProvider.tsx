"use client";

import React from "react";
import useWebSocket from "@/hooks/useWebSocket";

export const WebSocketProvider: React.FC = () => {
  useWebSocket();
  return null;
};
