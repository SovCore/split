// PRD 6.1 - Finite State Machine (FSM) definition

export const TopLevelState = {
  INITIALIZING: "INITIALIZING",
  UNSUPPORTED_ENVIRONMENT: "UNSUPPORTED_ENVIRONMENT",
  DASHBOARD: "DASHBOARD",
  SPLIT_FLOW: "SPLIT_FLOW",
  RECOVER_FLOW: "RECOVER_FLOW"
} as const;
export type TopLevelState = typeof TopLevelState[keyof typeof TopLevelState];

export const SplitSubState = {
  IDLE: "IDLE",
  PAYLOAD_INGESTION: "PAYLOAD_INGESTION",
  CONFIGURING: "CONFIGURING",
  PROCESSING: "PROCESSING",
  EXPORTING: "EXPORTING",
  COMPLETE: "COMPLETE"
} as const;
export type SplitSubState = typeof SplitSubState[keyof typeof SplitSubState];

export const RecoverSubState = {
  IDLE: "IDLE",
  COLLECTING_SHARES: "COLLECTING_SHARES",
  VALIDATING_SIGNATURES: "VALIDATING_SIGNATURES",
  PROCESSING: "PROCESSING",
  SUCCESS: "SUCCESS",
  CRASH_REJECTION: "CRASH_REJECTION"
} as const;
export type RecoverSubState = typeof RecoverSubState[keyof typeof RecoverSubState];

// Memory Invariants specific to PRD 6.1
export interface SecureContextState {
  originalPayloadRef: number | null; // Pointer to WASM Linear Memory Address
  sharesOutputRef: number[] | null;  // Array of pointers to computed share arrays
  isContextHardened: boolean;        // Tracks crossOriginIsolated status
}

// Action Types for Top Level
export type TopLevelAction =
  | { type: "INIT_SUCCESS" }
  | { type: "INIT_FAILURE" }
  | { type: "SELECT_SPLIT" }
  | { type: "SELECT_RECOVER" }
  | { type: "GO_HOME" }
  | { type: "FORCE_EMERGENCY_SHRED" };

// Action Types for Split Flow
export type SplitAction =
  | { type: "INGEST_PAYLOAD" }
  | { type: "CONFIRM_INGESTION" }
  | { type: "EXECUTE_MATH" }
  | { type: "MATH_SUCCESS" }
  | { type: "PURGE_SHRED" };

// Action Types for Recover Flow
export type RecoverAction =
  | { type: "SET_RECOVERY_THRESHOLD"; payload: { k: number } }
  | { type: "START_VALIDATION" }
  | { type: "VALIDATION_SUCCESS" }
  | { type: "VALIDATION_FAILURE" }
  | { type: "RECONSTRUCTION_SUCCESS" }
  | { type: "CRASH_REJECTION" }
  | { type: "CLOSE_AND_ZEROIZE" }
  | { type: "RESET" };

// Reducers
export function topLevelReducer(state: TopLevelState, action: TopLevelAction): TopLevelState {
  switch (action.type) {
    case "INIT_SUCCESS":
      return state === TopLevelState.INITIALIZING ? TopLevelState.DASHBOARD : state;
    case "INIT_FAILURE":
      return TopLevelState.UNSUPPORTED_ENVIRONMENT;
    case "SELECT_SPLIT":
      return TopLevelState.SPLIT_FLOW;
    case "SELECT_RECOVER":
      return TopLevelState.RECOVER_FLOW;
    case "GO_HOME":
      return TopLevelState.DASHBOARD;
    case "FORCE_EMERGENCY_SHRED":
      // Immediate reset to dashboard, wiping local state is handled in components
      return TopLevelState.DASHBOARD;
    default:
      return state;
  }
}

export function splitReducer(state: SplitSubState, action: SplitAction): SplitSubState {
  switch (action.type) {
    case "INGEST_PAYLOAD":
      return state === SplitSubState.IDLE ? SplitSubState.PAYLOAD_INGESTION : state;
    case "CONFIRM_INGESTION":
      return state === SplitSubState.PAYLOAD_INGESTION ? SplitSubState.CONFIGURING : state;
    case "EXECUTE_MATH":
      return state === SplitSubState.CONFIGURING ? SplitSubState.PROCESSING : state;
    case "MATH_SUCCESS":
      return state === SplitSubState.PROCESSING ? SplitSubState.EXPORTING : state;
    case "PURGE_SHRED":
      return state === SplitSubState.EXPORTING ? SplitSubState.COMPLETE : state;
    default:
      return state;
  }
}

export function recoverReducer(state: RecoverSubState, action: RecoverAction): RecoverSubState {
  switch (action.type) {
    case "SET_RECOVERY_THRESHOLD":
      return state === RecoverSubState.IDLE ? RecoverSubState.COLLECTING_SHARES : state;
    case "START_VALIDATION":
      return state === RecoverSubState.COLLECTING_SHARES ? RecoverSubState.VALIDATING_SIGNATURES : state;
    case "VALIDATION_SUCCESS":
      return state === RecoverSubState.VALIDATING_SIGNATURES ? RecoverSubState.PROCESSING : state;
    case "VALIDATION_FAILURE":
      return state === RecoverSubState.VALIDATING_SIGNATURES ? RecoverSubState.COLLECTING_SHARES : state;
    case "RECONSTRUCTION_SUCCESS":
      return state === RecoverSubState.PROCESSING ? RecoverSubState.SUCCESS : state;
    case "CRASH_REJECTION":
      return state === RecoverSubState.PROCESSING ? RecoverSubState.CRASH_REJECTION : state;
    case "CLOSE_AND_ZEROIZE":
    case "RESET":
      return RecoverSubState.IDLE;
    default:
      return state;
  }
}
