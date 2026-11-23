import { useState } from 'react';

export default function DFAVisualizer({ dfaResult, password }) {
  const [activeTab, setActiveTab] = useState('diagram'); // 'diagram' | 'table' | 'formal'
  const [selectedStep, setSelectedStep] = useState(null);

  const {
    accepted,
    currentState,
    isTrap,
    trapReason,
    transitions = [],
    details = {}
  } = dfaResult || {};

  const currentLength = details.length || 0;
  const actualLength = details.actualLength || password.length || 0;

  // Derive current step transition if any
  const latestTransition = transitions.length > 0 ? transitions[transitions.length - 1] : null;
  const inspectedStep = selectedStep !== null && transitions[selectedStep] ? transitions[selectedStep] : latestTransition;

  return (
    <div className="dfa-visualizer-container">
      {/* Header with status badges */}
      <div className="dfa-visualizer-header">
        <div className="dfa-title-group">
          <h3>Deterministic Finite Automaton (DFA) Visualizer</h3>
          <span className="dfa-formal-tag">5-Tuple: M = (Q, Σ, δ, q₀, F)</span>
        </div>

        <div className="dfa-tab-controls">
          <button
            type="button"
            className={`dfa-tab-btn ${activeTab === 'diagram' ? 'active' : ''}`}
            onClick={() => setActiveTab('diagram')}
          >
            State Diagram
          </button>
          <button
            type="button"
            className={`dfa-tab-btn ${activeTab === 'table' ? 'active' : ''}`}
            onClick={() => setActiveTab('table')}
          >
            Transition Table
          </button>
          <button
            type="button"
            className={`dfa-tab-btn ${activeTab === 'formal' ? 'active' : ''}`}
            onClick={() => setActiveTab('formal')}
          >
            Formal 5-Tuple
          </button>
        </div>
      </div>

      {/* Real-time State Banner */}
      <div className={`dfa-state-banner ${isTrap ? 'trap' : accepted ? 'accept' : 'active'}`}>
        <div className="state-badge-group">
          <span className="state-label">CURRENT DFA STATE:</span>
          <code className="state-code">{password.length === 0 ? 'q0_U0_L0_D0_S0 (Start)' : currentState}</code>
        </div>
        <div className="state-status-indicator">
          {isTrap ? (
            <span className="status-pill status-trap">⚠ TRAP STATE (REJECTED)</span>
          ) : accepted ? (
            <span className="status-pill status-accept">★ ACCEPT STATE REACHED</span>
          ) : password.length === 0 ? (
            <span className="status-pill status-waiting">○ WAITING FOR INPUT</span>
          ) : (
            <span className="status-pill status-eval">● EVALUATING INPUT (q{currentLength})</span>
          )}
        </div>
      </div>

      {isTrap && trapReason && (
        <div className="dfa-trap-alert">
          <span className="alert-icon">🚫</span>
          <div>
            <strong>DFA Transitioned to Trap State:</strong> {trapReason}
            <div className="trap-subtext">The input string was rejected by the automaton. No further valid state can be reached.</div>
          </div>
        </div>
      )}

      {/* TAB 1: INTERACTIVE STATE DIAGRAM */}
      {activeTab === 'diagram' && (
        <div className="dfa-diagram-panel">
          {/* Interactive Automaton State Graph (SVG) */}
          <div className="dfa-svg-wrapper">
            <svg viewBox="0 0 860 220" className="dfa-svg" preserveAspectRatio="xMidYMid meet">
              <defs>
                {/* Arrow markers */}
                <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#475569" />
                </marker>
                <marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#38bdf8" />
                </marker>
                <marker id="arrow-accept" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#22c55e" />
                </marker>
                <marker id="arrow-trap" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#ef4444" />
                </marker>

                {/* Filter for glow */}
                <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Start state indicator arrow */}
              <line x1="15" y1="90" x2="45" y2="90" stroke="#94a3b8" strokeWidth="2.5" markerEnd="url(#arrow)" />
              <text x="18" y="75" fill="#94a3b8" fontSize="11" fontWeight="600">Start</text>

              {/* Horizontal state sequence: q0 -> q1 -> q2 -> q3 -> q4 -> q5 -> q6 -> q7 -> q8 */}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((step, idx) => {
                const cx = 70 + idx * 78;
                const cy = 90;
                const isCurrentLength = !isTrap && currentLength === step && password.length > 0;
                const isPassed = !isTrap && currentLength > step;

                return (
                  <g key={`node-${step}`} className="dfa-node-group">
                    {/* Connecting line to next node */}
                    {idx < 8 && (
                      <line
                        x1={cx + 22}
                        y1={cy}
                        x2={cx + 78 - 22}
                        y2={cy}
                        stroke={isPassed ? '#38bdf8' : '#334155'}
                        strokeWidth={isPassed ? 2.5 : 1.5}
                        markerEnd={isPassed ? 'url(#arrow-active)' : 'url(#arrow)'}
                      />
                    )}

                    {/* Node circle */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="22"
                      fill={isCurrentLength ? '#0f2942' : isPassed ? '#132337' : '#0b1329'}
                      stroke={isCurrentLength ? '#38bdf8' : isPassed ? '#0284c7' : '#334155'}
                      strokeWidth={isCurrentLength ? 3 : 2}
                      filter={isCurrentLength ? 'url(#glow-blue)' : undefined}
                    />

                    {/* Self loop on q8 for lengths > 8 */}
                    {step === 8 && (
                      <path
                        d={`M ${cx - 10} ${cy - 22} A 16 16 0 1 1 ${cx + 10} ${cy - 22}`}
                        fill="none"
                        stroke={!isTrap && actualLength >= 8 ? '#38bdf8' : '#334155'}
                        strokeWidth="1.5"
                        markerEnd="url(#arrow)"
                      />
                    )}
                    {step === 8 && (
                      <text x={cx} y={cy - 45} textAnchor="middle" fill="#64748b" fontSize="9">Σ (len&gt;8)</text>
                    )}

                    {/* Node label */}
                    <text
                      x={cx}
                      y={cy + 4}
                      textAnchor="middle"
                      fill={isCurrentLength ? '#38bdf8' : isPassed ? '#bae6fd' : '#94a3b8'}
                      fontSize="12"
                      fontWeight="700"
                    >
                      {`q${step}`}
                    </text>

                    {/* Sub-label */}
                    <text
                      x={cx}
                      y={cy + 34}
                      textAnchor="middle"
                      fill={isCurrentLength ? '#38bdf8' : '#64748b'}
                      fontSize="9"
                    >
                      {step === 0 ? 'len=0' : step === 8 ? 'len≥8' : `len=${step}`}
                    </text>
                  </g>
                );
              })}

              {/* Arrow from q8 to Accept State */}
              <line
                x1={70 + 8 * 78 + 22}
                y1={90}
                x2={795 - 26}
                y2={90}
                stroke={accepted ? '#22c55e' : '#334155'}
                strokeWidth={accepted ? 3 : 1.5}
                markerEnd={accepted ? 'url(#arrow-accept)' : 'url(#arrow)'}
              />

              {/* ACCEPT STATE (Double circle) */}
              <g className="dfa-accept-node">
                <circle
                  cx="800"
                  cy="90"
                  r="26"
                  fill={accepted ? '#052e16' : '#0b1329'}
                  stroke={accepted ? '#22c55e' : '#334155'}
                  strokeWidth={accepted ? 3 : 2}
                  filter={accepted ? 'url(#glow-green)' : undefined}
                />
                <circle
                  cx="800"
                  cy="90"
                  r="21"
                  fill="none"
                  stroke={accepted ? '#4ade80' : '#1e293b'}
                  strokeWidth="1.5"
                />
                <text
                  x="800"
                  y="94"
                  textAnchor="middle"
                  fill={accepted ? '#4ade80' : '#64748b'}
                  fontSize="11"
                  fontWeight="800"
                >
                  F
                </text>
                <text
                  x="800"
                  y="128"
                  textAnchor="middle"
                  fill={accepted ? '#4ade80' : '#64748b'}
                  fontSize="9"
                  fontWeight="600"
                >
                  ACCEPT
                </text>
              </g>

              {/* TRAP STATE (Below main line) */}
              <g className="dfa-trap-node">
                {/* Arrow to trap state when in trap */}
                {isTrap && (
                  <path
                    d="M 380 115 Q 430 150 480 165"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    markerEnd="url(#arrow-trap)"
                  />
                )}

                <circle
                  cx="510"
                  cy="175"
                  r="20"
                  fill={isTrap ? '#450a0a' : '#111827'}
                  stroke={isTrap ? '#ef4444' : '#374151'}
                  strokeWidth={isTrap ? 3 : 1.5}
                />
                <text
                  x="510"
                  y="179"
                  textAnchor="middle"
                  fill={isTrap ? '#fca5a5' : '#4b5563'}
                  fontSize="10"
                  fontWeight="700"
                >
                  TRAP
                </text>
                <text
                  x="510"
                  y="204"
                  textAnchor="middle"
                  fill={isTrap ? '#ef4444' : '#4b5563'}
                  fontSize="8"
                >
                  Dead State
                </text>

                {/* Self-loop on Trap State */}
                <path
                  d="M 526 185 A 12 12 0 1 1 526 165"
                  fill="none"
                  stroke={isTrap ? '#ef4444' : '#374151'}
                  strokeWidth="1.2"
                  markerEnd="url(#arrow)"
                />
              </g>
            </svg>
          </div>

          {/* Condition Gates Status Matrix */}
          <div className="dfa-gates-container">
            <h4>DFA Product State Vector Components (Flags)</h4>
            <div className="dfa-gates-grid">
              <div className={`dfa-gate-card ${details.hasUpper ? 'gate-active' : ''}`}>
                <span className="gate-bit">{details.hasUpper ? 'U = 1' : 'U = 0'}</span>
                <span className="gate-title">Uppercase Letter [A-Z]</span>
                <span className="gate-status">{details.hasUpper ? '✓ Verified' : '○ Not Met'}</span>
              </div>

              <div className={`dfa-gate-card ${details.hasLower ? 'gate-active' : ''}`}>
                <span className="gate-bit">{details.hasLower ? 'L = 1' : 'L = 0'}</span>
                <span className="gate-title">Lowercase Letter [a-z]</span>
                <span className="gate-status">{details.hasLower ? '✓ Verified' : '○ Not Met'}</span>
              </div>

              <div className={`dfa-gate-card ${details.hasDigit ? 'gate-active' : ''}`}>
                <span className="gate-bit">{details.hasDigit ? 'D = 1' : 'D = 0'}</span>
                <span className="gate-title">Numeric Digit [0-9]</span>
                <span className="gate-status">{details.hasDigit ? '✓ Verified' : '○ Not Met'}</span>
              </div>

              <div className={`dfa-gate-card ${details.hasSpecial ? 'gate-active' : ''}`}>
                <span className="gate-bit">{details.hasSpecial ? 'S = 1' : 'S = 0'}</span>
                <span className="gate-title">Special Character (Σ_spec)</span>
                <span className="gate-status">{details.hasSpecial ? '✓ Verified' : '○ Not Met'}</span>
              </div>
            </div>
          </div>

          {/* Stepper / Active Character Inspector */}
          {transitions.length > 0 && (
            <div className="dfa-stepper-box">
              <div className="stepper-header">
                <h4>Automaton Execution Trace ({transitions.length} steps)</h4>
                <span className="stepper-hint">Click any step to inspect transition details</span>
              </div>

              {/* Horizontal character pills */}
              <div className="stepper-pills">
                {transitions.map((t, index) => {
                  const isSelected = selectedStep === index || (selectedStep === null && index === transitions.length - 1);
                  return (
                    <button
                      key={index}
                      type="button"
                      className={`step-pill ${isSelected ? 'active-step' : ''} ${t.isTrap ? 'trap-step' : ''}`}
                      onClick={() => setSelectedStep(index)}
                    >
                      <span className="step-char">{t.character}</span>
                      <span className="step-idx">{t.step}</span>
                    </button>
                  );
                })}
              </div>

              {/* Inspector details for selected step */}
              {inspectedStep && (
                <div className="step-detail-card">
                  <div className="step-detail-row">
                    <span><strong>Step {inspectedStep.step}:</strong> Character <code>'{inspectedStep.character}'</code></span>
                    <span>Classified as: <span className="cat-badge">{inspectedStep.category}</span></span>
                  </div>
                  <div className="step-transition-flow">
                    <code className="state-from">{inspectedStep.fromState}</code>
                    <span className="flow-arrow">──[{inspectedStep.character}]──►</span>
                    <code className={`state-to ${inspectedStep.isTrap ? 'trap-text' : ''}`}>{inspectedStep.toState}</code>
                  </div>
                  <div className="step-action-desc">
                    <strong>Action:</strong> {inspectedStep.action}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TRANSITION TABLE */}
      {activeTab === 'table' && (
        <div className="dfa-table-panel">
          <div className="dfa-table-intro">
            <h4>DFA State Transition Function: δ(q, σ)</h4>
            <p>
              Shows the deterministic transition for the current state <code>{currentState}</code> across all input character classes in alphabet Σ:
            </p>
          </div>

          <div className="table-responsive">
            <table className="dfa-matrix-table">
              <thead>
                <tr>
                  <th>Input Class (σ)</th>
                  <th>Permitted Sample Symbols</th>
                  <th>Current State (q)</th>
                  <th>Next State δ(q, σ)</th>
                  <th>Condition Vector Change</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="cat-badge">UPPER</span></td>
                  <td><code>A, B, C, ..., Z</code></td>
                  <td><code>{currentState}</code></td>
                  <td>
                    <code>{isTrap ? 'TRAP_REJECT' : `q${Math.min(currentLength + 1, 8)}_U1_L${Number(details.hasLower)}_D${Number(details.hasDigit)}_S${Number(details.hasSpecial)}`}</code>
                  </td>
                  <td>Length +1 (saturates 8), U ← 1</td>
                </tr>
                <tr>
                  <td><span className="cat-badge">LOWER</span></td>
                  <td><code>a, b, c, ..., z</code></td>
                  <td><code>{currentState}</code></td>
                  <td>
                    <code>{isTrap ? 'TRAP_REJECT' : `q${Math.min(currentLength + 1, 8)}_U${Number(details.hasUpper)}_L1_D${Number(details.hasDigit)}_S${Number(details.hasSpecial)}`}</code>
                  </td>
                  <td>Length +1 (saturates 8), L ← 1</td>
                </tr>
                <tr>
                  <td><span className="cat-badge">DIGIT</span></td>
                  <td><code>0, 1, 2, ..., 9</code></td>
                  <td><code>{currentState}</code></td>
                  <td>
                    <code>{isTrap ? 'TRAP_REJECT' : `q${Math.min(currentLength + 1, 8)}_U${Number(details.hasUpper)}_L${Number(details.hasLower)}_D1_S${Number(details.hasSpecial)}`}</code>
                  </td>
                  <td>Length +1 (saturates 8), D ← 1</td>
                </tr>
                <tr>
                  <td><span className="cat-badge">SPECIAL</span></td>
                  <td><code>! @ # $ % ^ &amp; * _ + - = ...</code></td>
                  <td><code>{currentState}</code></td>
                  <td>
                    <code>{isTrap ? 'TRAP_REJECT' : `q${Math.min(currentLength + 1, 8)}_U${Number(details.hasUpper)}_L${Number(details.hasLower)}_D${Number(details.hasDigit)}_S1`}</code>
                  </td>
                  <td>Length +1 (saturates 8), S ← 1</td>
                </tr>
                <tr className="trap-row">
                  <td><span className="cat-badge cat-trap">WHITESPACE / INVALID</span></td>
                  <td><code>␣ (Space), \t, unicode, forbidden chars</code></td>
                  <td><code>{currentState}</code></td>
                  <td><code>TRAP_REJECT</code></td>
                  <td>Immediate rejection, transition to dead state</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FORMAL 5-TUPLE DEFINITION */}
      {activeTab === 'formal' && (
        <div className="dfa-formal-panel">
          <div className="formal-definition-card">
            <h4>Mathematical 5-Tuple Formulation: M = (Q, Σ, δ, q₀, F)</h4>
            
            <div className="formal-tuple-item">
              <div className="tuple-key">Q (Finite Set of States):</div>
              <div className="tuple-val">
                <code>Q = ({`{0, 1, 2, ..., 8}`} × {`{0, 1}`}&sup4;) &cup; {`{TRAP}`}</code>
                <p>
                  Total reachable states: <strong>9 × 16 + 1 = 145 states</strong>.
                  Each state encodes the length progress (0 to 8) and a 4-bit condition vector <code>[U, L, D, S]</code>.
                </p>
              </div>
            </div>

            <div className="formal-tuple-item">
              <div className="tuple-key">Σ (Input Alphabet):</div>
              <div className="tuple-val">
                <code>Σ = Σ_upper &cup; Σ_lower &cup; Σ_digit &cup; Σ_special</code>
                <p>
                  Total alphabet size: <strong>26 + 26 + 10 + 32 = 94 printable ASCII characters</strong>.
                  Whitespace and characters outside Σ trigger a transition to <code>TRAP</code>.
                </p>
              </div>
            </div>

            <div className="formal-tuple-item">
              <div className="tuple-key">q₀ (Initial State):</div>
              <div className="tuple-val">
                <code>q₀ = q0_U0_L0_D0_S0</code>
                <p>Automaton starts with length = 0 and all condition flags cleared (0).</p>
              </div>
            </div>

            <div className="formal-tuple-item">
              <div className="tuple-key">δ (Transition Function):</div>
              <div className="tuple-val">
                <code>δ: Q × Σ → Q</code>
                <p>
                  For any state <code>(len, u, l, d, s)</code> and symbol <code>c</code>, updates length to <code>min(len+1, 8)</code> and sets the bit corresponding to <code>class(c)</code>.
                </p>
              </div>
            </div>

            <div className="formal-tuple-item">
              <div className="tuple-key">F (Set of Accept States):</div>
              <div className="tuple-val">
                <code>F = {`{ q8_U1_L1_D1_S1 }`}</code>
                <p>
                  A password is accepted if and only if <code>δ*(q₀, w) ∈ F</code>, ensuring length ≥ 8, Upper ≥ 1, Lower ≥ 1, Digit ≥ 1, and Special ≥ 1.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
