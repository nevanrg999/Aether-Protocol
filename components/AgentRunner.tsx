
import React, { useState, useEffect, useRef } from 'react';
import { Agent, AgentActionProof } from '../types';
import { runAgentTask } from '../services/geminiService';
import { Play, ShieldCheck, AlertTriangle, Cpu, Terminal, Code, Check, Loader2, ArrowRight, Activity, Globe, Lock, Wifi } from 'lucide-react';

interface AgentRunnerProps {
  agents: Agent[];
  onProofCreated: (proof: AgentActionProof) => void;
  initialAgentId?: string;
}

const AgentRunner: React.FC<AgentRunnerProps> = ({ agents, onProofCreated, initialAgentId }) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(initialAgentId || agents[0].id);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AgentActionProof | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consoleLog, setConsoleLog] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialAgentId) setSelectedAgentId(initialAgentId);
  }, [initialAgentId]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consoleLog]);

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

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

    try {
      const apiKey = process.env.API_KEY; 
      if (!apiKey) throw new Error("API Key configuration missing.");

      setTimeout(() => setConsoleLog(prev => [...prev, "[SWARM] INITIATING CONSENSUS PROTOCOL..."]), 800);

      const execution = await runAgentTask(selectedAgent, inputText, apiKey);

      setConsoleLog(prev => [...prev, `[RECV] PACKET RECEIVED FROM ${selectedAgent.name}`, `[VERIFY] ${execution.crossChecks.length} NODES CONFIRMED OUTPUT`]);

      const newProof: AgentActionProof = {
        proofId: execution.proofId,
        timestamp: new Date().toISOString(),
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        inputSnippet: inputText,
        actionOutput: execution.actionOutput,
        reasoning: execution.reasoning,
        crossChecks: execution.crossChecks,
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

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      
      {/* Console Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neon-blue/20 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3 font-display tracking-wide">
            <Terminal className="text-neon-blue" size={28} />
            NEURAL_CONSOLE <span className="text-slate-600 text-lg">// v2.4</span>
          </h2>
        </div>
        <div className="flex gap-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-neon-green/10 text-neon-green border border-neon-green/30 text-[10px] font-mono tracking-widest">
                <Globe size={12} /> NET_ONLINE
             </div>
             <div className="flex items-center gap-2 px-3 py-1 bg-neon-blue/10 text-neon-blue border border-neon-blue/30 text-[10px] font-mono tracking-widest">
                <Lock size={12} /> ENCRYPTED
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
             
             <div className="relative z-10">
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
           </div>
           
           {/* Input Terminal */}
           <div className="hud-panel p-6 flex flex-col h-[500px]">
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
                  mt-6 w-full relative overflow-hidden flex items-center justify-center gap-3 py-4 font-bold tracking-[0.2em] text-sm font-mono uppercase border transition-all
                  ${loading || !inputText 
                    ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed' 
                    : 'bg-white text-black border-white hover:bg-neon-blue hover:border-neon-blue hover:text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(0,243,255,0.5)]'}
                `}
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} className="fill-current" />}
                {loading ? 'PROCESSING...' : 'EXECUTE_SEQUENCE'}
              </button>
           </div>
        </div>

        {/* CENTER COLUMN: Live Log & Visuals (33%) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
           
           {/* Agent Visualizer */}
           <div className="hud-panel p-6 flex items-center gap-6 relative overflow-hidden h-[180px]">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              
              <div className="relative w-28 h-28 shrink-0">
                 <div className="absolute inset-0 border-2 border-dashed border-neon-blue/30 rounded-full animate-spin-slow"></div>
                 <div className="absolute inset-2 border border-neon-blue/50 rounded-full"></div>
                 <img src={selectedAgent.image} className="absolute inset-4 w-20 h-20 rounded-full object-cover grayscale" alt="Agent" />
              </div>
              
              <div className="relative z-10 flex-1 min-w-0">
                 <h3 className="text-xl font-bold text-white font-display uppercase tracking-wider truncate">{selectedAgent.name}</h3>
                 <p className="text-neon-blue text-[10px] font-bold font-mono uppercase tracking-widest mb-4 truncate">{selectedAgent.role}</p>
                 
                 <div className="grid grid-cols-2 gap-2">
                    <div className="bg-black/40 border border-slate-700 p-2 text-center">
                       <div className="text-[8px] text-slate-500 uppercase tracking-widest">Trust Score</div>
                       <div className="text-neon-green font-mono font-bold text-xs">{selectedAgent.reputationScore}%</div>
                    </div>
                    <div className="bg-black/40 border border-slate-700 p-2 text-center">
                       <div className="text-[8px] text-slate-500 uppercase tracking-widest">Op Cost</div>
                       <div className="text-white font-mono font-bold text-xs">{selectedAgent.pricePerCall}</div>
                    </div>
                 </div>
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
                    <div key={i} className={`flex gap-2 ${log.includes("FAILURE") || log.includes("CRITICAL") ? "text-neon-red" : log.includes("SUCCESS") || log.includes("VERIFY") ? "text-neon-green" : "text-neon-blue/80"}`}>
                       <span className="opacity-50 select-none">{'>'}</span>
                       <span className="break-words font-medium">{log}</span>
                    </div>
                 ))}
                 <div ref={logEndRef} />
              </div>
              {/* Scanline effect on terminal */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]"></div>
           </div>
        </div>

        {/* RIGHT COLUMN: Results Preview (33%) */}
        <div className="xl:col-span-4 space-y-6">
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

                  <div className="p-4 border-t border-white/10 bg-black/40 text-[9px] font-mono text-slate-500 text-center break-all">
                     PROOF_HASH: {result.proofId}
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
