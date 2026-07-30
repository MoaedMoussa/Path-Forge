import { describe, it, expect, vi } from 'vitest';
import { AgentStateMachine, AppState } from '../agent/agentStateMachine';

describe('AgentStateMachine initial state', () => {
  it('starts in the Idle state', () => {
    const asm = new AgentStateMachine();
    expect(asm.state).toBe(AppState.Idle);
  });
});

describe('AgentStateMachine.transition', () => {
  it('changes state to the new state', () => {
    const asm = new AgentStateMachine();
    asm.transition(AppState.Generating);
    expect(asm.state).toBe(AppState.Generating);
  });

  it('supports all defined states', () => {
    const asm = new AgentStateMachine();
    const states = [
      AppState.Generating,
      AppState.Ready,
      AppState.Pathfinding,
      AppState.Animating,
      AppState.Replanning,
      AppState.Error,
      AppState.Idle,
    ];
    for (const s of states) {
      asm.transition(s);
      expect(asm.state).toBe(s);
    }
  });

  it('notifies all subscribed listeners on each transition', () => {
    const asm = new AgentStateMachine();
    const spy1 = vi.fn();
    const spy2 = vi.fn();
    asm.subscribe(spy1);
    asm.subscribe(spy2);
    asm.transition(AppState.Ready);
    expect(spy1).toHaveBeenCalledWith(AppState.Ready);
    expect(spy2).toHaveBeenCalledWith(AppState.Ready);
  });

  it('calls listener with the new state value', () => {
    const asm = new AgentStateMachine();
    const received: AppState[] = [];
    asm.subscribe(s => received.push(s));
    asm.transition(AppState.Pathfinding);
    asm.transition(AppState.Animating);
    expect(received).toEqual([AppState.Pathfinding, AppState.Animating]);
  });
});

describe('AgentStateMachine.subscribe / unsubscribe', () => {
  it('returns an unsubscribe function', () => {
    const asm = new AgentStateMachine();
    const unsub = asm.subscribe(() => {});
    expect(typeof unsub).toBe('function');
  });

  it('stops receiving events after unsubscribe', () => {
    const asm = new AgentStateMachine();
    const spy = vi.fn();
    const unsub = asm.subscribe(spy);
    asm.transition(AppState.Generating);
    unsub();
    asm.transition(AppState.Ready);
    // Listener was called once (before unsub), not twice
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('unsubscribing one listener does not silence others', () => {
    const asm = new AgentStateMachine();
    const spyA = vi.fn();
    const spyB = vi.fn();
    const unsubA = asm.subscribe(spyA);
    asm.subscribe(spyB);
    unsubA();
    asm.transition(AppState.Ready);
    expect(spyA).not.toHaveBeenCalled();
    expect(spyB).toHaveBeenCalledWith(AppState.Ready);
  });

  it('multiple independent instances do not share listeners', () => {
    const a = new AgentStateMachine();
    const b = new AgentStateMachine();
    const spyA = vi.fn();
    const spyB = vi.fn();
    a.subscribe(spyA);
    b.subscribe(spyB);
    a.transition(AppState.Generating);
    expect(spyA).toHaveBeenCalledTimes(1);
    expect(spyB).not.toHaveBeenCalled();
  });
});
