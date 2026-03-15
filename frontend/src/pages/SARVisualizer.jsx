import React, { useState } from 'react';
import { Microscope, Activity, ArrowRight, BookOpen, Box, Image as ImageIcon } from 'lucide-react';
import GlossaryTooltip from '../components/GlossaryTooltip';

// Educational SAR Database (Hardcoded for immediate standalone learning)
const sarData = {
  "Diclofenac": {
    cid: 3033,
    description: "An arylacetic acid derivative. The two chlorine atoms in ortho positions force the lower phenyl ring out of plane.",
    features: [
      {
        name: "Dichloro-phenyl ring",
        impact: "Forces a non-planar conformation, allowing the molecule to tightly wedge into the COX active site channel, explaining its high potency."
      },
      {
        name: "Carboxylic Acid",
        impact: "Provides the anchor point by forming an ion-pair with Arg120 in the COX channel."
      }
    ]
  },
  "Celecoxib": {
    cid: 2662,
    description: "A selective COX-2 inhibitor containing a sulfonamide group.",
    features: [
      {
        name: "Sulfonamide Group",
        impact: "Fits perfectly into a hydrophilic side-pocket of the COX-2 enzyme. COX-1 has an isoleucine blocking this pocket, giving Celecoxib its high COX-2 selectivity."
      },
      {
        name: "Trifluoromethyl Group",
        impact: "Increases lipophilicity and electron withdrawal, stabilizing the binding conformation."
      }
    ]
  },
  "Aspirin": {
    cid: 2244,
    description: "Acetylsalicylic acid, the original NSAID.",
    features: [
      {
        name: "Acetyl Group",
        impact: "Covalently (irreversibly) acetylates Serine 530 in the COX active site, completely killing the enzyme's ability to bind arachidonic acid."
      },
      {
        name: "Carboxylic Acid",
        impact: "Binds to Arg120 to anchor the molecule before the acetylation occurs."
      }
    ]
  },
  "Ibuprofen": {
    cid: 3672,
    description: "A simple propionic acid derivative.",
    features: [
      {
        name: "Isobutyl Group",
        impact: "Provides optimal lipophilicity to slide into the hydrophobic channel of the COX enzyme."
      },
      {
        name: "Alpha-Methyl Group",
        impact: "Creates a chiral center. Only the S-enantiomer is active, though the body converts the inactive R-form to S-form in vivo."
      }
    ]
  }
};

const Molecule3D = ({ cid }) => {
  const viewerRef = React.useRef(null);

  React.useEffect(() => {
    if (viewerRef.current && window.$3Dmol) {
      viewerRef.current.innerHTML = '';
      const viewer = window.$3Dmol.createViewer(viewerRef.current, {
        backgroundColor: 'white'
      });
      
      const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/CID/${cid}/SDF`;
      
      fetch(url)
        .then(res => res.text())
        .then(data => {
          viewer.addModel(data, "sdf");
          viewer.setStyle({}, { stick: { radius: 0.15 }, sphere: { scale: 0.25 } });
          viewer.zoomTo();
          viewer.render();
          viewer.animate({ loop: "backAndForth" });
        })
        .catch(err => console.error("3Dmol Error:", err));
    }
  }, [cid]);

  return (
    <div 
      ref={viewerRef} 
      style={{ 
        width: '100%', 
        height: '300px', 
        position: 'relative', 
        borderRadius: '1rem',
        overflow: 'hidden',
        background: '#fff'
      }} 
    />
  );
};

const SARVisualizer = () => {
  const [selectedDrug, setSelectedDrug] = useState('Diclofenac');
  const [viewMode, setViewMode] = useState('3d'); // default to 3d

  return (
    <div className="container" style={{ animation: 'fadeIn 0.5s ease' }}>
      <h1 className="page-title">Structure-Activity Explorer</h1>
      <p className="page-subtitle" style={{ maxWidth: '800px', marginBottom: '2rem' }}>
        A core pharmacology tool for students. Understand how modifying specific atoms (<GlossaryTooltip term="SAR">Structure-Activity Relationship</GlossaryTooltip>) changes drug selectivity and <GlossaryTooltip term="Potency">potency</GlossaryTooltip>.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
        
        {/* Selection Pane */}
        <div className="glass-card" style={{ alignSelf: 'start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
            <Microscope size={24} />
            <h2 style={{ fontSize: '1.25rem' }}>Select Molecule</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.keys(sarData).map(drug => (
              <button 
                key={drug}
                onClick={() => setSelectedDrug(drug)}
                style={{
                  padding: '1rem',
                  textAlign: 'left',
                  background: selectedDrug === drug ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${selectedDrug === drug ? 'var(--accent-primary)' : 'transparent'}`,
                  borderRadius: '0.5rem',
                  color: 'var(--text-primary)',
                  fontWeight: selectedDrug === drug ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {drug}
              </button>
            ))}
          </div>
        </div>

        {/* Display Pane */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
             <div>
                <h2 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{selectedDrug}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{sarData[selectedDrug].description}</p>
             </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
             
             {/* Image or 3D Viewer */}
             <div style={{ position: 'relative' }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '0.5rem', 
                  right: '0.5rem', 
                  zIndex: 10,
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  <button 
                    onClick={() => setViewMode('2d')}
                    style={{ 
                      padding: '0.4rem', 
                      borderRadius: '0.4rem', 
                      background: viewMode === '2d' ? 'var(--accent-primary)' : 'rgba(0,0,0,0.5)',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    title="2D Structure"
                  >
                    <ImageIcon size={16} />
                  </button>
                  <button 
                    onClick={() => setViewMode('3d')}
                    style={{ 
                      padding: '0.4rem', 
                      borderRadius: '0.4rem', 
                      background: viewMode === '3d' ? 'var(--accent-primary)' : 'rgba(0,0,0,0.5)',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    title="3D Viewer"
                  >
                    <Box size={16} />
                  </button>
                </div>

                {viewMode === '2d' ? (
                  <div style={{ background: '#fff', borderRadius: '1rem', padding: '1rem', display: 'flex', alignItems: 'center', justifyItems: 'center', minHeight: '300px' }}>
                    <img 
                      src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${sarData[selectedDrug].cid}/PNG`} 
                      alt={`${selectedDrug} 2D Structure`} 
                      style={{ width: '100%', objectFit: 'contain', filter: 'contrast(1.2)' }}
                    />
                  </div>
                ) : (
                  <Molecule3D cid={sarData[selectedDrug].cid} />
                )}
             </div>

             {/* Functional Groups Analysis */}
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Activity size={20} />
                  Functional Group Analysis
               </h3>

               {sarData[selectedDrug].features.map((feature, idx) => (
                 <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '0.75rem', borderLeft: '3px solid var(--accent-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                       <BookOpen size={18} color="var(--accent-secondary)" />
                       <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{feature.name}</strong>
                    </div>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                       {feature.impact}
                    </p>
                 </div>
               ))}
               
               <div style={{ marginTop: 'auto', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
                 <strong style={{ color: 'var(--accent-warning)', display: 'block', marginBottom: '0.25rem' }}>Educational Note:</strong>
                 <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                   These structural rules dictate the pharmacokinetic descriptors (<GlossaryTooltip term="LogP">LogP</GlossaryTooltip>, <GlossaryTooltip term="TPSA">TPSA</GlossaryTooltip>) you see in the Data Explorer module. Small atomic substitutions drastically alter clinical safety profiles.
                 </p>
               </div>

             </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default SARVisualizer;
