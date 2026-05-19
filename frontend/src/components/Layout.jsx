import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Menu, Search, Bell } from "lucide-react";

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col lg:flex-row">

      {/* The Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Mobile Header (Only visible on small screens) */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-stone-200 px-4 h-16 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2 text-stone-600 hover:bg-stone-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <span className="font-serif font-bold text-xl text-[#5A374F]">NAZARA</span>
          </div>
          <div className="w-8 h-8 bg-[#5A374F] text-white rounded-full flex items-center justify-center font-serif">
            N
          </div>
        </header>

        {/* Desktop Top Bar (Optional - Global Search/Notifications) */}
        <header className="hidden lg:flex sticky top-0 z-30 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-stone-200 px-8 h-20 items-center justify-between">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              type="text"
              placeholder="Search orders, clients, or items..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-full text-sm outline-none focus:border-[#5A374F] focus:ring-1 focus:ring-[#5A374F] transition-all"
            />
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-stone-500 hover:text-[#5A374F] transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-stone-200">
              <div className="text-right hidden xl:block">
                <p className="text-sm font-bold text-stone-800">Admin User</p>
                <p className="text-xs text-stone-500">Manager</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-[#5A374F] to-[#804b6b] text-white rounded-full flex items-center justify-center font-serif font-bold shadow-lg">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Rendered Here */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>

      </main>
    </div>
  );
}