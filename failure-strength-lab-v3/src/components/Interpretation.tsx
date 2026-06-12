import { LabState, Status } from '../model/types';

export function Interpretation({ state, status }: { state: LabState; status: Status }) {
  return <div className="interp">
    <span className="badge" style={{ color: status.color }}>{status.badge}</span>
    <h3 className="result-title">{status.title}</h3>
    <p className="copy">{status.copy}</p>
    <div className="table">
      <div><span>Demand</span><b>{state.mode === 'fatigue' ? 'Repeated Δσ' : state.staticDemand}</b></div>
      <div><span>Material</span><b>{state.material}</b></div>
      <div><span>History</span><b>{state.mode === 'fatigue' ? 'Cyclic/fatigue' : 'Steady/static'}</b></div>
      <div><span>Not a</span><b>Code pass/fail</b></div>
    </div>
  </div>;
}
