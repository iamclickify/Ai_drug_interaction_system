import React, { useState } from 'react';
import { getBrandMap } from '../services/api';
import { ShieldAlert, Plus, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';

const MedicineCabinet = () => {
  const [cabinet, setCabinet] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const brandMap = getBrandMap();
  const availableBrands = Object.keys(brandMap).sort();

  const handleAdd = () => {
    if (selectedBrand && !cabinet.includes(selectedBrand)) {
       setCabinet([...cabinet, selectedBrand]);
       setSelectedBrand('');
       setAnalysis(null); // reset analysis on new drug
    }
  };

  const handleRemove = (brandToRemove) => {
    setCabinet(cabinet.filter(b => b !== brandToRemove));
    setAnalysis(null);
  };

  const handleScan = () => {
    if (cabinet.length === 0) return;
    
    // Map cabinet brands to active ingredients
    const activeIngredients = cabinet.map(brand => brandMap[brand]);
    
    // Count occurrences of each active ingredient
    const ingredientCounts = {};
    activeIngredients.forEach(ing => {
       ingredientCounts[ing] = (ingredientCounts[ing] || 0) + 1;
    });

    // Check for overlap (taking multiple drugs that contain the same ingredient)
    const overlaps = [];
    Object.keys(ingredientCounts).forEach(ing => {
       if (ingredientCounts[ing] > 1) {
          // Which brands caused this overlap?
          const culprits = cabinet.filter(brand => brandMap[brand] === ing);
          overlaps.push({ ingredient: ing, brands: culprits });
       }
    });

    // Check for multiple NSAIDs (e.g. Ibuprofen + Naproxen)
    const uniqueIngredients = Object.keys(ingredientCounts);
    const nsaidIngredients = uniqueIngredients.filter(ing => ing !== 'Acetaminophen');
    const nsaidClassOverlap = nsaidIngredients.length > 1;

    setAnalysis({
       overlaps,
       nsaidClassOverlap,
       nsaidList: nsaidIngredients
    });
  };

  return (
    <div className="container">
      <h1 className="page-title">Pharmaguide AI: Medicine Cabinet Scan</h1>
      <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-danger)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
         <AlertTriangle color="var(--accent-danger)" size={24} />
         <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            DISCLAIMER: This tool is for EDUCATIONAL PURPOSES ONLY. It is designed to help you understand active ingredients in common products. NEVER change your medication regimen without consulting a licensed physician or pharmacist.
         </p>
      </div>
      <p className="page-subtitle" style={{ maxWidth: '800px', marginBottom: '2rem' }}>
        Add your brand-name medications to decode their active ingredients and check for safety overlaps.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
         
         {/* Left Side: Input area */}
         <div className="glass-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Add to Cabinet</h2>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
               <select 
                 className="form-select" 
                 value={selectedBrand} 
                 onChange={e => setSelectedBrand(e.target.value)}
                 style={{ flex: 1 }}
               >
                  <option value="">-- Select a Brand Name Product --</option>
                  {availableBrands.map(brand => (
                     <option key={brand} value={brand}>{brand}</option>
                  ))}
               </select>
               <button 
                 className="btn-primary" 
                 onClick={handleAdd}
                 disabled={!selectedBrand}
                 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1.5rem' }}
               >
                  <Plus size={20} /> Add
               </button>
            </div>

            <div style={{ minHeight: '150px', background: 'rgba(0,0,0,0.1)', borderRadius: '0.5rem', padding: '1rem', border: '1px dashed var(--glass-border)' }}>
               {cabinet.length === 0 ? (
                  <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '3rem' }}>
                     Your cabinet is empty. Add a medication above.
                  </div>
               ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                     {cabinet.map(brand => (
                        <div key={brand} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1rem', borderRadius: '0.5rem' }}>
                           <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{brand}</span>
                           <button onClick={() => handleRemove(brand)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                              <Trash2 size={18} />
                           </button>
                        </div>
                     ))}
                  </div>
               )}
            </div>

            <button 
               className="btn-primary" 
               style={{ width: '100%', marginTop: '2rem', fontSize: '1.1rem', padding: '1rem' }}
               onClick={handleScan}
               disabled={cabinet.length === 0}
            >
               Run Safety Scan
            </button>
         </div>

         {/* Right Side: Results */}
         <div>
            {!analysis ? (
               <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', textAlign: 'center', opacity: 0.7 }}>
                  <ShieldAlert size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Ready to Scan</h3>
                  <p style={{ maxWidth: '300px' }}>Click 'Run Safety Scan' to decode your medications and check for hidden overlaps.</p>
               </div>
            ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.5s ease' }}>
                  
                  {/* Result 1: Strict Active Ingredient Overlap */}
                  {analysis.overlaps.length > 0 ? (
                     <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-danger)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                           <ShieldAlert size={32} color="var(--accent-danger)" />
                           <h2 style={{ fontSize: '1.3rem', color: 'var(--accent-danger)' }}>Danger: Ingredient Duplication</h2>
                        </div>
                        {analysis.overlaps.map(overlap => (
                           <div key={overlap.ingredient} style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>
                              <p style={{ fontSize: '1.05rem', lineHeight: '1.5' }}>
                                 You are taking <strong>{overlap.brands.join(' and ')}</strong>. 
                                 <br/><br/>
                                 Both of these contain <strong>{overlap.ingredient}</strong>. Taking both at the same time can lead to a dangerous overdose. You should only take ONE of these products.
                              </p>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                           <CheckCircle size={32} color="var(--accent-secondary)" />
                           <div>
                              <h2 style={{ fontSize: '1.1rem', color: 'var(--accent-secondary)' }}>No Direct Duplications Found</h2>
                              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>You are not accidentally doubling up on the exact same ingredient.</p>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Result 2: General NSAID Class Overlap */}
                  {analysis.nsaidClassOverlap && (
                     <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-warning)', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                           <AlertTriangle size={32} color="var(--accent-warning)" />
                           <h2 style={{ fontSize: '1.3rem', color: 'var(--accent-warning)' }}>Warning: Multiple Pain Relievers</h2>
                        </div>
                        <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '0.5rem' }}>
                           <p style={{ fontSize: '1.05rem', lineHeight: '1.5' }}>
                              You have selected products containing <strong>{analysis.nsaidList.join(' and ')}</strong>. 
                              <br/><br/>
                              While these are different ingredients, they belong to the same family of drugs. Combining different pain relievers does not significantly improve pain, but it <strong>multiplies your risk of stomach bleeding and kidney damage</strong>. Choose just one.
                           </p>
                        </div>
                     </div>
                  )}

                  {/* Educational Summary list */}
                  <div className="glass-card" style={{ marginTop: '1rem' }}>
                     <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Your Decoded Cabinet</h3>
                     <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                           <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                              <th style={{ padding: '0.5rem 0', color: 'var(--text-secondary)' }}>Product Name</th>
                              <th style={{ padding: '0.5rem 0', color: 'var(--text-secondary)' }}>Actual Active Ingredient</th>
                           </tr>
                        </thead>
                        <tbody>
                           {cabinet.map(brand => (
                              <tr key={brand} style={{ borderBottom: '1px dashed rgba(255,255,255,0.05)' }}>
                                 <td style={{ padding: '0.75rem 0', fontWeight: 600, color: 'var(--text-primary)' }}>{brand}</td>
                                 <td style={{ padding: '0.75rem 0', color: 'var(--accent-primary)', fontFamily: 'monospace', fontSize: '1rem' }}>{brandMap[brand]}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>

               </div>
            )}
         </div>

      </div>
    </div>
  );
};

export default MedicineCabinet;
