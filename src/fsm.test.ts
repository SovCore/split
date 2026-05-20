import { describe, it, expect } from 'vitest';
import { topLevelReducer, TopLevelState, splitReducer, SplitSubState, recoverReducer, RecoverSubState } from './fsm';

describe('TopLevel FSM', () => {
  it('should transition to DASHBOARD on INIT_SUCCESS', () => {
    const nextState = topLevelReducer(TopLevelState.INITIALIZING, { type: 'INIT_SUCCESS' });
    expect(nextState).toBe(TopLevelState.DASHBOARD);
  });

  it('should shred to DASHBOARD on FORCE_EMERGENCY_SHRED', () => {
    const nextState = topLevelReducer(TopLevelState.SPLIT_FLOW, { type: 'FORCE_EMERGENCY_SHRED' });
    expect(nextState).toBe(TopLevelState.DASHBOARD);
  });
});

describe('Split FSM', () => {
  it('should transition through standard split flow', () => {
    let state: SplitSubState = SplitSubState.IDLE;
    state = splitReducer(state, { type: 'INGEST_PAYLOAD' });
    expect(state).toBe(SplitSubState.PAYLOAD_INGESTION);
    
    state = splitReducer(state, { type: 'CONFIRM_INGESTION' });
    expect(state).toBe(SplitSubState.CONFIGURING);
  });
});

describe('Recover FSM', () => {
  it('should reset to IDLE on CLOSE_AND_ZEROIZE', () => {
    const state = recoverReducer(RecoverSubState.SUCCESS, { type: 'CLOSE_AND_ZEROIZE' });
    expect(state).toBe(RecoverSubState.IDLE);
  });
});
