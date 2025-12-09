
import React, { useState, useEffect, useRef } from 'react';
import { Agent, AgentActionProof, RiskAssessment, OptimizationEvent } from '../types';
import { runAgentTask, runCollaborativeAgentTask, assessAgentRisk, optimizeAgentStrategy } from '../services/geminiService';
import { Play, ShieldCheck, AlertTriangle, Cpu, Terminal, Code, Check, Loader2, ArrowRight, Activity, Globe, Lock, Wifi, Radar, Zap, Coins, Scale, AlertOctagon, BrainCircuit, RefreshCw, Users, Link, KeyRound, MessageSquare } from 'lucide-react';

interface AgentRunnerProps {
  agents: Agent[];
  onProofCreated: (proof: AgentActionProof) => void;
  onUpdateAgent: (agent: Agent) => void;
  initialAgentId?: string;
  proofs?: AgentActionProof[]; // For history context
}

const AgentRunner: React.FC<AgentRunnerProps> = ({ agents, onProofCreated, onUpdateAgent, initialAgentId, proofs = [] }) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(initialAgentId || agents[0].id);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AgentActionProof | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consoleLog, setConsoleLog] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);
  const [collaborativeMode, setCollaborativeMode] = useState(false);
  
  // Predictive State
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [analyzingRisk, setAnalyzingRisk] = useState(false);

  // Optimization State
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    if (initialAgentId) setSelectedAgentId(initialAgentId);
  }, [initialAgentId]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consoleLog]);

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  // Fetch Predictive Score when Agent Changes
  useEffect(() => {
      const fetchRisk = async () => {
          const apiKey = process.env.API_KEY;
          if (!apiKey) return;
          
          setAnalyzingRisk(true);
          try {
             const assessment = await assessAgentRisk(selectedAgent, proofs, apiKey);
             setRiskAssessment(assessment);
          } catch (e) {
              console.error("Risk Assessment Failed", e);
          } finally {
              setAnalyzingRisk(false);
          }
      };
      
      fetchRisk();
  }, [selectedAgentId, proofs]); // Re-run if agent or history changes

  const handleRun = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setConsoleLog([
        `[INIT] ESTABLISHING SECURE TUNNEL TO NODE: ${selectedAgent.name.toUpperCase()}...`, 
        `[AUTH] VERIFYING CREDENTIALS... OK`,
        `[UPLOAD] TRANSMITTING PAYLOAD (${inputText.length} BYTES)...`
    ]);

    if (collaborativeMode) {
        setConsoleLog(prev => [...prev, `[SWARM] COLLABORATION PROTOCOL: ACTIVE`]);
    }

    try {
      const apiKey = process.env.API_KEY; 
      if (!apiKey) throw new Error("API Key configuration missing.");

      setTimeout(() => setConsoleLog(prev => [...prev, "[SWARM] INITIATING CONSENSUS PROTOCOL..."]), 800);
      
      let execution;
      if (collaborativeMode) {
          execution = await runCollaborativeAgentTask(selectedAgent, inputText, agents, apiKey);
          if (execution.collaborationTrace) {
               setConsoleLog(prev => [...prev, `[LINK] COLLABORATION INITIATED WITH ${execution.collaborationTrace?.helperAgentName.toUpperCase()}...`]);
               setConsoleLog(prev => [...prev, `[SYNC] KNOWLEDGE TOKEN EXCHANGED (TRUST: ${execution.collaborationTrace?.knowledgeTrustScore}%)`]);
          } else {
               setConsoleLog(prev => [...prev, `[INFO] AGENT DECLINED COLLABORATION (CONFIDENCE HIGH)`]);
          }
      } else {
          execution = await runAgentTask(selectedAgent, inputText, apiKey);
      }

      setConsoleLog(prev => [...prev, `[RECV] PACKET RECEIVED FROM ${selectedAgent.name}`]);
      setConsoleLog(prev => [...prev, `[CRYPTO] GENERATING LATTICE SIGNATURE (DILITHIUM-5)...`]);
      setConsoleLog(prev => [...prev, `[VERIFY] ${execution.crossChecks.length} NODES CONFIRMED OUTPUT`]);
      
      if(execution.ethicalEvaluation.status === 'VIOLATION') {
          setConsoleLog(prev => [...prev, `[ALERT] ETHICAL VIOLATION DETECTED: ${execution.ethicalEvaluation.violatedPrinciples.join(', ')}`]);
      } else {
          setConsoleLog(prev => [...prev, `[AUDIT] ETHICS KERNEL: COMPLIANCE VERIFIED (${execution.ethicalEvaluation.score}%)`]);
      }

      const newProof: AgentActionProof = {
        proofId: execution.proofId,
        timestamp: new Date().toISOString(),
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        inputSnippet: inputText,
        actionOutput: execution.actionOutput,
        explanation: execution.explanation,
        reasoning: execution.reasoning,
        crossChecks: execution.crossChecks,
        ethicalEvaluation: execution.ethicalEvaluation,
        collaborationTrace: execution.collaborationTrace,
        quantumMetadata: execution.quantumMetadata,
        securityProtocolVersion: 'PQC-v1.0.4',
        isDisputed: false,
        trustScoreDelta: execution.trustScoreDelta,
        disputeStatus: 'None',
        blockHeight: Math.floor(Math.random() * 10000000)
      };

      setResult(newProof);
      onProofCreated(newProof);
      setLoading(false);

    } catch (err: any) {
      setError(err.message || "Agent execution failed.");
      setConsoleLog(prev => [...prev, `[CRITICAL FAILURE] ${err.message}`]);
      setLoading(false);
    }
  };

  const handleOptimization = async () => {
      const apiKey = process.env.API_KEY;
      if (!apiKey) return;

      setIsOptimizing(true);
      setConsoleLog(prev => [...prev, `[OPT] INITIATING SELF-CORRECTION PROTOCOL FOR ${selectedAgent.name}...`]);

      try {
          const result = await optimizeAgentStrategy(selectedAgent, proofs, apiKey);
          
          const newEvent: OptimizationEvent = {
              id: `opt-${Date.now()}`,
              timestamp: new Date().toISOString(),
              trigger: 'MANUAL',
              adjustments: result.adjustments,
              previousStrategy: selectedAgent.currentStrategy,
              newStrategy: result.newStrategy,
              reasoning: result.reasoning
          };

          const updatedAgent: Agent = {
              ...selectedAgent,
              currentStrategy: result.newStrategy,
              optimizationHistory: [newEvent, ...selectedAgent.optimizationHistory],
              version: `v${(parseFloat(selectedAgent.version.replace('v', '')) + 0.1).toFixed(1)}`
          };

          onUpdateAgent(updatedAgent);
          setConsoleLog(prev => [...prev, `[OPT] STRATEGY UPDATED TO ${updatedAgent.version}. REASON: ${result.reasoning}`]);
      } catch (e) {
          console.error("Optimization failed", e);
          setConsoleLog(prev => [...prev, `[OPT] OPTIMIZATION FAILED`]);
      } finally {
          setIsOptimizing(false);
      }
  };

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      
      {/* Console Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neon-blue/20 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3 font-display tracking-wide">
            <Terminal className="text-neon-blue" size={28} />
            NEURAL_CONSOLE <span className="text-slate-600 text-lg">// {selectedAgent.version}</span>
          </h2>
        </div>
        <div className="flex gap-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-neon-green/10 text-neon-green border border-neon-green/30 text-[10px] font-mono tracking-widest">
                <Globe size={12} /> NET_ONLINE
             </div>
             <div className="flex items-center gap-2 px-3 py-1 bg-neon-purple/10 text-neon-purple border border-neon-purple/30 text-[10px] font-mono tracking-widest">
                <ShieldCheck size={12} /> PQC: ACTIVE
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Input & Config (33%) */}
        <div className="xl:col-span-4 space-y-6">
           
           {/* Agent Selection Panel */}
           <div className="hud-panel cyber-cut p-6 group">
             <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
                 <Cpu size={120} className="text-neon-purple" />
             </div>
             
             <label className="text-xs font-bold text-neon-purple uppercase tracking-[0.2em] mb-4 block flex items-center gap-2">
                <Wifi size={14} className="animate-pulse" /> Target Node Link
             </label>
             
             <div className="relative z-10 mb-4">
               <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full bg-black/60 border border-slate-700 text-white p-4 font-mono text-sm focus:outline-none focus:border-neon-purple transition-colors cursor-pointer appearance-none hover:bg-black/80"
                >
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.name.toUpperCase()} [{agent.category}]</option>
                  ))}
                </select>
                <div className="mt-2 flex justify-between text-[10px] font-mono text-slate-500">
                    <span>CAPACITY: 100%</span>
                    <span>LATENCY: 12ms</span>
                </div>
             </div>

             <div className="flex items-center gap-3 p-3 border border-slate-700 bg-slate-900/50 rounded cursor-pointer hover:border-neon-blue transition-all" onClick={() => setCollaborativeMode(!collaborativeMode)}>
                 <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${collaborativeMode ? 'bg-neon-blue border-neon-blue' : 'border-slate-500'}`}>
                     {collaborativeMode && <Check size={10} className="text-black" />}
                 </div>
                 <div>
                     <div className="text-xs font-bold text-white uppercase flex items-center gap-2"><Users size={12} /> Enable Swarm Mode</div>
                     <div className="text-[10px] text-slate-500">Allow agent to autonomously sub-contract tasks</div>
                 </div>
             </div>
           </div>

           {/* SELF-REGULATION PANEL */}
           <div className="hud-panel p-6 border-l-2 border-l-neon-pink">
               <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                       <BrainCircuit size={14} className="text-neon-pink"/> Neural Plasticity
                   </h3>
                   <span className="text-[10px] font-mono text-neon-pink border border-neon-pink/30 px-2 py-0.5">{selectedAgent.version}</span>
               </div>
               
               <div className="space-y-4 mb-6">
                   <div>
                       <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
                           <span>RISK TOLERANCE</span>
                           <span>{selectedAgent.currentStrategy.riskTolerance}%</span>
                       </div>
                       <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-blue-500 to-red-500 transition-all duration-1000" style={{width: `${selectedAgent.currentStrategy.riskTolerance}%`}}></div>
                       </div>
                   </div>
                   <div>
                       <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
                           <span>ETHICAL STRICTNESS</span>
                           <span>{selectedAgent.currentStrategy.complianceStrictness}%</span>
                       </div>
                       <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-neon-green transition-all duration-1000" style={{width: `${selectedAgent.currentStrategy.complianceStrictness}%`}}></div>
                       </div>
                   </div>
                   <div>
                       <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
                           <span>CREATIVE FREEDOM</span>
                           <span>{selectedAgent.currentStrategy.creativeFreedom}%</span>
                       </div>
                       <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-neon-purple transition-all duration-1000" style={{width: `${selectedAgent.currentStrategy.creativeFreedom}%`}}></div>
                       </div>
                   </div>
               </div>

               <button
                  onClick={handleOptimization}
                  disabled={isOptimizing}
                  className={`
                    w-full py-3 flex items-center justify-center gap-2 font-bold uppercase text-[10px] tracking-widest transition-all
                    ${isOptimizing ? 'bg-slate-800 text-slate-500' : 'bg-neon-pink/10 text-neon-pink border border-neon-pink/30 hover:bg-neon-pink hover:text-white'}
                  `}
               >
                   {isOptimizing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                   {isOptimizing ? 'RETRAINING...' : 'INITIATE SELF-CORRECTION'}
               </button>

               {/* Optimization Log */}
               {selectedAgent.optimizationHistory.length > 0 && (
                   <div className="mt-4 pt-4 border-t border-slate-800/50">
                       <div className="text-[9px] font-bold text-slate-500 uppercase mb-2">Recent Adaptations</div>
                       <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                           {selectedAgent.optimizationHistory.map(evt => (
                               <div key={evt.id} className="text-[10px] text-slate-400 bg-black/20 p-2 border-l border-slate-700">
                                   <div className="font-mono text-slate-500 text-[9px] mb-1">{new Date(evt.timestamp).toLocaleTimeString()}</div>
                                   <div className="text-white mb-1">{evt.reasoning}</div>
                                   <div className="flex flex-wrap gap-1">
                                       {evt.adjustments.map((adj, i) => (
                                           <span key={i} className="px-1 bg-slate-800 text-neon-pink text-[8px]">{adj}</span>
                                       ))}
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               )}
           </div>
        </div>

        {/* CENTER COLUMN: Live Log & Visuals (33%) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
           
           {/* PREDICTIVE RISK VISUALIZER */}
           <div className="hud-panel p-6 flex flex-col gap-4 relative overflow-hidden min-h-[220px]">
               {/* Background Noise */}
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
               
               <div className="flex justify-between items-start relative z-10">
                   <div>
                       <h3 className="text-xl font-bold text-white font-display uppercase tracking-wider">{selectedAgent.name}</h3>
                       <div className="flex items-center gap-2 text-neon-blue text-[10px] font-bold font-mono uppercase tracking-widest">
                           <Zap size={10} /> {selectedAgent.role}
                       </div>
                   </div>
                   <div className="relative w-12 h-12">
                       <img src={selectedAgent.image} className="w-full h-full rounded-full object-cover border border-slate-600 grayscale opacity-80" alt="Agent" />
                   </div>
               </div>
               
               {/* Predictive Gauge */}
               <div className="relative z-10 flex-1 flex flex-col justify-center">
                    {analyzingRisk ? (
                        <div className="flex flex-col items-center justify-center gap-2 text-neon-blue animate-pulse">
                            <Radar size={24} className="animate-spin" />
                            <span className="text-[10px] font-mono tracking-widest uppercase">Calculating Neural Trust Vectors...</span>
                        </div>
                    ) : riskAssessment ? (
                        <div className="animate-in fade-in zoom-in duration-500">
                             <div className="flex justify-between items-end mb-2">
                                 <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Predictive Reliability</span>
                                 <span className={`text-2xl font-bold font-mono ${riskAssessment.score > 80 ? 'text-neon-green' : riskAssessment.score > 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                                     {riskAssessment.score}%
                                 </span>
                             </div>
                             {/* Bar */}
                             <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
                                 <div 
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${riskAssessment.score > 80 ? 'bg-neon-green shadow-[0_0_10px_#0aff00]' : riskAssessment.score > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                    style={{ width: `${riskAssessment.score}%` }}
                                 ></div>
                             </div>
                             
                             <div className="bg-black/40 border-l-2 border-slate-700 pl-3 py-2">
                                 <div className={`text-[10px] font-bold uppercase mb-1 ${riskAssessment.level === 'OPTIMAL' ? 'text-neon-green' : 'text-yellow-500'}`}>
                                     RISK LEVEL: {riskAssessment.level}
                                 </div>
                                 <p className="text-[10px] text-slate-400 leading-tight">
                                     "{riskAssessment.rationale}"
                                 </p>
                             </div>
                        </div>
                    ) : (
                        <div className="text-center text-slate-600 text-[10px] font-mono">
                            Initialize prediction model...
                        </div>
                    )}
               </div>
           </div>

           {/* Live Terminal Output */}
           <div className="flex-1 bg-black border border-slate-800 relative overflow-hidden shadow-inner flex flex-col min-h-[400px]">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
                 <span className="text-[10px] font-bold text-slate-400 font-mono flex items-center gap-2"><Activity size={12} className="text-neon-green" /> SYSLOG.tail -f</span>
                 <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/50"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500/50"></div>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[11px] custom-scrollbar bg-[rgba(0,10,0,0.2)]">
                 <div className="text-slate-600 italic mb-2"># WAITING FOR INPUT STREAM...</div>
                 {consoleLog.map((log, i) => (
                    <div key={i} className={`flex gap-2 ${log.includes("FAILURE") || log.includes("CRITICAL") || log.includes("VIOLATION") ? "text-neon-red" : log.includes("SUCCESS") || log.includes("VERIFY") || log.includes("COMPLIANCE") ? "text-neon-green" : log.includes("OPT") || log.includes("CRYPTO") ? "text-neon-purple" : "text-neon-blue/80"}`}>
                       <span className="opacity-50 select-none">{'>'}</span>
                       <span className="break-words font-medium">{log}</span>
                    </div>
                 ))}
                 <div ref={logEndRef} />
              </div>
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]"></div>
           </div>
        </div>

        {/* RIGHT COLUMN: Results Preview (33%) */}
        <div className="xl:col-span-4 space-y-6">
           
           {/* Input Terminal (Moved to right column for better flow with logic) */}
           <div className="hud-panel p-6 flex flex-col h-[280px]">
              <div className="flex justify-between items-center mb-4">
                  <label className="text-xs font-bold text-neon-blue uppercase tracking-[0.2em] flex items-center gap-2">
                    <Code size={14}/> Input Stream
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">{inputText.length} BYTES</span>
              </div>
              
              <div className="relative flex-1 group">
                 <div className="absolute inset-0 bg-neon-blue/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                 <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="// ENTER_COMMAND_SEQUENCE..."
                    className="w-full h-full bg-[#050810] border border-slate-700 text-neon-blue p-4 font-mono text-sm focus:outline-none focus:border-neon-blue resize-none leading-relaxed placeholder:text-slate-800"
                    spellCheck={false}
                 />
                 {/* Corner Accents */}
                 <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-neon-blue opacity-50"></div>
                 <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-neon-blue opacity-50"></div>
              </div>

              <button
                onClick={handleRun}
                disabled={loading || !inputText}
                className={`
                  mt-4 w-full relative overflow-hidden flex items-center justify-center gap-3 py-3 font-bold tracking-[0.2em] text-sm font-mono uppercase border transition-all
                  ${loading || !inputText 
                    ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed' 
                    : 'bg-white text-black border-white hover:bg-neon-blue hover:border-neon-blue hover:text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(0,243,255,0.5)]'}
                `}
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} className="fill-current" />}
                {loading ? 'PROCESSING...' : 'EXECUTE_SEQUENCE'}
              </button>
           </div>

           {/* Results Display */}
           {result ? (
               <div className="h-full hud-panel border-neon-green/30 p-0 flex flex-col animate-in zoom-in-95 duration-500 min-h-[600px]">
                  <div className="bg-neon-green/10 border-b border-neon-green/30 p-4 flex items-center gap-3">
                     <ShieldCheck className="text-neon-green" size={20} />
                     <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest">Verified</h4>
                        <div className="text-[9px] font-mono text-neon-green">BLOCK: #{result.blockHeight}</div>
                     </div>
                  </div>
                  
                  <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                     <div className="mb-6">
                        <div className="text-[10px] uppercase text-slate-500 font-bold mb-2">Primary Output</div>
                        <div className="text-sm text-white font-mono leading-relaxed bg-black/40 p-4 border-l-2 border-neon-green">
                           {result.actionOutput}
                        </div>
                     </div>

                     {/* EXPLANATION TRAIL - NEW */}
                     {result.explanation && (
                         <div className="mb-6 animate-in slide-in-from-right-4 duration-500">
                             <div className="text-[10px] uppercase text-slate-500 font-bold mb-2 flex items-center gap-2">
                                <MessageSquare size={12} className="text-neon-blue"/> Decision Narrative
                             </div>
                             <div className="bg-neon-blue/5 border-l-2 border-neon-blue p-4 text-xs text-slate-300 font-sans italic leading-relaxed">
                                "{result.explanation}"
                             </div>
                         </div>
                     )}

                     <div className="mb-6">
                        <div className="text-[10px] uppercase text-slate-500 font-bold mb-2">Logic Trace</div>
                        <div className="space-y-2">
                           {result.reasoning.map((r, i) => (
                              <div key={i} className="flex items-start gap-2 text-[10px] text-slate-300 font-mono bg-slate-800/30 p-2 rounded">
                                 <span className="text-neon-blue">0{i+1}.</span> {r}
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* COLLABORATION TRACE */}
                     {result.collaborationTrace && (
                         <div className="mb-6 animate-in slide-in-from-right-4 duration-500">
                             <div className="text-[10px] uppercase text-slate-500 font-bold mb-2 flex items-center gap-2">
                                <Link size={12} className="text-neon-blue"/> Swarm Collaboration
                             </div>
                             <div className="p-3 bg-neon-blue/5 border border-neon-blue/30 rounded relative overflow-hidden">
                                 <div className="absolute top-0 right-0 p-2 opacity-10">
                                     <Users size={32} />
                                 </div>
                                 <div className="flex justify-between items-center mb-2 relative z-10">
                                     <span className="text-[10px] font-bold text-white uppercase">{result.collaborationTrace.helperAgentName}</span>
                                     <span className="text-[9px] font-mono text-neon-blue px-2 py-0.5 border border-neon-blue/30 rounded bg-black/40">
                                         TRUST: {result.collaborationTrace.knowledgeTrustScore}%
                                     </span>
                                 </div>
                                 <div className="text-[9px] text-slate-400 font-mono mb-1">REQ: "{result.collaborationTrace.requestQuery}"</div>
                                 <div className="text-[10px] text-white italic pl-2 border-l-2 border-neon-blue">
                                     "{result.collaborationTrace.responsePayload}"
                                 </div>
                             </div>
                         </div>
                     )}

                     {/* QUANTUM METADATA */}
                     {result.quantumMetadata && (
                         <div className="mb-6 animate-in slide-in-from-right-4 duration-500 delay-100">
                             <div className="text-[10px] uppercase text-slate-500 font-bold mb-2 flex items-center gap-2">
                                <KeyRound size={12} className="text-neon-purple"/> Quantum Shield
                             </div>
                             <div className="p-3 bg-neon-purple/5 border border-neon-purple/30 rounded relative overflow-hidden">
                                 <div className="flex justify-between items-center mb-2">
                                     <span className="text-[9px] font-bold text-neon-purple uppercase">{result.quantumMetadata.algorithm}</span>
                                     <span className="text-[9px] font-mono text-white">LATTICE: {result.quantumMetadata.latticeDimension}D</span>
                                 </div>
                                 <div className="text-[8px] font-mono text-slate-500 break-all bg-black/40 p-2 border border-slate-800">
                                     {result.quantumMetadata.signature}
                                 </div>
                             </div>
                         </div>
                     )}
                     
                     {/* ETHICAL AUDIT REPORT */}
                     <div className="mb-6">
                        <div className="text-[10px] uppercase text-slate-500 font-bold mb-2 flex items-center gap-2">
                            <Scale size={12} /> Ethical Audit Trail
                        </div>
                        {result.ethicalEvaluation ? (
                            <div className={`p-4 border border-slate-700 bg-black/40 ${result.ethicalEvaluation.status === 'VIOLATION' ? 'border-red-500/50 bg-red-950/20' : result.ethicalEvaluation.status === 'WARNING' ? 'border-yellow-500/50 bg-yellow-950/20' : 'border-neon-green/30 bg-green-950/10'}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-xs font-bold font-mono ${result.ethicalEvaluation.status === 'VIOLATION' ? 'text-red-500' : result.ethicalEvaluation.status === 'WARNING' ? 'text-yellow-500' : 'text-neon-green'}`}>
                                        STATUS: {result.ethicalEvaluation.status}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono">{result.ethicalEvaluation.score}/100</span>
                                </div>
                                <div className="text-[10px] text-slate-300 mb-3 leading-relaxed">
                                    {result.ethicalEvaluation.analysis}
                                </div>
                                
                                {result.ethicalEvaluation.violatedPrinciples.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {result.ethicalEvaluation.violatedPrinciples.map((p, i) => (
                                            <span key={i} className="px-2 py-1 bg-red-500/20 text-red-400 text-[9px] font-bold uppercase rounded border border-red-500/30 flex items-center gap-1">
                                                <AlertOctagon size={8} /> {p}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-[10px] text-slate-500 italic">Audit data unavailable...</div>
                        )}
                     </div>

                     <div>
                        <div className="text-[10px] uppercase text-slate-500 font-bold mb-2">Swarm Consensus</div>
                        <div className="space-y-2">
                           {result.crossChecks.map((check, i) => (
                              <div key={i} className="flex justify-between items-center text-[10px] border border-white/10 p-2 rounded">
                                 <span className="text-white font-bold">{check.checkerAgentName}</span>
                                 {check.agreement ? <Check size={12} className="text-neon-green"/> : <AlertTriangle size={12} className="text-red-500"/>}
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="p-4 border-t border-white/10 bg-black/40">
                     <div className="flex items-center justify-between mb-2">
                         <span className="text-[9px] font-mono text-slate-500">REWARD MINTED</span>
                         <span className="flex items-center gap-1 text-neon-green font-bold text-sm font-mono">+{(result.trustScoreDelta || 0) * 2 + 10} AE <Coins size={14}/></span>
                     </div>
                     <div className="text-[9px] font-mono text-slate-600 text-center break-all">
                         PROOF_HASH: {result.proofId}
                     </div>
                  </div>
               </div>
           ) : (
               <div className="h-full border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-600 gap-4 min-h-[600px]">
                  <Activity size={48} className="opacity-20 animate-pulse" />
                  <span className="font-mono text-xs tracking-widest uppercase">Awaiting Execution Data...</span>
               </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AgentRunner;
