export enum AppState {
  Idle = 'Idle',
  Generating = 'Generating',
  Ready = 'Ready',
  Pathfinding = 'Pathfinding',
  Animating = 'Animating',
  Replanning = 'Replanning',
  Error = 'Error'
}

export class AgentStateMachine {
  state: AppState = AppState.Idle;
  private listeners: ((state: AppState) => void)[] = [];

  transition(newState: AppState) {
    this.state = newState;
    this.listeners.forEach(l => l(this.state));
  }
  
  subscribe(listener: (state: AppState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    }
  }
}
