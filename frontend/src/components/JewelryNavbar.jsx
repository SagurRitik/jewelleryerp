import React, { useState } from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';

const JewelryNavbar = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  const navItems = ['Overview', 'Ledgers', 'Payments', 'Operations', 'Insights', 'Connectors'];

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-b border-slate-700">
      <div className="px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2L2 7l8 5 8-5-8-5zM2 17l8 5 8-5M2 12l8 5 8-5"/>
                </svg>
              </div>
              <span className="text-white text-xl font-bold tracking-tight">Nazara</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === item
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            {/* <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50">
              <Search className="w-5 h-5" />
            </button> */}

            {/* Bell Icon */}
            {/* <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50">
              <Bell className="w-5 h-5" />
            </button> */}

            {/* User Avatar with Dropdown */}
            {/* <div className="flex items-center space-x-2 cursor-pointer group">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-xl transition-shadow">
                JD
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            </div> */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default JewelryNavbar;