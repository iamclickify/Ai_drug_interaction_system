import { Grid3x3, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { fetchDrugs, checkInteraction } from '../services/api';
import { useEffect } from 'react';

const drugs = ['Aspirin', 'Ibuprofen', 'Naproxen', 'Diclofenac', 'Celecoxib', 'Indomethacin', 'Ketorolac', 'Meloxicam', 'Piroxicam'];

// Interaction matrix: interactionData[drugA][drugB] = { risk, mechanism }
const interactionData = {
  'Aspirin+Ibuprofen': { risk: 'High', mechanism: 'Ibuprofen competitively blocks Aspirin access to Ser530, negating its irreversible antiplatelet effect. Take Aspirin ≥30 min before Ibuprofen if both needed.' },
  'Aspirin+Naproxen': { risk: 'Medium', mechanism: 'Naproxen has less interference with Aspirin antiplatelet effect than Ibuprofen, but additive GI bleeding risk remains. May be used together with caution.' },
  'Aspirin+Diclofenac': { risk: 'High', mechanism: 'Diclofenac competes for COX-1 binding, reducing Aspirin cardioprotection. Additive GI and renal toxicity.' },
  'Aspirin+Celecoxib': { risk: 'High', mechanism: 'Celecoxib + Aspirin negates the GI-sparing benefit of COX-2 selectivity while increasing bleeding risk.' },
  'Aspirin+Indomethacin': { risk: 'High', mechanism: 'Both potent COX-1 inhibitors. Markedly increased GI bleeding risk. Indomethacin may also block Aspirin\'s antiplatelet access.' },
  'Aspirin+Ketorolac': { risk: 'High', mechanism: 'Ketorolac is contraindicated with Aspirin. Extreme GI hemorrhage risk. Ketorolac label specifically warns against concurrent use.' },
  'Aspirin+Meloxicam': { risk: 'Medium', mechanism: 'Additive GI risk. Meloxicam\'s preferential COX-2 selectivity may be partially preserved at low doses.' },
  'Aspirin+Piroxicam': { risk: 'High', mechanism: 'Piroxicam\'s 50-hour half-life means sustained COX-1 inhibition overlapping with Aspirin. Very high GI risk.' },
  'Ibuprofen+Naproxen': { risk: 'High', mechanism: 'Two non-selective NSAIDs: no additive efficacy, only cumulative GI mucosal damage and renal prostaglandin blockade.' },
  'Ibuprofen+Diclofenac': { risk: 'High', mechanism: 'Dual non-selective COX inhibition. Protein binding displacement increases free drug levels unpredictably.' },
  'Ibuprofen+Celecoxib': { risk: 'Medium', mechanism: 'Ibuprofen negates GI advantage of Celecoxib. Additive renal effects via prostaglandin suppression.' },
  'Ibuprofen+Indomethacin': { risk: 'High', mechanism: 'Both compete for same COX binding site. Indomethacin CNS toxicity compounded. Extreme GI risk.' },
  'Ibuprofen+Ketorolac': { risk: 'High', mechanism: 'Ketorolac label explicitly contraindicates concurrent NSAID use. Catastrophic GI bleeding risk.' },
  'Ibuprofen+Meloxicam': { risk: 'Medium', mechanism: 'Additive COX-1 inhibition at therapeutic doses. Increased renal and GI adverse effects.' },
  'Ibuprofen+Piroxicam': { risk: 'High', mechanism: 'Piroxicam\'s long half-life ensures overlapping exposure. No clinical benefit, multiplicative risk.' },
  'Naproxen+Diclofenac': { risk: 'High', mechanism: 'Both highly protein-bound (>99%). Displacement interactions alter free fractions. Additive nephrotoxicity.' },
  'Naproxen+Celecoxib': { risk: 'Medium', mechanism: 'Loss of COX-2 selective GI advantage. Reasonable alternative is to use one or the other, not both.' },
  'Naproxen+Indomethacin': { risk: 'High', mechanism: 'Two potent NSAIDs with compounded GI, renal, and CNS toxicity. No therapeutic synergy.' },
  'Naproxen+Ketorolac': { risk: 'High', mechanism: 'Absolute contraindication. Ketorolac requires no concurrent NSAID use.' },
  'Naproxen+Meloxicam': { risk: 'Medium', mechanism: 'Additive effects. Both have long half-lives leading to sustained COX inhibition.' },
  'Naproxen+Piroxicam': { risk: 'High', mechanism: 'Combined half-lives of 15h + 50h = near-continuous COX blockade. Extreme GI ulceration risk.' },
  'Diclofenac+Celecoxib': { risk: 'Medium', mechanism: 'Diclofenac is already somewhat COX-2 selective. Adding Celecoxib gives minimal additional benefit with additive CV risk.' },
  'Diclofenac+Indomethacin': { risk: 'High', mechanism: 'Two of the most potent NSAIDs. Hepatotoxicity risk compounds. CYP2C9 competition.' },
  'Diclofenac+Ketorolac': { risk: 'High', mechanism: 'Absolute contraindication per Ketorolac labeling.' },
  'Diclofenac+Meloxicam': { risk: 'Medium', mechanism: 'Similar mechanism profiles. No additive benefit, increased hepatorenal risk.' },
  'Diclofenac+Piroxicam': { risk: 'High', mechanism: 'Long exposure from Piroxicam + potent COX inhibition from Diclofenac. Major GI risk.' },
  'Celecoxib+Indomethacin': { risk: 'High', mechanism: 'Negates COX-2 selectivity benefit. Indomethacin CNS effects unmitigated.' },
  'Celecoxib+Ketorolac': { risk: 'High', mechanism: 'Contraindicated. Loss of all GI sparing. Extreme renal compromise risk.' },
  'Celecoxib+Meloxicam': { risk: 'Medium', mechanism: 'Both lean COX-2 selective but additive cardiovascular thrombotic risk increases significantly.' },
  'Celecoxib+Piroxicam': { risk: 'High', mechanism: 'Long-acting non-selective + selective inhibitor. Complex pharmacokinetic overlap.' },
  'Indomethacin+Ketorolac': { risk: 'High', mechanism: 'Two of the most aggressive NSAIDs. Life-threatening GI hemorrhage risk. Absolutely contraindicated.' },
  'Indomethacin+Meloxicam': { risk: 'High', mechanism: 'Indomethacin BBB penetration + Meloxicam\'s long half-life = sustained CNS and GI toxicity.' },
  'Indomethacin+Piroxicam': { risk: 'High', mechanism: 'Additive severe GI toxicity. Both have significant side-effect profiles when used alone.' },
  'Ketorolac+Meloxicam': { risk: 'High', mechanism: 'Ketorolac is contraindicated with ALL NSAIDs regardless of selectivity profile.' },
  'Ketorolac+Piroxicam': { risk: 'High', mechanism: 'Absolute contraindication. Ketorolac max 5 days, Piroxicam takes 10 days to reach steady state.' },
  'Meloxicam+Piroxicam': { risk: 'Medium', mechanism: 'Both oxicams with long half-lives. Combined use offers no benefit over using one at adequate dose.' }
};

const getInteraction = (drugA, drugB) => {
  if (drugA === drugB) return { risk: 'N/A', mechanism: 'Same drug' };
  const key1 = `${drugA}+${drugB}`;
  const key2 = `${drugB}+${drugA}`;
  return interactionData[key1] || interactionData[key2] || { risk: 'Low', mechanism: 'No significant pharmacological interaction documented for this specific combination at typical doses.' };
};

const getHeatClass = (risk) => {
  if (risk === 'High') return 'heat-high';
  if (risk === 'Medium') return 'heat-medium';
  if (risk === 'Low') return 'heat-low';
  return 'heat-none';
};

const ContraindicationMatrix = () => {
  const [drugs, setDrugs] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [riskFilter, setRiskFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [matrixData, setMatrixData] = useState({});

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchDrugs();
      const sortedDrugs = data.map(d => d.drug_name).sort();
      setDrugs(sortedDrugs);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleCellClick = async (drugA, drugB) => {
    if (drugA === drugB) return;
    setSelectedCell({ drugA, drugB });
    setDetailLoading(true);
    try {
      const res = await checkInteraction(drugA, drugB);
      setMatrixData(prev => ({
        ...prev,
        [`${drugA}+${drugB}`]: res
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const currentInteraction = selectedCell ? (matrixData[`${selectedCell.drugA}+${selectedCell.drugB}`]) : null;

  return (
    <div className="container" style={{ animation: 'fadeIn 0.5s ease' }}>
      <h1 className="page-title">Contraindication Matrix</h1>
      <p className="page-subtitle" style={{ maxWidth: '800px', marginBottom: '1.5rem' }}>
        Heatmap view of NSAID-NSAID interactions. Click any cell to see the detailed pharmacological mechanism of interaction.
      </p>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginRight: '0.5rem' }}>Filter:</span>
        {['All', 'High', 'Medium', 'Low'].map(f => (
          <button
            key={f}
            onClick={() => setRiskFilter(f)}
            className={`badge ${f === 'High' ? 'badge-red' : f === 'Medium' ? 'badge-yellow' : f === 'Low' ? 'badge-green' : 'badge-blue'}`}
            style={{ cursor: 'pointer', opacity: riskFilter === f ? 1 : 0.5, fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Heatmap Grid */}
      <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto', position: 'relative' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <Loader2 className="animate-spin" size={48} color="var(--accent-primary)" style={{ margin: '0 auto 1rem' }} />
            <p>Scanning Drug Interaction Lexicon...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `120px repeat(${drugs.length}, 1fr)`, gap: '3px', minWidth: `${drugs.length * 60 + 120}px` }}>
            {/* Header corner */}
            <div style={{ padding: '0.5rem', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Drug ↓ / Drug →</div>
            
            {/* Column headers */}
            {drugs.map(d => (
              <div key={d} style={{ padding: '0.5rem 0.25rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-primary)', transform: 'rotate(-20deg)', transformOrigin: 'bottom left', height: '60px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', whiteSpace: 'nowrap' }}>
                {d}
              </div>
            ))}

            {/* Grid rows */}
            {drugs.map(drugA => (
              <React.Fragment key={drugA}>
                <div style={{ padding: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>{drugA}</div>
                {drugs.map(drugB => {
                  const isDiag = drugA === drugB;
                  const interaction = matrixData[`${drugA}+${drugB}`] || matrixData[`${drugB}+${drugA}`];
                  const risk = interaction?.interaction_risk || 'Unknown';
                  
                  const isFiltered = riskFilter !== 'All' && risk !== riskFilter && !isDiag;
                  const isSelected = selectedCell && selectedCell.drugA === drugA && selectedCell.drugB === drugB;

                  return (
                    <div
                      key={drugB}
                      className={`heatmap-cell ${isDiag ? 'heat-none' : getHeatClass(risk)}`}
                      onClick={() => handleCellClick(drugA, drugB)}
                      style={{
                        opacity: isFiltered ? 0.05 : 1,
                        border: isSelected ? '2px solid var(--text-primary)' : '1px solid transparent',
                        cursor: isDiag ? 'default' : 'pointer',
                        fontSize: '0.6rem'
                      }}
                    >
                      {isDiag ? '—' : risk === 'High' ? '⬤' : risk === 'Medium' || risk === 'Moderate' ? '◉' : risk === 'Low' ? '○' : '?'}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '3px' }} className="heat-high" /> High Risk
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '3px' }} className="heat-medium" /> Medium Risk
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '3px' }} className="heat-low" /> Low Risk
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedCell && (
        <div className="glass-card" style={{ marginTop: '1.5rem', borderLeft: `4px solid ${currentInteraction?.interaction_risk === 'High' ? 'var(--accent-danger)' : 'var(--accent-warning)'}`, animation: 'fadeIn 0.3s ease' }}>
          {detailLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" style={{ margin: '0 auto' }} />
            </div>
          ) : currentInteraction ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                {currentInteraction.interaction_risk === 'High' ? <AlertTriangle size={28} color="var(--accent-danger)" /> : <Info size={28} color="var(--accent-warning)" />}
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{selectedCell.drugA} + {selectedCell.drugB}</h3>
                  <span className={`badge ${currentInteraction.interaction_risk === 'High' ? 'badge-red' : 'badge-yellow'}`}>
                    {currentInteraction.interaction_risk} Risk
                  </span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.15)', borderRadius: '0.5rem' }}>
                  <strong style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Pharmacological Explanation</strong>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{currentInteraction.pharmacological_explanation}</p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.15)', borderRadius: '0.5rem' }}>
                  <strong style={{ color: 'var(--accent-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Mechanistic Reasoning</strong>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{currentInteraction.mechanistic_reasoning}</p>
                </div>
              </div>
            </>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Click cell to analyze interaction.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ContraindicationMatrix;
