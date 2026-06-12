import { LabState, Status } from '../model/types';

export function Interpretation({ state, status }: { state: LabState; status: Status }) {
  const isFatigue = state.mode === 'fatigue';
  return <div className="interp">
    <span className="badge" style={{ color: status.color }}>{status.badge}</span>
    <h3 className="result-title">{status.title}</h3>
    <p className="copy">{status.copy}</p>
    <div className="table">
      <div><span>Demand</span><b>{isFatigue ? 'Repeated Δσ' : state.staticDemand}</b></div>
      <div><span>Material</span><b>{isFatigue ? 'Ductile metallic pipe' : state.material}</b></div>
      <div><span>History</span><b>{isFatigue ? 'Cyclic metal fatigue' : 'Steady/static'}</b></div>
      <div><span>Brittle</span><b>{isFatigue ? 'Concept text only' : 'Shown in static tab'}</b></div>
      <div><span>Not a</span><b>Code pass/fail</b></div>
    </div>
  </div>;
}
