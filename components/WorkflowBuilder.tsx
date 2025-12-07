
import React, { useState, useRef, useEffect } from 'react';
import { Agent, AgentActionProof } from '../types';
import { runAgentTask } from '../services/geminiService';
import { Plus, ArrowRight, Layers, FileText, CheckCircle, Loader2, GitMerge, Box, X, ChevronDown, Trash2, Cpu, Zap, Activity, Play } from 'lucide-react';

interface WorkflowBuilderProps {
  agents: Agent[];
  onProofCreated: (proof: AgentActionProof) => void;
}

interface WorkflowNode {
  id: string;
  agent: Agent;
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ agents, onProofCreated }) => {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedAgentToAdd, setSelectedAgentToAdd] = useState<string>(agents[0].id);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(-1); 
  const [stepResults, setStepResults] = useState<AgentActionProof[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addNode = () => {
    const agent = agents.find(a => a.id === selectedAgentToAdd);
    if (agent) {
        setNodes(prev => [...prev, { id: `step-${prev.length + 1}-${Date.now()}`, agent }]);
    }
  };

  const removeNode = (index: number) => {
    setNodes(prev => prev.filter((_, i) => i !== index));
  };

  const clearWorkflow = () => {
      setNodes([]);
      setStepResults([]);
      setLogs([]);
      setCurrentStep(-1);
  };

  const handleRunWorkflow = async () => {
    if (nodes.length === 0 || !inputText.trim()) return;
    
    setIsRunning(true);
    setCurrentStep(0);
    setStepResults([]);
    setLogs(["[SYSTEM] INITIALIZING WORKFLOW SEQUENCE...", "[NETWORK] ESTABLISHING MULTI-AGENT HANDSHAKE..."]);

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      setLogs(prev => [...prev, "[CRITICAL] API KEY CONFIGURATION MISSING."]);
      setIsRunning(false);
      return;
    }

    let accumulatedContext = `ORIGINAL INPUT:\n"${inputText}"\n\n`;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      setCurrentStep(i);
      setLogs(prev => [...prev, `[STEP ${i + 1}] ENGAGING ${node.agent.name.toUpperCase()}...`]);

      try {
        const stepInput = `
          PRIOR CONTEXT CHAIN:
          ${accumulatedContext}

          --------------------------------------------------
          YOUR TASK (${node.agent.role}):
          Analyze the context provided above.
          If FIRST agent: Analyze "ORIGINAL INPUT".
          If SUBSEQUENT agent: Verify/Refine previous outputs.
        `;

        const execution = await runAgentTask(node.agent, stepInput, apiKey);
        
        const proof: AgentActionProof = {
          proofId: execution.proofId,
          timestamp: new Date().toISOString(),
          agentId: node.agent.id,
          agentName: node.agent.name,
          inputSnippet: i === 0 ? inputText : `Chain Input (Step ${i+1})`,
          actionOutput: execution.actionOutput,
          reasoning: execution.reasoning,
          crossChecks: execution.crossChecks,
          isDisputed: false,
          trustScoreDelta: execution.trustScoreDelta,
          blockHeight: Math.floor(Math.random() * 10000000)
        };

        setStepResults(prev => [...prev, proof]);
        onProofCreated(proof);
        accumulatedContext += `\n--- OUTPUT STEP ${i+1} ---\n${execution.actionOutput}\n`;
        setLogs(prev => [...prev, `[SUCCESS] NODE ${i + 1} VERIFIED :: ${proof.proofId.substring(0,8)}`]);

      } catch (e: any) {
        setLogs(prev => [...prev, `[FAILURE] NODE ${i + 1} CRASH: ${e.message}`]);
        setIsRunning(false);
        return; 
      }
    }

    setCurrentStep(nodes.length);
    setIsRunning(false);
    setLogs(prev => [...prev, "[SYSTEM] SEQUENCE COMPLETE. FINAL REPORT GENERATED."]);
  };

  return (
    <div className="max-w-[1600px] mx-auto w-full p-6 md:p-8 pb-24 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-8 border-b border-white/5 pb-6">
          <h2 className="text-3xl font-bold text-white flex items-center gap-4 font-display uppercase tracking-wider">
               <div className="p-2 bg-neon-pink/10 border border-neon-pink/30 rounded">
                   <GitMerge className="text-neon-pink" size={24} />
               </div>
               Workflow Studio
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-mono tracking-widest pl-16">CHAIN MULTI-AGENT VERIFICATION PROTOCOLS</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
         
         {/* Left Col: Builder Canvas */}
         <div className="xl:col-span-8 flex flex-col gap-6">
            
            {/* Input Section */}
            <div className="hud-panel p-6 group">
               <label className="text-xs font-bold text-neon-blue uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <FileText size={14} /> Source Data Packet
               </label>
               <div className="relative">
                   <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      disabled={isRunning}
                      placeholder="// PASTE_CONTRACT_OR_DATA_STREAM_HERE..."
                      className="w-full h-32 bg-[#050810] border border-slate-700 p-4 text-white text-sm focus:outline-none focus:border-neon-pink transition-all font-mono resize-none placeholder:text-slate-700 relative z-10"
                   />
                   {/* Background Elements */}
                   <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-neon-pink opacity-50 z-20"></div>
                   <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-neon-pink opacity-50 z-20"></div>
               </div>
            </div>

            {/* Pipeline Visualizer (Circuit Board Style) */}
            <div className="hud-panel p-8 min-h-[500px] relative overflow-hidden flex flex-col bg-[#02040a]">
               {/* Circuit Background Pattern */}
               <div className="absolute inset-0 opacity-20 pointer-events-none" 
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h80v80h-80z' fill='none' stroke='%23333' stroke-width='1'/%3E%3Cpath d='M30 30h40v40h-40z' fill='none' stroke='%23333' stroke-width='1'/%3E%3C/svg%3E")`,
                      backgroundSize: '50px 50px'
                    }}
               ></div>

               <div className="flex justify-between items-center mb-10 relative z-10">
                  <h3 className="text-xs font-bold text-white flex items-center gap-2 tracking-[0.2em] uppercase">
                     <Layers size={14} className="text-neon-pink"/> Sequence Map
                  </h3>
                  <div className="flex items-center gap-4">
                     <button 
                        onClick={clearWorkflow} 
                        disabled={isRunning || nodes.length === 0}
                        className="text-[10px] font-mono font-bold text-slate-500 hover:text-neon-red flex items-center gap-1 disabled:opacity-30 transition-colors uppercase"
                     >
                        <Trash2 size={12}/> Reset_Chain
                     </button>
                     <div className="text-[10px] text-neon-pink font-mono border border-neon-pink/30 px-3 py-1 bg-neon-pink/5">
                        LENGTH: {nodes.length}
                     </div>
                  </div>
               </div>

               {/* Nodes Container */}
               <div className="relative z-10 flex flex-wrap items-center gap-8 flex-1 content-start">
                  
                  {/* Start Node */}
                  <div className="flex flex-col items-center gap-2 opacity-60">
                     <div className="w-16 h-16 rounded bg-slate-900 border border-slate-700 flex items-center justify-center shadow-lg relative tech-border">
                        <span className="text-xs font-bold text-white z-10 font-mono">INPUT</span>
                     </div>
                     <ArrowRight size={20} className="text-slate-700 rotate-90 md:rotate-0" />
                  </div>

                  {/* Dynamic Nodes (Circuit Chips) */}
                  {nodes.map((node, index) => (
                     <div key={node.id} className="flex flex-col md:flex-row items-center gap-8 group animate-in zoom-in duration-300">
                        <div className="relative">
                           {/* The Chip */}
                           <div className={`
                              w-60 p-5 rounded-sm border transition-all relative z-10 flex flex-col gap-3 backdrop-blur-md
                              ${currentStep === index && isRunning 
                                 ? 'bg-neon-pink/10 border-neon-pink shadow-[0_0_30px_rgba(255,0,153,0.3)]' 
                                 : 'bg-[#080c14] border-slate-700 hover:border-slate-500'}
                              ${currentStep > index ? 'border-neon-green/50 opacity-80' : ''}
                           `}>
                              
                              <div className="flex justify-between items-start">
                                 <Cpu size={24} className={currentStep === index && isRunning ? 'text-neon-pink animate-pulse' : 'text-slate-600'} />
                                 <div className="text-[10px] font-mono text-slate-500">ID: 0{index + 1}</div>
                              </div>
                              
                              <div>
                                 <div className="text-sm font-bold text-white truncate font-display uppercase tracking-wider">{node.agent.name}</div>
                                 <div className="text-[10px] text-neon-blue truncate uppercase font-mono tracking-widest">{node.agent.role}</div>
                              </div>

                              {/* Progress Bar within Chip */}
                              <div className="h-1 w-full bg-slate-800 overflow-hidden mt-1">
                                 {currentStep > index ? (
                                    <div className="h-full w-full bg-neon-green"></div>
                                 ) : currentStep === index && isRunning ? (
                                    <div className="h-full w-2/3 bg-neon-pink animate-pulse"></div>
                                 ) : null}
                              </div>

                              {!isRunning && (
                                 <button 
                                    onClick={() => removeNode(index)}
                                    className="absolute -top-3 -right-3 bg-black text-slate-500 border border-slate-700 p-1 hover:text-white hover:border-neon-red transition-colors opacity-0 group-hover:opacity-100"
                                 >
                                    <X size={14} />
                                 </button>
                              )}
                           </div>

                           {/* Connecting Line (Data Bus) */}
                           {index < nodes.length - 1 && (
                              <div className="hidden md:block absolute top-1/2 -right-8 w-8 h-1 bg-slate-800 -z-10 overflow-hidden">
                                  {isRunning && currentStep === index && (
                                      <div className="h-full w-1/2 bg-neon-pink animate-pulse blur-[1px]"></div>
                                  )}
                              </div>
                           )}
                           {index < nodes.length - 1 && (
                              <div className="md:hidden absolute -bottom-8 left-1/2 w-1 h-8 bg-slate-800 -z-10"></div>
                           )}
                        </div>
                        <ArrowRight size={20} className="text-slate-700 rotate-90 md:rotate-0" />
                     </div>
                  ))}
               </div>

               {/* Toolbar */}
               {!isRunning && (
                   <div className="mt-16 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row items-end gap-6 relative z-20">
                       <div className="flex-1 w-full md:w-auto">
                           <label className="text-[10px] uppercase font-bold text-slate-500 mb-3 block tracking-[0.2em] font-mono">Select Module</label>
                           <div className="relative group">
                                <select 
                                    value={selectedAgentToAdd}
                                    onChange={(e) => setSelectedAgentToAdd(e.target.value)}
                                    className="w-full bg-[#050810] border border-slate-700 text-white p-4 pr-10 text-sm focus:outline-none focus:border-neon-blue appearance-none cursor-pointer hover:bg-black transition-colors font-mono uppercase"
                                >
                                    {agents.map(a => (
                                        <option key={a.id} value={a.id}>{a.name} // {a.role}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-4 text-neon-blue pointer-events-none" size={16} />
                           </div>
                       </div>
                       <button 
                          onClick={addNode}
                          className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white font-bold border border-slate-700 hover:border-neon-pink hover:text-neon-pink transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                       >
                           <Plus size={16} /> Add Logic Node
                       </button>
                   </div>
               )}
            </div>

            {/* Run Button */}
            <div className="flex justify-end">
               <button
                  onClick={handleRunWorkflow}
                  disabled={isRunning || nodes.length === 0 || !inputText}
                  className={`
                     px-12 py-5 font-bold flex items-center gap-3 transition-all w-full md:w-auto justify-center text-sm tracking-[0.2em] uppercase clip-path-polygon
                     ${isRunning || nodes.length === 0 || !inputText
                        ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
                        : 'bg-neon-pink text-white hover:bg-white hover:text-neon-pink shadow-[0_0_30px_rgba(255,0,153,0.4)] border border-neon-pink'}
                  `}
               >
                  {isRunning ? (
                     <>
                        <Loader2 size={18} className="animate-spin" /> Sequencing...
                     </>
                  ) : (
                     <>
                        <Play size={18} className="fill-current" /> Initiate Workflow
                     </>
                  )}
               </button>
            </div>
         </div>

         {/* Right Col: Live Stream & Results */}
         <div className="xl:col-span-4 flex flex-col gap-6 h-full min-h-[600px]">
            
            {/* Terminal Log */}
            <div className="hud-panel p-0 flex flex-col h-64 bg-black">
               <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 font-mono">
                     <Box size={12} className="text-neon-blue" /> Execution.log
                  </div>
                  <div className="flex gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                     <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto font-mono text-[10px] p-4 space-y-1 custom-scrollbar text-slate-300">
                  {logs.length === 0 && <span className="text-slate-600 italic">// AWAITING CHAIN INITIALIZATION...</span>}
                  {logs.map((log, i) => (
                     <div key={i} className={`break-words ${log.includes("FAILURE") || log.includes("CRITICAL") ? "text-neon-red" : log.includes("SUCCESS") ? "text-neon-green" : "text-slate-400"}`}>
                        <span className="opacity-30 mr-2">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                        {log}
                     </div>
                  ))}
                  <div ref={logsEndRef} />
               </div>
            </div>

            {/* Results Feed */}
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 relative min-h-0">
               <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] sticky top-0 bg-[#02040a] py-2 z-10 border-b border-slate-800 mb-2">Chain Output</h3>
               {stepResults.map((result, idx) => (
                  <div key={idx} className="bg-[#050810] border border-white/5 p-4 animate-in slide-in-from-right-8 duration-500 shadow-lg group hover:border-neon-blue/30 transition-colors relative">
                     {/* Decorative Line */}
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-neon-pink to-transparent"></div>
                     
                     <div className="flex justify-between items-start mb-3 pl-3">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-neon-pink font-mono text-xs font-bold">0{idx + 1}</span>
                                <span className="text-white font-bold text-xs uppercase tracking-wide font-display">{result.agentName}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono pl-6">Verified Output</span>
                        </div>
                        <CheckCircle size={14} className="text-neon-green shrink-0 mt-1" />
                     </div>
                     
                     <div className="bg-black/20 rounded border border-white/5 p-3 mb-3 ml-3 text-slate-300 text-xs leading-relaxed font-mono whitespace-pre-wrap break-words">
                        {result.actionOutput}
                     </div>
                     
                     {result.reasoning.length > 0 && (
                        <div className="ml-3 mb-3">
                            <div className="text-[9px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-1"><Activity size={10}/> Logic Trace</div>
                            <div className="flex flex-col gap-1">
                                {result.reasoning.map((r, ri) => (
                                    <div key={ri} className="text-[10px] text-slate-400 bg-slate-800/30 px-2 py-1 border-l-2 border-slate-700 font-mono break-words">
                                        {r}
                                    </div>
                                ))}
                            </div>
                        </div>
                     )}

                     <div className="flex items-center gap-2 text-[9px] text-slate-600 font-mono break-all pt-3 border-t border-slate-800/50 ml-3">
                        <span className="text-neon-blue shrink-0">HASH:</span> {result.proofId}
                     </div>
                  </div>
               ))}
               {stepResults.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-700 text-xs font-mono border border-dashed border-slate-800 bg-black/20 p-8 min-h-[200px]">
                     <Layers size={32} className="mb-4 opacity-20" />
                     Waiting for sequence data...
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;
