
import React from 'react';
import { Agent } from '../types';
import { Star, Zap, Search, Filter, Hexagon, Cpu, Database, ShieldCheck } from 'lucide-react';

interface MarketplaceProps {
  agents: Agent[];
  onSelectAgent: (agentId: string) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ agents, onSelectAgent }) => {
  const featuredAgent = agents.find(a => a.reputationScore > 98) || agents[0];
  const otherAgents = agents.filter(a => a.id !== featuredAgent.id);

  return (
    <div className="max-w-[1600px] mx-auto w-full p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 sticky top-0 z-30 py-6 bg-[#02040a]/90 backdrop-blur-xl border-b border-white/5 -mx-6 md:-mx-8 px-6 md:px-8 shadow-2xl">
         <div className="flex items-center gap-4 self-start md:self-center">
            <div className="p-2 bg-neon-blue/10 border border-neon-blue/30 rounded">
                <Hexagon className="text-neon-blue" size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white tracking-widest font-display uppercase">Node Registry</h2>
                <p className="text-[10px] text-neon-blue font-mono tracking-widest">AVAILABLE COMPUTE UNITS</p>
            </div>
         </div>
         <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-96 group">
               <Search className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-neon-blue transition-colors" size={18} />
               <input 
                 type="text" 
                 placeholder="SEARCH_PROTOCOL..." 
                 className="w-full bg-[#050910] border border-slate-800 rounded-none py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-neon-blue focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all font-mono text-white placeholder:text-slate-600 tech-border"
               />
            </div>
            <button className="px-4 bg-[#050910] border border-slate-800 hover:border-neon-blue hover:text-white text-slate-400 transition-all flex items-center justify-center">
               <Filter size={20} />
            </button>
         </div>
      </div>

      {/* Featured Agent (Holographic Card) */}
      <div className="mb-16 relative group cursor-pointer perspective-1000" onClick={() => onSelectAgent(featuredAgent.id)}>
         {/* Background Glow */}
         <div className="absolute -inset-1 bg-gradient-to-r from-neon-purple to-neon-blue rounded opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-1000"></div>
         
         <div className="relative bg-[#080c14] border border-white/10 p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center overflow-hidden tech-border">
             {/* Diagonal Scanline */}
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
             <div className="absolute top-0 right-0 w-[500px] h-full bg-gradient-to-l from-neon-purple/5 to-transparent skew-x-12 transform origin-bottom"></div>

             {/* Image Section */}
             <div className="relative shrink-0">
                <div className="absolute -inset-4 border border-dashed border-neon-purple/30 rounded-full animate-spin-slow"></div>
                <div className="absolute -inset-2 border border-neon-purple/50 rounded-full"></div>
                <img src={featuredAgent.image} alt={featuredAgent.name} className="relative w-40 h-40 md:w-48 md:h-48 rounded-full object-cover shadow-[0_0_30px_rgba(188,19,254,0.4)] grayscale group-hover:grayscale-0 transition-all duration-500" />
                <div className="absolute bottom-0 right-0 bg-black border border-neon-purple text-neon-purple px-3 py-1 text-[10px] font-bold font-mono uppercase tracking-widest z-20">
                   Elite Class
                </div>
             </div>
             
             {/* Text Content */}
             <div className="flex-1 z-10 text-center md:text-left space-y-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                   <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight font-display uppercase">{featuredAgent.name}</h1>
                   <div className="flex items-center gap-2 px-3 py-1 border border-yellow-500/30 bg-yellow-500/10 rounded">
                      <Star size={14} className="text-yellow-500 fill-current" />
                      <span className="text-yellow-500 font-mono font-bold">{featuredAgent.reputationScore} REPUTATION</span>
                   </div>
                </div>
                
                <p className="text-slate-400 max-w-2xl text-lg leading-relaxed font-light border-l-2 border-slate-800 pl-4">
                   {featuredAgent.description}
                </p>
                
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                   {featuredAgent.capabilities.map(cap => (
                      <span key={cap} className="px-4 py-2 bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono uppercase tracking-wide hover:border-neon-blue transition-colors cursor-default">
                         {cap}
                      </span>
                   ))}
                </div>
             </div>

             {/* Action Section */}
             <div className="flex flex-col gap-4 z-10 w-full md:w-auto min-w-[200px]">
                <div className="grid grid-cols-2 gap-px bg-slate-800 border border-slate-700">
                    <div className="bg-[#0b101b] p-3 text-center">
                        <div className="text-[9px] text-slate-500 uppercase tracking-widest">Tasks</div>
                        <div className="text-white font-mono font-bold">{featuredAgent.totalTasks.toLocaleString()}</div>
                    </div>
                    <div className="bg-[#0b101b] p-3 text-center">
                        <div className="text-[9px] text-slate-500 uppercase tracking-widest">Rate</div>
                        <div className="text-neon-purple font-mono font-bold">{featuredAgent.pricePerCall}</div>
                    </div>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); onSelectAgent(featuredAgent.id); }}
                    className="w-full py-4 bg-neon-purple/10 border border-neon-purple text-neon-purple font-bold tracking-[0.2em] hover:bg-neon-purple hover:text-white transition-all shadow-[0_0_15px_rgba(188,19,254,0.2)] hover:shadow-[0_0_25px_rgba(188,19,254,0.6)] uppercase text-sm"
                >
                   Initialize Node
                </button>
             </div>
         </div>
      </div>

      {/* Grid of Other Agents */}
      <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
          <h3 className="text-slate-400 text-sm font-bold uppercase tracking-[0.3em] font-mono">Standard Registry</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {otherAgents.map((agent) => (
          <div key={agent.id} className="group relative bg-[#080c14] border border-white/5 hover:border-neon-blue/50 transition-all duration-500 flex flex-col h-full overflow-hidden hover:-translate-y-2">
            
            {/* Hover Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-neon-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-[2px] bg-neon-blue transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

            {/* Header */}
            <div className="p-6 relative z-10 flex gap-4 items-start border-b border-white/5 bg-[#0a0f18]">
               <img src={agent.image} alt={agent.name} className="w-16 h-16 object-cover border border-slate-600 group-hover:border-neon-blue transition-colors grayscale group-hover:grayscale-0" />
               <div>
                   <h3 className="text-white font-bold text-xl group-hover:text-neon-blue transition-colors font-display uppercase tracking-wide">{agent.name}</h3>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 font-mono uppercase">{agent.category}</span>
                      <span className="text-[10px] text-neon-green font-mono">ID: {agent.id.split('-')[1]}</span>
                   </div>
               </div>
            </div>

            {/* Body */}
            <div className="p-6 flex-1 relative z-10 flex flex-col">
                <p className="text-slate-400 text-sm mb-6 leading-relaxed line-clamp-3">
                  {agent.description}
                </p>

                <div className="mt-auto space-y-4">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-px bg-slate-800 border border-slate-700">
                        <div className="bg-[#0b101b] p-2 text-center">
                            <Cpu size={12} className="mx-auto mb-1 text-slate-500"/>
                            <div className="text-white font-mono text-xs font-bold">{(agent.totalTasks/1000).toFixed(1)}k</div>
                        </div>
                        <div className="bg-[#0b101b] p-2 text-center">
                            <ShieldCheck size={12} className="mx-auto mb-1 text-slate-500"/>
                            <div className="text-neon-green font-mono text-xs font-bold">{agent.reputationScore}</div>
                        </div>
                        <div className="bg-[#0b101b] p-2 text-center">
                            <Database size={12} className="mx-auto mb-1 text-slate-500"/>
                            <div className="text-slate-300 font-mono text-xs font-bold">{agent.pricePerCall}</div>
                        </div>
                    </div>

                    <button 
                        onClick={() => onSelectAgent(agent.id)}
                        className="w-full py-3 bg-slate-900 hover:bg-neon-blue hover:text-black text-white border border-slate-700 hover:border-neon-blue transition-all font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 group/btn"
                    >
                        Hire Unit <Zap size={12} className="group-hover/btn:fill-current" />
                    </button>
                </div>
            </div>
            
            {/* Tech Decoration */}
            <div className="absolute bottom-2 right-2 text-[8px] text-slate-700 font-mono">SYS_READY</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
