
import React, { useState, useEffect } from 'react';
import { MOCK_AGENTS, MOCK_PROOFS_INITIAL } from './constants';
import { Agent, AgentActionProof, Transaction, AgentService, SecurityProtocol } from './types';
import { authorizeTransaction, monitorSecurityProtocols } from './services/geminiService';
import AgentRunner from './components/AgentRunner';
import ProofViewer from './components/ProofViewer';
import Marketplace from './components/Marketplace';
import WorkflowBuilder from './components/WorkflowBuilder';
import { LayoutDashboard, FileCheck, ShoppingBag, Terminal, Activity, Wifi, Shield, Clock, Zap, Server, Menu, X, Cpu, Radar, Lock, AlertCircle, Fingerprint, GitMerge, Check, Info, AlertTriangle, Hexagon, Globe, Database, Network, Box, ArrowUpRight, BarChart3, Radio, ShieldAlert, CheckCircle, Trash2, Wallet, ShieldCheck } from 'lucide-react';

enum View {
  DASHBOARD = 'DASHBOARD',
  RUNNER = 'RUNNER',
  WORKFLOWS = 'WORKFLOWS',
  PROOFS = 'PROOFS',
  MARKET = 'MARKET'
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

const Sparkline = ({ color = "#00f3ff" }) => (
    <div className="h-6 w-16 flex items-end gap-0.5 opacity-60">
       {[...Array(12)].map((_,i) => (
          <div key={i} className="w-1 bg-current transition-all duration-300" style={{ height: `${20 + Math.random() * 80}%`, color }} />
       ))}
    </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
  
  // PERSISTENCE LAYER
  const [proofs, setProofs] = useState<AgentActionProof[]>(() => {
    try {
      const saved = localStorage.getItem('aether_proofs');
      return saved ? JSON.parse(saved) : MOCK_PROOFS_INITIAL;
    } catch (e) {
      return MOCK_PROOFS_INITIAL;
    }
  });

  // SECURITY PROTOCOL STATE
  const [securityProtocol, setSecurityProtocol] = useState<SecurityProtocol>({
      version: 'PQC-v1.0.4',
      status: 'SECURE',
      threatLevel: 'LOW',
      activeAlgorithms: ['CRYSTALS-Kyber', 'Dilithium-5'],
      lastRotation: new Date().toISOString(),
      threatDescription: 'All systems nominal. Quantum coherence stable.'
  });

  // TOKEN SYSTEM STATE
  const [userBalance, setUserBalance] = useState<number>(1000); // Initial Airdrop
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [time, setTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0].id);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selectedProofId, setSelectedProofId] = useState<string | undefined>(undefined);
  const [tps, setTps] = useState(12);

  useEffect(() => {
    localStorage.setItem('aether_proofs', JSON.stringify(proofs));
  }, [proofs]);

  // Global Timer & Security Monitor Loop
  useEffect(() => {
    const timer = setInterval(async () => {
        setTime(new Date());
        setTps(prev => Math.floor(Math.max(8, Math.min(60, prev + (Math.random() * 10 - 5)))));
        
        // Randomly trigger security check (approx every 30s)
        if (Math.random() > 0.95) {
             const apiKey = process.env.API_KEY;
             if (apiKey) {
                 const newProto = await monitorSecurityProtocols(securityProtocol, Math.random() * 100, apiKey);
                 if (newProto.version !== securityProtocol.version || newProto.threatLevel !== securityProtocol.threatLevel) {
                     setSecurityProtocol(newProto);
                     addToast(`Security Protocol Updated: ${newProto.version}`, newProto.threatLevel === 'CRITICAL' ? 'error' : 'info');
                 }
             }
        }
    }, 1000);
    return () => clearInterval(timer);
  }, [securityProtocol]);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleUpdateAgent = (updatedAgent: Agent) => {
      setAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a));
      addToast(`Node Reconfigured: ${updatedAgent.name}`, 'info');
  };

  // --- TOKEN LOGIC ---
  const handlePurchaseService = async (agentId: string, service: AgentService) => {
      // ... (Existing logic same as before)
      const agent = agents.find(a => a.id === agentId);
      if (!agent) return;
      if (userBalance < service.price) { addToast("Insufficient Funds", 'error'); return; }
      try {
          const apiKey = process.env.API_KEY || '';
          const auth = await authorizeTransaction(agent, service.name, service.price, 95, apiKey);
          if (auth.authorized) {
              setUserBalance(prev => prev - service.price);
              setAgents(prev => prev.map(a => a.id === agentId ? { ...a, tokenBalance: a.tokenBalance + service.price } : a));
              const tx: Transaction = {
                  id: auth.txHash, from: 'USER', to: agentId, amount: service.price, type: 'SERVICE_PAYMENT',
                  serviceName: service.name, timestamp: new Date().toISOString(), status: 'CONFIRMED', hash: auth.txHash
              };
              setTransactions(prev => [...prev, tx]);
              addToast(`Service Purchased: ${service.name}`, 'success');
          } else { addToast(`Transaction Rejected: ${auth.reason}`, 'error'); }
      } catch (e) { addToast("Transaction Failed", 'error'); }
  };

  const handleProofCreated = (newProof: AgentActionProof) => {
    setProofs(prev => [newProof, ...prev]);
    addToast(`Proof Mined: ${newProof.proofId.substring(0,8)}...`, 'success');
    if (newProof.trustScoreDelta && newProof.trustScoreDelta > 0) {
        const rewardAmount = (newProof.trustScoreDelta * 2) + 10;
        setAgents(prev => prev.map(a => a.id === newProof.agentId ? { ...a, tokenBalance: a.tokenBalance + rewardAmount } : a));
        const tx: Transaction = {
            id: `reward-${Date.now()}`, from: 'NETWORK_MINT', to: newProof.agentId, amount: rewardAmount,
            type: 'TRUST_REWARD', timestamp: new Date().toISOString(), status: 'CONFIRMED', hash: `0x${Math.random().toString(16).slice(2)}`
        };
        setTransactions(prev => [...prev, tx]);
        addToast(`Trust Reward: +${rewardAmount} AE`, 'success');
    }
  };

  const handleDispute = (proofId: string) => {
    setProofs(prev => prev.map(p => p.proofId === proofId ? { ...p, isDisputed: true } : p));
  };

  const resetLedger = () => {
      if(window.confirm("WARNING: This will wipe the local blockchain state. Continue?")) {
        setProofs(MOCK_PROOFS_INITIAL);
        localStorage.removeItem('aether_proofs');
        addToast("Ledger Reset Complete", 'error');
      }
  };

  const navigateToRunner = (agentId: string) => {
    setSelectedAgentId(agentId);
    setCurrentView(View.RUNNER);
    addToast("Neural Link Established", 'info');
  };

  const navigateToProof = (proofId: string) => {
      setSelectedProofId(proofId);
      setCurrentView(View.PROOFS);
  };

  // --- DASHBOARD COMPONENT ---
  const Dashboard = () => {
    const disputes = proofs.filter(p => p.isDisputed && !p.disputeStatus?.startsWith('Resolved'));
    
    return (
    <div className="max-w-[1600px] mx-auto p-6 md:p-8 space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-24 relative z-10">
      
      {/* 1. NETWORK TELEMETRY STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
              { label: 'Network TPS', value: tps, unit: 'TX/s', icon: <Activity size={16}/>, color: '#00f3ff' },
              { label: 'Block Time', value: '2.04', unit: 's', icon: <Clock size={16}/>, color: '#0aff00' },
              { label: 'Security Level', value: securityProtocol.threatLevel, unit: '', icon: <ShieldCheck size={16}/>, color: securityProtocol.threatLevel === 'CRITICAL' ? '#ff0000' : '#bc13fe' },
              { label: 'Protocol', value: securityProtocol.version.replace('PQC-', ''), unit: '', icon: <Lock size={16}/>, color: '#facc15' },
          ].map((stat, i) => (
              <div key={i} className="hud-panel p-5 flex items-center justify-between group h-24">
                 <div className="flex flex-col justify-between h-full">
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        {stat.icon} {stat.label}
                    </div>
                    <div className="text-2xl font-bold text-white font-mono flex items-baseline gap-1 truncate">
                        {stat.value} <span className="text-xs text-slate-500 font-normal">{stat.unit}</span>
                    </div>
                 </div>
                 <Sparkline color={stat.color} />
              </div>
          ))}
      </div>

      {/* 2. MAIN SPLIT VIEW */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-[calc(100vh-280px)] min-h-[600px]">
        
        {/* LEFT: LIVE CONSENSUS STREAM */}
        <div className="xl:col-span-8 hud-panel p-0 flex flex-col relative overflow-hidden cyber-cut h-full">
            <div className="p-5 border-b border-white/5 bg-black/20 flex justify-between items-center shrink-0">
                <h3 className="text-sm font-bold text-neon-blue uppercase tracking-widest flex items-center gap-2">
                    <Radio size={16} className="animate-pulse" /> Live Consensus Stream
                </h3>
                {/* ... (Existing header controls) */}
            </div>
            
            {/* Table Header */}
            <div className="grid grid-cols-6 md:grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 bg-slate-900/50 text-[10px] font-mono text-slate-500 uppercase tracking-wider shrink-0">
                <div className="col-span-3 md:col-span-3">Tx Hash / Block</div>
                <div className="col-span-2 md:col-span-3">Agent Node</div>
                <div className="hidden md:block md:col-span-3">Action Type</div>
                <div className="col-span-1 md:col-span-2">Status</div>
                <div className="hidden md:block md:col-span-1 text-right">Time</div>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {proofs.map((p, i) => (
                    <div 
                        key={p.proofId} 
                        onClick={() => navigateToProof(p.proofId)}
                        className="grid grid-cols-6 md:grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group items-center text-xs font-mono"
                    >
                        <div className="col-span-3 md:col-span-3 overflow-hidden">
                            <div className="text-neon-blue font-bold truncate group-hover:underline decoration-neon-blue/50 underline-offset-4">{p.proofId}</div>
                            <div className="text-slate-600 text-[10px] mt-0.5 flex items-center gap-2">
                                <span>BLK #{p.blockHeight}</span>
                                {p.quantumMetadata && <span className="text-neon-purple font-bold">PQC</span>}
                            </div>
                        </div>
                        <div className="col-span-2 md:col-span-3 flex items-center gap-3 text-white overflow-hidden">
                            <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 overflow-hidden shrink-0 hidden sm:block">
                                <img src={`https://picsum.photos/seed/${p.agentId}/50`} className="w-full h-full object-cover opacity-80" alt=""/>
                            </div>
                            <span className="truncate">{p.agentName}</span>
                        </div>
                        <div className="hidden md:block md:col-span-3 text-slate-400 truncate">
                             {p.inputSnippet.length > 40 ? p.inputSnippet.substring(0, 40) + '...' : p.inputSnippet}
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            {p.isDisputed ? (
                                <span className="inline-flex px-2 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded text-[10px] font-bold items-center gap-1 justify-center md:justify-start">
                                    <AlertTriangle size={10} /> <span className="hidden md:inline">DISPUTED</span>
                                </span>
                            ) : (
                                <span className="inline-flex px-2 py-1 bg-neon-green/10 text-neon-green border border-neon-green/20 rounded text-[10px] font-bold items-center gap-1 justify-center md:justify-start">
                                    <Check size={10} /> <span className="hidden md:inline">VERIFIED</span>
                                </span>
                            )}
                        </div>
                        <div className="hidden md:block md:col-span-1 text-right text-slate-500">
                            {new Date(p.timestamp).toLocaleTimeString([], {hour12:false})}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* RIGHT: WIDGETS */}
        <div className="xl:col-span-4 flex flex-col gap-6 h-full">
            
            {/* NEW: QUANTUM THREAT MONITOR WIDGET */}
            <div className={`hud-panel p-6 border-t-2 ${securityProtocol.threatLevel === 'CRITICAL' ? 'border-t-red-500 shadow-[0_0_20px_rgba(255,0,0,0.2)]' : 'border-t-neon-purple'}`}>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <Radar size={16} className={securityProtocol.threatLevel === 'CRITICAL' ? 'text-red-500 animate-spin' : 'text-neon-purple'} /> 
                        Sentinel Monitor
                    </h3>
                    <span className={`px-2 py-0.5 text-[9px] font-bold border rounded ${securityProtocol.status === 'SECURE' ? 'border-neon-green text-neon-green' : 'border-red-500 text-red-500 animate-pulse'}`}>
                        {securityProtocol.status}
                    </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mb-4 leading-relaxed bg-black/20 p-2 border border-white/5">
                    {securityProtocol.threatDescription}
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span>LATTICE ENCRYPTION</span>
                        <span className="text-neon-purple">ACTIVE</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span>LAST KEY ROTATION</span>
                        <span>{new Date(securityProtocol.lastRotation).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span>ACTIVE ALGOS</span>
                        <span className="text-white">{securityProtocol.activeAlgorithms[0]}</span>
                    </div>
                </div>
            </div>

            {/* DISPUTE CENTER */}
            <div className="hud-panel p-6 flex flex-col gap-4 border-l-2 border-l-transparent hover:border-l-neon-red transition-all shrink-0">
                <div className="flex justify-between items-start">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <ShieldAlert size={16} className={disputes.length > 0 ? "text-red-500 animate-pulse" : "text-slate-600"} /> 
                        Active Challenges
                    </h3>
                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${disputes.length > 0 ? 'bg-red-500 text-black' : 'bg-slate-800 text-slate-500'}`}>
                        {disputes.length} PENDING
                    </div>
                </div>
                
                <div className="bg-black/40 rounded border border-white/5 p-2 min-h-[120px] max-h-[200px] overflow-y-auto custom-scrollbar">
                    {disputes.length === 0 ? (
                         <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2 py-8">
                             <CheckCircle size={24} className="opacity-20" />
                             <span className="text-[10px] font-mono">ALL SYSTEMS NOMINAL</span>
                         </div>
                    ) : (
                        <div className="space-y-2">
                            {disputes.map(d => (
                                <div key={d.proofId} className="p-3 bg-red-950/20 border border-red-900/50 rounded flex justify-between items-center group cursor-pointer" onClick={() => navigateToProof(d.proofId)}>
                                    <div className="overflow-hidden">
                                        <div className="text-red-400 font-bold text-xs truncate">Proof {d.proofId.substring(0,8)}...</div>
                                        <div className="text-[10px] text-slate-500 truncate">{d.agentName}</div>
                                    </div>
                                    <ArrowUpRight size={14} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* TOP AGENTS WIDGET */}
            <div className="hud-panel p-6 flex flex-col flex-1 min-h-0">
                 <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-4 shrink-0">
                    <BarChart3 size={16} className="text-neon-purple" /> Elite Nodes
                </h3>
                <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2">
                    {agents.map((agent, idx) => (
                        <div key={agent.id} className="flex items-center gap-3 p-3 bg-white/5 border border-transparent hover:border-neon-purple/30 rounded transition-colors cursor-pointer group" onClick={() => navigateToRunner(agent.id)}>
                            <div className="font-mono text-slate-600 text-xs w-6">0{idx+1}</div>
                            <img src={agent.image} className="w-8 h-8 rounded border border-slate-700" alt=""/>
                            <div className="flex-1 overflow-hidden">
                                <div className="text-xs font-bold text-white truncate group-hover:text-neon-purple transition-colors">{agent.name}</div>
                                <div className="text-[10px] text-neon-green font-mono">{agent.reputationScore}% TRUST</div>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono text-right">
                                <div>{agent.tokenBalance} AE</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>

      </div>
    </div>
    );
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#02040a] text-slate-200 flex overflow-hidden font-sans selection:bg-neon-blue selection:text-black perspective-1000">
      
      {/* 3. DYNAMIC BACKGROUND LAYER */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Moving 3D Grid Floor */}
          <div className="absolute inset-0 opacity-20 transform-gpu"
               style={{
                 backgroundImage: `
                   linear-gradient(transparent 95%, #00f3ff 95%),
                   linear-gradient(90deg, transparent 95%, #00f3ff 95%)
                 `,
                 backgroundSize: '80px 80px',
                 animation: 'gridMove 20s linear infinite',
                 transformOrigin: 'top center',
               }}
          />
          {/* Top Fade */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#02040a] to-transparent"></div>
          
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-neon-purple/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-neon-blue/5 rounded-full blur-[100px]"></div>
          
          {/* Scanline Overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="w-full h-screen absolute top-0 left-0 pointer-events-none z-50 animate-scanline opacity-5 bg-gradient-to-b from-transparent via-neon-blue to-transparent h-[10px]"></div>
      </div>

      {/* TOAST NOTIFICATIONS */}
      <div className="fixed top-20 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
         {toasts.map(toast => (
            <div key={toast.id} className="pointer-events-auto hud-panel p-4 pr-6 border-l-4 border-l-neon-blue flex items-center gap-4 animate-in slide-in-from-right-10 fade-in duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
               {toast.type === 'success' && <Check size={20} className="text-neon-green drop-shadow-[0_0_8px_rgba(10,255,0,0.8)]" />}
               {toast.type === 'error' && <AlertTriangle size={20} className="text-neon-red drop-shadow-[0_0_8px_rgba(255,42,42,0.8)]" />}
               {toast.type === 'info' && <Info size={20} className="text-neon-blue drop-shadow-[0_0_8px_rgba(0,243,255,0.8)]" />}
               <span className="font-mono text-sm font-bold tracking-wide">{toast.message}</span>
            </div>
         ))}
      </div>

      {/* 4. SIDEBAR NAVIGATION */}
      <nav className={`
        fixed md:relative z-50 w-20 md:w-72 h-full bg-[#050810]/80 backdrop-blur-xl border-r border-white/5 flex flex-col shrink-0 transition-all duration-300 ease-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Brand */}
        <div className="h-20 flex items-center justify-center md:justify-start md:px-8 border-b border-white/5 relative overflow-hidden group cursor-pointer shrink-0" onClick={() => setCurrentView(View.DASHBOARD)}>
           <div className="absolute inset-0 bg-neon-blue/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
           <Hexagon size={32} className="text-neon-blue animate-spin-slow shrink-0" />
           <div className="hidden md:block ml-4">
              <h1 className="text-2xl font-bold text-white tracking-widest leading-none">AETHER</h1>
              <span className="text-[10px] text-neon-blue font-mono tracking-[0.4em]">PROTOCOL</span>
           </div>
        </div>
        
        {/* Menu Items */}
        <div className="flex-1 py-8 space-y-2 overflow-y-auto px-2 md:px-4">
          <NavButton 
            active={currentView === View.DASHBOARD} 
            onClick={() => setCurrentView(View.DASHBOARD)} 
            icon={<LayoutDashboard size={20}/>} 
            label="COMMAND CENTER" 
          />
          <NavButton 
            active={currentView === View.RUNNER} 
            onClick={() => setCurrentView(View.RUNNER)} 
            icon={<Cpu size={20}/>} 
            label="NEURAL AGENTS" 
          />
          <NavButton
            active={currentView === View.WORKFLOWS}
            onClick={() => setCurrentView(View.WORKFLOWS)}
            icon={<GitMerge size={20}/>}
            label="WORKFLOW STUDIO"
          />
          <NavButton 
            active={currentView === View.PROOFS} 
            onClick={() => setCurrentView(View.PROOFS)} 
            icon={<FileCheck size={20}/>} 
            label="PROOF LEDGER" 
          />
          <NavButton 
            active={currentView === View.MARKET} 
            onClick={() => setCurrentView(View.MARKET)} 
            icon={<Network size={20}/>} 
            label="SERVICE MARKET" 
          />
        </div>

        {/* User Status */}
        <div className="p-4 border-t border-white/5 hidden md:block shrink-0">
           <div className="hud-panel p-3 flex items-center gap-3 cyber-cut-br">
              <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center border border-white/10 relative">
                 <div className="absolute top-0 right-0 w-2 h-2 bg-neon-green rounded-full shadow-[0_0_5px_#0aff00]"></div>
                 <img src="https://picsum.photos/100/100" className="w-full h-full object-cover opacity-80" alt="User"/>
              </div>
              <div className="overflow-hidden">
                 <div className="text-xs font-bold text-white truncate">OPERATOR_01</div>
                 <div className="text-[10px] text-slate-500 font-mono">ID: 0x82...9A</div>
              </div>
           </div>
        </div>
      </nav>

      {/* 5. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative z-10">
        
        {/* Header Bar */}
        <header className="h-20 border-b border-white/5 bg-[#02040a]/50 backdrop-blur-sm flex items-center justify-between px-6 md:px-8 shrink-0">
           <div className="md:hidden text-white font-bold flex items-center gap-2">
              <Menu onClick={() => setIsMobileMenuOpen(true)} /> AETHER
           </div>
           
           <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-neon-blue border border-neon-blue/20 px-3 py-1 rounded bg-neon-blue/5">
              <Globe size={12}/> NETWORK_STATUS: <span className="text-white font-bold">OPTIMAL</span>
           </div>

           <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col items-end">
                 <span className="text-xs font-bold text-white font-mono">{time.toLocaleTimeString()}</span>
                 <span className="text-[10px] text-slate-500 font-mono tracking-widest">{time.toDateString()}</span>
              </div>
              
              {/* User Balance Chip in Header */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-neon-purple/10 border border-neon-purple/30 rounded text-xs font-bold font-mono text-neon-purple">
                  <Wallet size={14} /> {userBalance} AE
              </div>
           </div>
        </header>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar relative p-0">
           {currentView === View.RUNNER && <AgentRunner agents={agents} onUpdateAgent={handleUpdateAgent} onProofCreated={handleProofCreated} initialAgentId={selectedAgentId} proofs={proofs} />}
           {currentView === View.WORKFLOWS && <WorkflowBuilder agents={agents} onProofCreated={handleProofCreated} />}
           {currentView === View.PROOFS && <ProofViewer proofs={proofs} onDispute={handleDispute} initialProofId={selectedProofId} />}
           {currentView === View.MARKET && <Marketplace agents={agents} onSelectAgent={navigateToRunner} userBalance={userBalance} onPurchase={handlePurchaseService} transactions={transactions} />}
           {currentView === View.DASHBOARD && <Dashboard />}
        </main>
      </div>
    </div>
  );
};

// Nav Button Component
const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-4 px-4 py-4 relative group transition-all duration-300
      ${active ? 'text-white' : 'text-slate-500 hover:text-white'}
    `}
  >
    {/* Active Glow Bar */}
    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-neon-blue shadow-[0_0_15px_#00f3ff] transition-all duration-300 ${active ? 'opacity-100' : 'opacity-0'}`}></div>
    
    {/* Background Highlight */}
    <div className={`absolute inset-0 bg-gradient-to-r from-neon-blue/10 to-transparent transition-all duration-300 ${active ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'}`}></div>

    <div className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-neon-blue drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]' : ''}`}>
      {icon}
    </div>
    <span className={`relative z-10 hidden md:block font-bold text-xs tracking-[0.15em] font-mono ${active ? 'text-white' : ''}`}>
       {label}
    </span>
  </button>
);

export default App;
