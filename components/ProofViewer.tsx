
import React, { useState, useEffect } from 'react';
import { AgentActionProof } from '../types';
import { resolveDispute } from '../services/geminiService';
import { Search, Database, CheckCircle, XCircle, AlertOctagon, Activity, ChevronRight, Copy, Box, Hash, Clock, Gavel, Users, ShieldAlert, MessageSquare, Link, FileText } from 'lucide-react';

interface ProofViewerProps {
  proofs: AgentActionProof[];
  onDispute: (proofId: string) => void;
  initialProofId?: string;
}

const ProofViewer: React.FC<ProofViewerProps> = ({ proofs, onDispute, initialProofId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [foundProof, setFoundProof] = useState<AgentActionProof | null>(null);
  
  // State for dispute interaction
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [isChallenging, setIsChallenging] = useState(false);

  // Auto-select proof if provided via props
  useEffect(() => {
    if (initialProofId) {
        const p = proofs.find(x => x.proofId === initialProofId);
        if (p) setFoundProof(p);
    }
  }, [initialProofId, proofs]);

  const handleSearch = () => {
    const proof = proofs.find(p => p.proofId === searchTerm || p.inputSnippet.includes(searchTerm));
    setFoundProof(proof || null);
    setShowDisputeForm(false);
    setDisputeReason('');
  };

  const submitChallenge = async () => {
    if (!foundProof || !disputeReason.trim()) return;
    setIsChallenging(true);
    
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API Key missing");
        onDispute(foundProof.proofId);
        const verdict = await resolveDispute(foundProof, disputeReason, apiKey);
        setFoundProof(prev => prev ? { 
            ...prev, 
            isDisputed: true,
            disputeStatus: verdict.verdict,
            judgeVerdict: verdict.comment,
            challengeReason: disputeReason,
            trustScoreDelta: (prev.trustScoreDelta || 0) + verdict.penalty
        } : null);
        setShowDisputeForm(false);
    } catch (e) {
        console.error("Dispute failed", e);
    } finally {
        setIsChallenging(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto w-full p-6 md:p-8 animate-in fade-in duration-500 pb-20">
      
      {/* Search Header */}
      <div className="flex flex-col items-center mb-16 relative">
         <div className="absolute top-1/2 w-full h-px bg-slate-800 -z-10"></div>
         <div className="bg-[#02040a] px-8 py-2 border border-slate-700 rounded-full mb-8">
            <h2 className="text-2xl font-bold text-white tracking-[0.2em] font-display uppercase">Immutable Ledger</h2>
         </div>
         
         <div className="w-full max-w-2xl relative group">
            <div className="absolute inset-0 bg-neon-blue/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex shadow-2xl">
               <div className="bg-[#0b101b] border-y border-l border-neon-blue/30 pl-4 flex items-center justify-center rounded-l-lg">
                  <Search className="text-neon-blue" size={20} />
               </div>
               <input 
                  type="text" 
                  placeholder="SEARCH_HASH (0x...) OR PAYLOAD_CONTENT"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#0b101b] border-y border-r border-neon-blue/30 text-white p-4 font-mono text-sm focus:outline-none placeholder:text-slate-600 rounded-r-lg"
               />
               <button 
                  onClick={handleSearch}
                  className="ml-4 px-8 bg-neon-blue text-black font-bold font-mono tracking-widest uppercase hover:bg-white transition-colors rounded-lg shadow-[0_0_15px_rgba(0,243,255,0.3)]"
               >
                  Verify
               </button>
            </div>
         </div>
      </div>

      {!foundProof && (
         <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 pl-2">Recent Blocks</div>
            {proofs.map((p) => (
               <div key={p.proofId} 
                    onClick={() => setFoundProof(p)}
                    className="hud-panel p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer group transition-all hover:scale-[1.01] cyber-cut-br border-l-2 border-l-transparent hover:border-l-neon-blue"
               >
                  <div className="flex items-center gap-4">
                     <div className={`w-2 h-2 rounded-full ${p.isDisputed ? 'bg-red-500 shadow-[0_0_8px_#ff0000]' : 'bg-neon-green shadow-[0_0_8px_#0aff00]'}`}></div>
                     <div className="font-mono text-sm text-neon-blue">{p.proofId}</div>
                  </div>
                  <div className="flex items-center gap-8 text-xs text-slate-400 font-mono">
                     <div className="flex items-center gap-2"><Box size={12}/> BLOCK: #{p.blockHeight}</div>
                     <div className="flex items-center gap-2"><Clock size={12}/> {new Date(p.timestamp).toLocaleTimeString()}</div>
                     <ChevronRight size={14} className="text-slate-600 group-hover:text-white" />
                  </div>
               </div>
            ))}
         </div>
      )}

      {foundProof && (
        <div className="hud-panel cyber-cut p-1 border-t-4 border-t-neon-blue animate-in zoom-in-95 duration-500 max-w-5xl mx-auto">
           
           {/* Header Stripe */}
           <div className="bg-[#0b101b] p-6 border-b border-white/5 flex flex-wrap justify-between items-center gap-6">
               <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-slate-900 border border-slate-700 flex items-center justify-center">
                       <FileText className="text-neon-blue" size={24} />
                   </div>
                   <div>
                       <h3 className="text-white font-mono font-bold text-lg flex items-center gap-2">
                           {foundProof.proofId.substring(0, 12)}... 
                           <span className="text-slate-600 text-xs uppercase tracking-widest">Hash Verified</span>
                       </h3>
                       <p className="text-slate-500 text-xs font-mono flex items-center gap-4 mt-1">
                           <span className="flex items-center gap-1"><Clock size={12}/> {foundProof.timestamp}</span>
                           <span className="flex items-center gap-1"><Link size={12}/> Polygon Testnet</span>
                       </p>
                   </div>
               </div>
               
               {/* Verdict Badge */}
               {foundProof.disputeStatus?.startsWith('Resolved') ? (
                   <div className={`px-6 py-2 border font-bold font-mono text-sm tracking-widest flex items-center gap-2 ${foundProof.disputeStatus === 'Resolved_Upheld' ? 'text-neon-green border-neon-green bg-neon-green/10' : 'text-red-500 border-red-500 bg-red-500/10'}`}>
                      <Gavel size={16} /> {foundProof.disputeStatus === 'Resolved_Upheld' ? 'UPHELD' : 'OVERTURNED'}
                   </div>
               ) : foundProof.isDisputed ? (
                  <div className="px-6 py-2 border border-yellow-500 text-yellow-500 bg-yellow-500/10 font-bold font-mono text-sm tracking-widest animate-pulse flex items-center gap-2">
                    <AlertOctagon size={16} /> DISPUTED
                  </div>
               ) : (
                  <div className="px-6 py-2 border border-neon-green text-neon-green bg-neon-green/10 font-bold font-mono text-sm tracking-widest flex items-center gap-2 shadow-[0_0_10px_rgba(10,255,0,0.2)]">
                    <CheckCircle size={16} /> VERIFIED
                  </div>
               )}
           </div>

           <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
               {/* Left Column: Data */}
               <div className="space-y-8">
                   <div className="space-y-2">
                       <h4 className="text-[10px] text-neon-blue uppercase font-bold tracking-[0.2em] flex items-center gap-2">
                           <Activity size={12}/> Input Vector
                       </h4>
                       <div className="bg-black/40 border border-slate-800 p-4 font-mono text-sm text-slate-300 leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
                           {foundProof.inputSnippet}
                       </div>
                   </div>

                   <div className="space-y-2">
                       <h4 className="text-[10px] text-neon-blue uppercase font-bold tracking-[0.2em] flex items-center gap-2">
                           <Database size={12}/> Output Payload
                       </h4>
                       <div className="bg-[#050810] border-l-2 border-neon-blue p-5 text-white font-medium text-lg font-mono">
                           {foundProof.actionOutput}
                       </div>
                   </div>

                   {foundProof.reasoning.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-[10px] text-neon-blue uppercase font-bold tracking-[0.2em] flex items-center gap-2">
                                <Hash size={12}/> Cognitive Trace
                            </h4>
                            <div className="space-y-2">
                                {foundProof.reasoning.map((r, i) => (
                                    <div key={i} className="flex gap-3 text-sm text-slate-400 font-mono">
                                        <span className="text-slate-600 select-none">0{i}.</span>
                                        <span>{r}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                   )}
               </div>

               {/* Right Column: Consensus & Meta */}
               <div className="space-y-8 border-l border-white/5 pl-0 lg:pl-12">
                   
                   <div className="space-y-4">
                        <h4 className="text-[10px] text-neon-blue uppercase font-bold tracking-[0.2em] flex items-center gap-2">
                           <Users size={12}/> Consensus Layer
                        </h4>
                        {foundProof.crossChecks.map((check, i) => (
                            <div key={i} className={`p-4 border ${check.agreement ? 'border-neon-green/20 bg-neon-green/5' : 'border-red-500/20 bg-red-500/5'} flex justify-between items-start gap-4`}>
                                <div>
                                    <div className="text-xs font-bold text-white uppercase mb-1">{check.checkerAgentName}</div>
                                    <div className="text-[10px] text-slate-500 font-mono uppercase mb-2">{check.checkerRole}</div>
                                    <div className="text-xs text-slate-400 italic">"{check.comment}"</div>
                                </div>
                                {check.agreement ? <CheckCircle size={16} className="text-neon-green"/> : <XCircle size={16} className="text-red-500"/>}
                            </div>
                        ))}
                   </div>

                   {/* Judge Verdict Box */}
                   {foundProof.disputeStatus?.startsWith('Resolved') && (
                       <div className="p-6 border border-slate-700 bg-gradient-to-br from-slate-900 to-black relative overflow-hidden group">
                           <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${foundProof.disputeStatus === 'Resolved_Upheld' ? 'text-neon-green' : 'text-red-500'}`}>
                               <Gavel size={80} />
                           </div>
                           <h4 className="text-white font-bold font-display uppercase text-lg mb-2 relative z-10">Final Verdict</h4>
                           <p className="text-slate-300 italic text-sm mb-4 relative z-10">"{foundProof.judgeVerdict}"</p>
                           <div className="flex justify-between items-center text-[10px] font-mono uppercase text-slate-500 relative z-10">
                               <span>Adjudicated by Justitia AI</span>
                               <span className={foundProof.disputeStatus === 'Resolved_Upheld' ? 'text-neon-green' : 'text-red-500'}>
                                   {foundProof.disputeStatus === 'Resolved_Upheld' ? '+5 REPUTATION' : '-15 REPUTATION'}
                                </span>
                           </div>
                       </div>
                   )}

                   {/* Actions */}
                   {!foundProof.isDisputed && !showDisputeForm && (
                        <button 
                            onClick={() => setShowDisputeForm(true)}
                            className="w-full py-4 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all font-mono font-bold uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 group"
                        >
                            <ShieldAlert size={14} className="group-hover:animate-pulse" /> Challenge Verification
                        </button>
                   )}

                   {showDisputeForm && (
                       <div className="p-4 bg-red-950/20 border border-red-500/30 animate-in fade-in slide-in-from-bottom-2">
                           <h4 className="text-red-400 font-bold uppercase text-xs tracking-widest mb-3">Submit Challenge</h4>
                           <textarea 
                                value={disputeReason}
                                onChange={(e) => setDisputeReason(e.target.value)}
                                placeholder="Describe the error in verification..."
                                className="w-full bg-black border border-red-900/50 p-3 text-sm text-white focus:border-red-500 focus:outline-none mb-3 min-h-[100px]"
                           />
                           <div className="flex gap-3">
                               <button 
                                   onClick={() => setShowDisputeForm(false)}
                                   className="flex-1 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white"
                               >
                                   Cancel
                               </button>
                               <button 
                                   onClick={submitChallenge}
                                   disabled={isChallenging}
                                   className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-widest"
                               >
                                   {isChallenging ? 'ADJUDICATING...' : 'SUBMIT'}
                               </button>
                           </div>
                       </div>
                   )}

               </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProofViewer;
