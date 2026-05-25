import { create } from "zustand";
import { Assignment, GeneratedPaper, JobStatus } from "@/types";

interface AssignmentState {
  assignments: Assignment[];
  currentPaper: GeneratedPaper | null;
  jobStatus: JobStatus;
  wsConnected: boolean;
  processingAssignmentId: string | null;

  // Actions
  setAssignments: (assignments: Assignment[]) => void;
  addAssignment: (assignment: Assignment) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  setCurrentPaper: (paper: GeneratedPaper | null) => void;
  setJobStatus: (status: JobStatus) => void;
  setWsConnected: (connected: boolean) => void;
  setProcessingAssignmentId: (id: string | null) => void;
}

export const useAssignmentStore = create<AssignmentState>((set) => ({
  assignments: [],
  currentPaper: null,
  jobStatus: "idle",
  wsConnected: false,
  processingAssignmentId: null,

  setAssignments: (assignments: Assignment[]) => set({ assignments }),

  addAssignment: (assignment: Assignment) =>
    set((state) => ({
      assignments: [assignment, ...state.assignments],
    })),

  updateAssignment: (id: string, updates: Partial<Assignment>) =>
    set((state) => ({
      assignments: state.assignments.map((a) =>
        a._id === id ? { ...a, ...updates } : a
      ),
    })),

  deleteAssignment: (id: string) =>
    set((state) => ({
      assignments: state.assignments.filter((a) => a._id !== id),
    })),

  setCurrentPaper: (paper: GeneratedPaper | null) =>
    set({ currentPaper: paper }),

  setJobStatus: (status: JobStatus) => set({ jobStatus: status }),

  setWsConnected: (connected: boolean) => set({ wsConnected: connected }),

  setProcessingAssignmentId: (id: string | null) =>
    set({ processingAssignmentId: id }),
}));

export default useAssignmentStore;
