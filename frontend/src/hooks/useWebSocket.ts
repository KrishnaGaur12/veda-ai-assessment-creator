"use client";

import { useEffect } from "react";
import wsClient from "@/lib/websocket";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import { WSMessage } from "@/types";

export const useWebSocket = () => {
  const {
    setWsConnected,
    setJobStatus,
    updateAssignment,
    setProcessingAssignmentId,
  } = useAssignmentStore();

  useEffect(() => {
    wsClient.connect();

    const removeListener = wsClient.addListener((message: WSMessage) => {
      switch (message.type) {
        case "connected":
          setWsConnected(true);
          break;

        case "job:processing":
          if (message.assignmentId) {
            setJobStatus("processing");
            setProcessingAssignmentId(message.assignmentId);
            updateAssignment(message.assignmentId, { status: "processing" });
          }
          break;

        case "job:complete":
          if (message.assignmentId) {
            setJobStatus("done");
            setProcessingAssignmentId(null);
            updateAssignment(message.assignmentId, { status: "done" });
          }
          break;

        case "job:failed":
          if (message.assignmentId) {
            setJobStatus("failed");
            setProcessingAssignmentId(null);
            updateAssignment(message.assignmentId, { status: "failed" });
          }
          break;
      }
    });

    return () => {
      removeListener();
      wsClient.disconnect();
      setWsConnected(false);
    };
  }, [setWsConnected, setJobStatus, updateAssignment, setProcessingAssignmentId]);

  return {
    isConnected: useAssignmentStore((state) => state.wsConnected),
  };
};

export default useWebSocket;
