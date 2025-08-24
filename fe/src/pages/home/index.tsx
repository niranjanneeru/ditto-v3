import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Megaphone, Users, TrendingUp, Handshake, Phone, Mail, MessageCircle, Plus, Upload, Bot, BarChart3, Mic } from "lucide-react";

import { APP_ROUTES, LOCAL_STORAGE_KEYS } from "@constants";
import { backRound, Close } from "@assets";
import { Header, SimulationLoader } from "@components";
import {
  homePageContainerVariants,
  homePageItemVariants,
} from "@constants";
import { createRoom } from "@api";

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const handleStartSession = async () => {
    
    setIsCreatingRoom(true);
    try {
      // Create room with generated session ID
      const response = await createRoom();

      console.log({response});

    if (response?.data) {
      console.log("what happened??", response.data)
      localStorage.setItem(LOCAL_STORAGE_KEYS.ROOM_DATA, JSON.stringify(response.data));
      navigate(`${APP_ROUTES.VOICE_ASSISTANT}/${response?.data?.room_id}`);
    } else {
      const errorMessage = response?.error?.message || "Failed to create room. Please try again.";
      toast.error(errorMessage);
    }
    } catch (error) {
      toast.error("Failed to create room. Please try again.");
    } finally {
    setIsCreatingRoom(false);
    }
  };

  const renderDescription = () => {
    return (
      <motion.div
        variants={homePageItemVariants}
        initial="hidden"
        animate={selectedId ? "exit" : "visible"}
        className={`flex px-[10px] sm:px-[0px] flex-row items-center justify-center w-full text-[#1A1A1A] sm:text-[32px] text-[24px] font-[700] sm:mb-[66px] mb-[30px] sm:leading-[40px] leading-[28px] ${selectedId && "h-[0px]"}`}
      >
        <div className="text-center relative">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-gray-800 to-black rounded-full"
          />
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-5xl font-semibold mb-6 text-gray-900"
          >
            AI-Powered Sales Outreach
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-xl text-gray-600 max-w-3xl leading-relaxed"
          >
            Scale your cold outreach with intelligent voice agents and automated messaging workflows
          </motion.p>
        </div>
      </motion.div>
    );
  };

  const renderCreateRoomButton = () => {
    return (
      <motion.div
        variants={homePageItemVariants}
        initial="hidden"
        animate="visible"
        className="w-full flex justify-center mb-12"
      >
        <motion.button
          onClick={() => handleStartSession()}
          disabled={isCreatingRoom}
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="relative px-10 py-5 bg-black text-white text-lg font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl flex items-center gap-4 overflow-hidden group"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <motion.span 
            className="text-2xl relative z-10 text-white"
            animate={isCreatingRoom ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 2, repeat: isCreatingRoom ? Infinity : 0, ease: "linear" }}
          >
            <Mic size={24} />
          </motion.span>
          <span className="relative z-10">
            {isCreatingRoom ? "Starting Voice Assistant..." : "Start Voice Assistant"}
          </span>
          {!isCreatingRoom && (
            <motion.div
              className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20"
              initial={false}
              animate={{ opacity: [0, 0.2, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </motion.button>
      </motion.div>
    );
  };

  const renderKPIs = () => {
    const kpis = [
      { label: "Active Campaigns", value: "12", icon: Megaphone, color: "from-gray-700 to-gray-800" },
      { label: "Leads Generated", value: "1,247", icon: Users, color: "from-gray-600 to-gray-700" },
      { label: "Response Rate", value: "23.4%", icon: TrendingUp, color: "from-gray-800 to-black" },
      { label: "Deals Closed", value: "89", icon: Handshake, color: "from-gray-500 to-gray-600" }
    ];

    return (
      <motion.div
        variants={homePageItemVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 w-full"
      >
        {kpis.map((kpi, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.0 + index * 0.1 }}
            whileHover={{ 
              y: -8, 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
            }}
            className="bg-white p-6 rounded-2xl border border-gray-100 relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            
            {/* Content Layout: Left side content, Right side icon */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex flex-col">
                <div className="text-sm text-gray-600 font-medium mb-1">{kpi.label}</div>
                <motion.div 
                  className="text-3xl font-bold text-gray-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1.2 + index * 0.1 }}
                >
                  {kpi.value}
                </motion.div>
              </div>
              
              <motion.div 
                className="text-gray-500 flex-shrink-0"
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <kpi.icon size={28} />
              </motion.div>
            </div>
            
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${kpi.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  const renderRecentCampaigns = () => {
    const campaigns = [
      { name: "Enterprise SaaS Outreach", type: "Voice + Email", contacts: "342", response: "18.2%", status: "Active", icon: "📞", color: "blue" },
      { name: "Q1 Lead Generation", type: "Multi-channel", contacts: "156", response: "24.7%", status: "Completed", icon: "✉️", color: "green" },
      { name: "SMB Follow-up Campaign", type: "SMS + Voice", contacts: "89", response: "31.5%", status: "Active", icon: "💬", color: "purple" }
    ];

    return (
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.6 }}
        className="bg-white p-8 rounded-2xl border border-gray-100 w-full shadow-lg hover:shadow-2xl transition-all duration-300"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Recent Campaigns</h3>
          <motion.a 
            href="#" 
            whileHover={{ scale: 1.05 }}
            className="text-gray-700 text-sm hover:text-black font-medium transition-colors duration-200"
          >
            View All →
          </motion.a>
        </div>
        <div className="space-y-4">
          {campaigns.map((campaign, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.8 + index * 0.1 }}
              whileHover={{ 
                x: 4,
                boxShadow: "0 8px 25px rgba(0,0,0,0.1)"
              }}
              className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:from-white hover:to-gray-50 transition-all duration-300 cursor-pointer border border-gray-100"
            >
              <motion.div 
                className="text-2xl text-gray-600"
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                {index === 0 ? <Phone size={24} /> : index === 1 ? <Mail size={24} /> : <MessageCircle size={24} />}
              </motion.div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-gray-800 mb-1">{campaign.name}</div>
                <div className="text-xs text-gray-500">{campaign.type} • {campaign.contacts} contacts</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-700 mb-1">{campaign.response} response</div>
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 2.0 + index * 0.1 }}
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    campaign.status === 'Active' 
                      ? 'bg-gray-800 text-white border border-gray-700' 
                      : 'bg-gray-200 text-gray-700 border border-gray-300'
                  }`}
                >
                  {campaign.status}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderQuickActions = () => {
    const actions = [
      { name: "New Campaign", icon: Plus, color: "from-gray-700 to-gray-800" },
      { name: "Import Leads", icon: Upload, color: "from-gray-600 to-gray-700" },
      { name: "AI Lead Finder", icon: Bot, color: "from-gray-800 to-black" },
      { name: "View Analytics", icon: BarChart3, color: "from-gray-500 to-gray-600" }
    ];

    return (
      <motion.div 
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.6 }}
        className="bg-white p-8 rounded-2xl border border-gray-100 w-full shadow-lg hover:shadow-2xl transition-all duration-300"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
        <div className="space-y-3">
          {actions.map((action, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.8 + index * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                x: 8,
                boxShadow: "0 8px 25px rgba(0,0,0,0.1)"
              }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-300 text-left group relative overflow-hidden border border-gray-100"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              <motion.span 
                className="text-xl relative z-10 text-gray-600"
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <action.icon size={20} />
              </motion.span>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-800 relative z-10 transition-colors duration-200">
                {action.name}
              </span>
              <motion.div
                className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 relative z-10"
                initial={{ x: -10 }}
                whileHover={{ x: 0 }}
              >
                <span className="text-gray-400 text-sm">→</span>
              </motion.div>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${action.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderPerformanceOverview = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2.2 }}
        className="bg-white p-8 rounded-2xl border border-gray-100 w-full shadow-lg hover:shadow-2xl transition-all duration-300 mt-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Performance Overview</h3>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 2.4 }}
            className="flex space-x-2"
          >
            <div className="w-3 h-3 bg-gray-800 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </motion.div>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 2.6 }}
          className="h-80 bg-gradient-to-br from-gray-50 to-white rounded-2xl relative overflow-hidden border border-gray-100 p-6"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-green-500/5"></div>
          
          {/* Animated Line Chart */}
          <div className="relative z-10 h-full flex flex-col">
            {/* Chart Header */}
            <div className="flex items-center justify-between mb-4">
                             <div className="flex items-center space-x-4">
                 <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                   <span className="text-sm text-gray-600">Leads Generated</span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                   <span className="text-sm text-gray-600">Response Rate</span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                   <span className="text-sm text-gray-600">Deals Closed</span>
                 </div>
               </div>
              <div className="text-sm text-gray-500">Last 30 days</div>
            </div>
            
            {/* Chart Container */}
            <div className="flex-1 relative">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>
              
              {/* Chart Lines */}
              <div className="ml-8 h-full relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="border-b border-gray-200/50"></div>
                  ))}
                </div>
                
                {/* Animated Line Chart */}
                <svg className="w-full h-full" viewBox="0 0 300 200" preserveAspectRatio="none">
                                     {/* Leads Generated Line (Dark Gray) */}
                   <motion.path
                     d="M0,180 Q50,160 100,140 T200,120 T300,100"
                     stroke="url(#darkGrayGradient)"
                     strokeWidth="3"
                     fill="none"
                     initial={{ pathLength: 0 }}
                     animate={{ pathLength: 1 }}
                     transition={{ duration: 2, delay: 3.0, ease: "easeInOut" }}
                   />
                   
                   {/* Response Rate Line (Medium Gray) */}
                   <motion.path
                     d="M0,160 Q50,150 100,130 T200,110 T300,90"
                     stroke="url(#mediumGrayGradient)"
                     strokeWidth="3"
                     fill="none"
                     initial={{ pathLength: 0 }}
                     animate={{ pathLength: 1 }}
                     transition={{ duration: 2, delay: 3.5, ease: "easeInOut" }}
                   />
                   
                   {/* Deals Closed Line (Light Gray) */}
                   <motion.path
                     d="M0,140 Q50,130 100,120 T200,100 T300,80"
                     stroke="url(#lightGrayGradient)"
                     strokeWidth="3"
                     fill="none"
                     initial={{ pathLength: 0 }}
                     animate={{ pathLength: 1 }}
                     transition={{ duration: 2, delay: 4.0, ease: "easeInOut" }}
                   />
                  
                                     {/* Gradient Definitions */}
                   <defs>
                     <linearGradient id="darkGrayGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                       <stop offset="0%" stopColor="#374151" stopOpacity="0.8" />
                       <stop offset="100%" stopColor="#1F2937" stopOpacity="0.6" />
                     </linearGradient>
                     <linearGradient id="mediumGrayGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                       <stop offset="0%" stopColor="#6B7280" stopOpacity="0.8" />
                       <stop offset="100%" stopColor="#4B5563" stopOpacity="0.6" />
                     </linearGradient>
                     <linearGradient id="lightGrayGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                       <stop offset="0%" stopColor="#9CA3AF" stopOpacity="0.8" />
                       <stop offset="100%" stopColor="#6B7280" stopOpacity="0.6" />
                     </linearGradient>
                   </defs>
                </svg>
                
                {/* Animated Data Points */}
                <motion.div
                  className="absolute top-0 left-0 w-full h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 5.0 }}
                >
                                     {/* Dark gray dots */}
                   {[0, 50, 100, 150, 200, 250, 300].map((x, i) => (
                     <motion.div
                       key={`dark-${i}`}
                       className="absolute w-3 h-3 bg-gray-800 rounded-full border-2 border-white shadow-lg"
                       style={{ left: `${(x / 300) * 100}%`, top: `${(180 - (i * 15)) / 200 * 100}%` }}
                       initial={{ scale: 0, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       transition={{ duration: 0.5, delay: 5.2 + i * 0.1 }}
                     />
                   ))}
                   
                   {/* Medium gray dots */}
                   {[0, 50, 100, 150, 200, 250, 300].map((x, i) => (
                     <motion.div
                       key={`medium-${i}`}
                       className="absolute w-3 h-3 bg-gray-600 rounded-full border-2 border-white shadow-lg"
                       style={{ left: `${(x / 300) * 100}%`, top: `${(160 - (i * 12)) / 200 * 100}%` }}
                       initial={{ scale: 0, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       transition={{ duration: 0.5, delay: 5.4 + i * 0.1 }}
                     />
                   ))}
                   
                   {/* Light gray dots */}
                   {[0, 50, 100, 150, 200, 250, 300].map((x, i) => (
                     <motion.div
                       key={`light-${i}`}
                       className="absolute w-3 h-3 bg-gray-400 rounded-full border-2 border-white shadow-lg"
                       style={{ left: `${(x / 300) * 100}%`, top: `${(140 - (i * 10)) / 200 * 100}%` }}
                       initial={{ scale: 0, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       transition={{ duration: 0.5, delay: 5.6 + i * 0.1 }}
                     />
                   ))}
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Animated background elements */}
          <motion.div
            className="absolute top-4 left-4 w-2 h-2 bg-gray-400 rounded-full"
            animate={{ 
              y: [0, -10, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-8 right-8 w-3 h-3 bg-gray-600 rounded-full"
            animate={{ 
              y: [0, -15, 0],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div
            className="absolute bottom-6 left-8 w-2 h-2 bg-gray-500 rounded-full"
            animate={{ 
              y: [0, -8, 0],
              opacity: [0.4, 0.9, 0.4]
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
        </motion.div>
      </motion.div>
    );
  };

  const renderFooter = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 3.2 }}
        className="w-full text-center py-8 text-gray-500 text-sm relative"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100px" }}
          transition={{ duration: 1, delay: 3.4 }}
          className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto mb-4"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 3.6 }}
          className="font-medium"
        >
          © 2025 SalesAI. All rights reserved.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 3.8 }}
          className="mt-2 text-xs text-gray-400"
        >
          Powered by AI • Built with ❤️
        </motion.div>
      </motion.div>
    );
  };

  const renderBackButton = () => {
    return (
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        onClick={() => setSelectedId(null)}
        className="absolute top-[5px] sm:top-[90px] left-[calc(100%-30px)] sm:left-[0px] hover:scale-105 transition-transform"
        aria-label="Close scenario details"
      >
        <img src={backRound} alt="back" className="w-[40px] h-[40px] sm:block hidden" />
        <img src={Close} alt="back" className="w-[26px] h-[40px] sm:hidden block" />
      </motion.button>
    );
  };

  const renderScenarioGrid = () => (
    <motion.div
      variants={homePageContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`relative ${selectedId ? "hidden" : ""} w-full`}
    >
      {renderCreateRoomButton()}
      {renderKPIs()}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {renderRecentCampaigns()}
        {renderQuickActions()}
        </div>
      {renderPerformanceOverview()}
      {renderFooter()}
    </motion.div>
  );

  const renderLoading = () => {
    return (
      <div className="flex justify-center items-center absolute top-0 left-0 bg-white w-full h-full z-50">
        <div className="flex flex-col items-center justify-center">
          <SimulationLoader />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100/30 to-gray-200/30 flex flex-col font-replay relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-gray-400/10 to-gray-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-gray-500/10 to-gray-700/10 rounded-full blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-60 h-60 bg-gradient-to-r from-gray-300/5 to-gray-500/5 rounded-full blur-3xl"
          animate={{
            x: [-30, 30, -30],
            y: [-20, 20, -20],
            scale: [0.8, 1.3, 0.8],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10
          }}
        />
      </div>

      <Header />
      <div className="flex justify-center w-full h-full min-h-[80vh] relative z-10">
        <div className="flex flex-col h-full p-[10px] sm:p-[24px] justify-start items-center pt-8 w-[80%]">
          {renderDescription()}
          <AnimatePresence mode="wait">
          <motion.div
      variants={homePageContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`relative ${selectedId ? "hidden" : ""} w-full`}
    >
      {renderCreateRoomButton()}
      {renderKPIs()}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {renderRecentCampaigns()}
        {renderQuickActions()}
        </div>
      {renderPerformanceOverview()}
      {renderFooter()}
    </motion.div>
          </AnimatePresence>
        </div>
        {isCreatingRoom && renderLoading()}
      </div>
    </div>
  );
};
