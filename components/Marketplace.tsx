
import React, { useState } from 'react';
import { Agent, AgentService, Transaction } from '../types';
import { Star, Zap, Search, Filter, Hexagon, Cpu, Database, ShieldCheck, Wallet, ArrowRightLeft, ShoppingCart, Lock } from 'lucide-react';

interface MarketplaceProps {
  agents: Agent[];
  onSelectAgent: (agentId: string) => void;
  userBalance: number;
  onPurchase: (agentId: string, service: AgentService) => void;
  transactions: Transaction[];
}

const Marketplace: React.FC<MarketplaceProps> = ({ agents, onSelectAgent, userBalance, onPurchase, transactions }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedServiceToBuy, setSelectedServiceToBuy] = useState<{agent: Agent, service: AgentService} | null>(null);

  const featuredAgent = agents.find(a => a.reputationScore > 98) || agents[0];
  const otherAgents = agents.filter(a => a.id !== featuredAgent.id);

  const handleBuyClick = (agent: Agent, service: AgentService) => {
      setSelectedServiceToBuy({ agent, service });
      setIsPurchaseModalOpen(true);
  };

  const confirmPurchase = () => {
      if (selectedServiceToBuy) {
          onPurchase(selectedServiceToBuy.agent.id, selectedServiceToBuy.service);
          setIsPurchaseModalOpen(false);
          setSelectedServiceToBuy(null);
      }
  };

  return (
    <div className="max-w-[1600px] mx-auto w-full p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 sticky top-0 z-30 py-6 bg-[#02040a]/90 backdrop-blur-xl border-b border-white/5 -mx-6 md:-mx-8 px-6 md:px-8 shadow-2xl">
         <div className="flex items-center gap-4 self-start md:self-center">
            <div className="p-2 bg-neon-blue/10 border border-neon-blue/30 rounded">
                <Hexagon className="text-neon-blue" size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white tracking-widest font-display uppercase">Service Exchange</h2>
                <p className="text-[10px] text-neon-blue font-mono tracking-widest">DECENTRALIZED AI MARKETPLACE</p>
            </div>
         </div>
         
         {/* User Wallet Display */}
         <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
             <div className="flex items-center gap-3 bg-[#0a0f18] border border-slate-700 px-4 py-2 rounded-lg">
                 <div className="flex flex-col items-end">
                     <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Your Balance</span>
                     <span className="text-xl font-bold text-white font-mono flex items-center gap-2">
                        {userBalance.toLocaleString()} <span className="text-neon-purple text-sm">AE</span>
                     </span>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-neon-purple/10 flex items-center justify-center border border-neon-purple/30">
                     <Wallet size={18} className="text-neon-purple" />
                 </div>
             </div>
             <button className="px-4 py-3 bg-[#050910] border border-slate-800 hover:border-neon-blue hover:text-white text-slate-400 transition-all flex items-center justify-center rounded">
               <Filter size={20} />
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Main Marketplace Feed */}
          <div className="xl:col-span-8 space-y-8">
               {/* Featured Agent Banner */}
               <div className="relative group cursor-pointer perspective-1000" onClick={() => onSelectAgent(featuredAgent.id)}>
                    <div className="absolute -inset-1 bg-gradient-to-r from-neon-purple to-neon-blue rounded opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-1000"></div>
                    <div className="relative bg-[#080c14] border border-white/10 p-8 flex flex-col md:flex-row gap-8 items-center overflow-hidden tech-border">
                        <div className="relative shrink-0">
                            <img src={featuredAgent.image} alt={featuredAgent.name} className="relative w-32 h-32 rounded-full object-cover shadow-[0_0_30px_rgba(188,19,254,0.4)] grayscale group-hover:grayscale-0 transition-all duration-500" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-white font-display uppercase mb-2">{featuredAgent.name}</h1>
                            <p className="text-slate-400 text-sm mb-4 max-w-xl">{featuredAgent.description}</p>
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                {featuredAgent.services.slice(0, 2).map(srv => (
                                    <span key={srv.id} className="px-3 py-1 bg-neon-purple/10 border border-neon-purple/30 text-neon-purple text-xs font-mono font-bold uppercase">
                                        {srv.name} • {srv.price} AE
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
               </div>

               {/* Agent List */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {agents.map(agent => (
                       <div key={agent.id} className="bg-[#0a0f18] border border-white/5 hover:border-neon-blue/30 transition-all p-5 flex flex-col gap-4 group">
                           <div className="flex justify-between items-start">
                               <div className="flex items-center gap-3">
                                   <img src={agent.image} className="w-10 h-10 rounded border border-slate-700" alt=""/>
                                   <div>
                                       <div className="font-bold text-white text-sm uppercase">{agent.name}</div>
                                       <div className="text-[10px] text-slate-500 font-mono">{agent.walletAddress}</div>
                                   </div>
                               </div>
                               <div className="text-right">
                                   <div className="text-[10px] text-slate-500 uppercase">Trust Score</div>
                                   <div className="text-neon-green font-bold font-mono">{agent.reputationScore}%</div>
                               </div>
                           </div>
                           
                           <div className="h-px bg-slate-800"></div>
                           
                           <div className="space-y-2">
                               {agent.services.map(service => (
                                   <div key={service.id} className="flex justify-between items-center bg-black/20 p-2 border border-slate-800 rounded hover:border-slate-600 transition-colors">
                                       <div className="text-xs text-slate-300">
                                           <div className="font-bold">{service.name}</div>
                                           <div className="text-[10px] text-slate-500">{service.type}</div>
                                       </div>
                                       <button 
                                          onClick={() => handleBuyClick(agent, service)}
                                          className="px-3 py-1.5 bg-neon-blue/10 text-neon-blue border border-neon-blue/30 hover:bg-neon-blue hover:text-black text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1"
                                       >
                                           {service.price} AE <ShoppingCart size={10} />
                                       </button>
                                   </div>
                               ))}
                           </div>
                       </div>
                   ))}
               </div>
          </div>

          {/* Right Sidebar: Ledger & Stats */}
          <div className="xl:col-span-4 space-y-6">
              
              {/* Ledger */}
              <div className="hud-panel p-0 flex flex-col h-[500px]">
                  <div className="p-4 border-b border-white/5 bg-slate-900/50 flex items-center justify-between">
                      <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                          <ArrowRightLeft size={14} className="text-neon-purple"/> Token Ledger
                      </h3>
                      <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></div>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                      {transactions.length === 0 && (
                          <div className="text-center text-slate-600 text-xs py-10 font-mono">NO RECENT ACTIVITY</div>
                      )}
                      {transactions.slice().reverse().map(tx => (
                          <div key={tx.id} className="p-3 bg-[#050810] border border-white/5 rounded flex justify-between items-center group">
                              <div>
                                  <div className="flex items-center gap-2 mb-1">
                                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${tx.type === 'TRUST_REWARD' ? 'bg-neon-green/10 text-neon-green' : tx.type === 'PENALTY' ? 'bg-red-500/10 text-red-500' : 'bg-neon-purple/10 text-neon-purple'}`}>
                                          {tx.type === 'TRUST_REWARD' ? 'REWARD' : tx.type === 'PENALTY' ? 'SLASH' : 'PAYMENT'}
                                      </span>
                                      <span className="text-[10px] text-slate-500 font-mono">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono truncate w-32">
                                      {tx.type === 'SERVICE_PAYMENT' ? `Service: ${tx.serviceName}` : `Hash: ${tx.hash.substring(0,8)}...`}
                                  </div>
                              </div>
                              <div className={`font-mono font-bold text-sm ${tx.type === 'PENALTY' || (tx.type === 'SERVICE_PAYMENT' && tx.from === 'USER') ? 'text-red-400' : 'text-neon-green'}`}>
                                  {tx.type === 'PENALTY' || (tx.type === 'SERVICE_PAYMENT' && tx.from === 'USER') ? '-' : '+'}{tx.amount}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Rewards Info */}
              <div className="hud-panel p-6 border-l-2 border-l-neon-green">
                  <h3 className="text-white font-bold text-sm uppercase mb-2 flex items-center gap-2">
                      <ShieldCheck size={16} className="text-neon-green"/> Proof of Trust
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      The Aether protocol automatically mints AE tokens as rewards for agents who successfully verify tasks without disputes.
                  </p>
                  <div className="flex gap-2">
                      <div className="flex-1 bg-black/40 p-2 border border-slate-800 text-center">
                          <div className="text-[9px] text-slate-500 uppercase">Verification</div>
                          <div className="text-neon-green font-mono font-bold">+10 AE</div>
                      </div>
                      <div className="flex-1 bg-black/40 p-2 border border-slate-800 text-center">
                          <div className="text-[9px] text-slate-500 uppercase">Swarm Consensus</div>
                          <div className="text-neon-blue font-mono font-bold">+5 AE</div>
                      </div>
                  </div>
              </div>

          </div>
      </div>

      {/* Purchase Modal */}
      {isPurchaseModalOpen && selectedServiceToBuy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-[#0b101b] border border-neon-blue/30 w-full max-w-md p-6 relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                  <h3 className="text-xl font-bold text-white font-display uppercase mb-1">Confirm Transaction</h3>
                  <div className="text-xs text-slate-500 font-mono mb-6">SECURE GATEWAY // {new Date().toISOString()}</div>

                  <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center p-3 bg-black/40 border border-white/5">
                          <span className="text-slate-400 text-xs uppercase tracking-wider">Service</span>
                          <span className="text-white font-bold">{selectedServiceToBuy.service.name}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-black/40 border border-white/5">
                          <span className="text-slate-400 text-xs uppercase tracking-wider">Provider</span>
                          <span className="text-white font-bold">{selectedServiceToBuy.agent.name}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-neon-blue/5 border border-neon-blue/20">
                          <span className="text-neon-blue text-xs uppercase tracking-wider font-bold">Total Cost</span>
                          <span className="text-neon-blue font-bold font-mono text-lg">{selectedServiceToBuy.service.price} AE</span>
                      </div>
                  </div>

                  <div className="flex gap-4">
                      <button 
                          onClick={() => setIsPurchaseModalOpen(false)}
                          className="flex-1 py-3 border border-slate-700 text-slate-400 font-bold uppercase text-xs tracking-widest hover:text-white transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={confirmPurchase}
                          className="flex-1 py-3 bg-neon-blue text-black font-bold uppercase text-xs tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2"
                      >
                          <Lock size={12} /> Sign & Pay
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Marketplace;
