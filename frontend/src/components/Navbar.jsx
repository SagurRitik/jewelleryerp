

import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, User, ChevronDown, LogOut, Settings as SettingsIcon } from "lucide-react"; // ✅ Icons Import
import logoDark from "../assets/NazaraPurple.png";
import logoLight from "../assets/NazaraWhite.png";
import { useAuth } from "../context/AuthContext"; // ✅ Auth Context Import
import { useProductList } from "../context/ProductListContext"; // ✅ Import ProductListContext
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Navbar({ toggleSidebar, isOpen }) {
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false); // ✅ Dropdown State
  const location = useLocation();
  const { user, logout } = useAuth(); // ✅ Get User Data
  const { clearFilters } = useProductList(); // ✅ Get clearFilters action
  const navigate = useNavigate();

  // ... (navigation array same as before)
  const navigation = [
    { name: "Home", path: "/", type: "link" },
    { name: "Add Product", path: "/add", type: "link" },
    { name: "Orders", path: "/orders", type: "link" },
    { name: "Calc", path: "/calculator", type: "link" },
    // {
    // name: "POS System",
    // type: "dropdown",
    // children: [
    // { name: "New Bill", path: "/pos-invoices" },
    // { name: "Sales Invoices", path: "/sales-invoices" },
    // { name: "Daily Closing", path: "/reports/sales-closing" },
    // {name:"DashboardHome",path:"/Home"},
    // {name:"Dashboard",path:"/dashboard"}
    //   ]
    // },
    // {
    //   name: "Reports",
    //   type: "dropdown",
    //   children: [
    //     { name: "Sales Report", path: "/reports/sales" },
    //     { name: "Order Report", path: "/orders/closing-report" },
    //     { name: "POS Report", path: "/pos-closing-report" },
    //   ]
    // },
    // {
    //   name: "Utilities",
    //   type: "dropdown",
    //   children: [
    //     { name: "Calculator", path: "/calculator" },
    //     // { name: "Live Rates", path: "/rates" },
    //   ]
    // }
  ];

  /* ================= SCROLL EFFECT ================= */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (item) => {
    if (item.type === "link") return location.pathname === item.path;
    return item.children?.some(child => location.pathname === child.path);
  };

  return (
    <nav
      className={`
        sticky top-0 z-50 transition-all duration-300 w-full
        ${scrolled
          ? "bg-[#fdfbf7]/95 backdrop-blur-md border-b border-[#e7e2d8] shadow-sm"
          : "bg-[#5A374F]"
        }
      `}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* ================= LEFT: HAMBURGER + LOGO ================= */}
          <div className="flex items-center gap-4">
            {/* <button 
              onClick={toggleSidebar}
              className={`p-2 rounded-lg transition-colors ${
                scrolled ? "text-stone-600 hover:bg-stone-100" : "text-white/90 hover:bg-white/10"
              }`}
            >
              <Menu size={28} strokeWidth={2} />
            </button> */}

            {/* ================= PREMIUM ANIMATED HAMBURGER ================= */}
            <button
              onClick={toggleSidebar}
              className={`group relative h-11 w-11 flex items-center justify-center rounded-xl transition-all duration-500 active:scale-90 overflow-hidden ${scrolled
                ? "bg-stone-100 text-stone-700 hover:bg-[#5A374F] hover:text-white shadow-sm"
                : "bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20"
                }`}
            >
              {/* Inner Bars Container */}
              <div className="relative w-5 h-4 flex flex-col justify-between items-center z-10">
                {/* Top Bar */}
                <span
                  className={`h-[2px] bg-current rounded-full transition-all duration-500 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)] ${isOpen ? "w-6 rotate-45 translate-y-[7px]" : "w-5 group-hover:w-3 group-hover:ml-auto"
                    }`}
                />

                {/* Middle Bar */}
                <span
                  className={`h-[2px] bg-current rounded-full transition-all duration-300 ${isOpen ? "opacity-0 -translate-x-4" : "w-5 opacity-100"
                    }`}
                />

                {/* Bottom Bar */}
                <span
                  className={`h-[2px] bg-current rounded-full transition-all duration-500 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)] ${isOpen ? "w-6 -rotate-45 -translate-y-[7px]" : "w-5 group-hover:w-4 group-hover:mr-auto"
                    }`}
                />
              </div>

              {/* Subtle Hover Glow */}
              <span className="absolute inset-0 rounded-xl bg-current opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            </button>

            <Link
              to="/"
              onClick={clearFilters}
              className="flex-shrink-0 flex items-center gap-2"
            >
              <img
                src={scrolled ? logoDark : logoLight}
                alt="Nazara Jewellery"
                className={`
                  transition-all duration-300 select-none object-contain
                  ${scrolled ? "h-9 md:h-11" : "h-9 md:h-11"}
                `}
                draggable={false}
              />
            </Link>
          </div>

          {/* ================= CENTER: DESKTOP MENU ================= */}
          <div className={`hidden xl:flex items-center gap-1 px-2 py-1.5 rounded-full transition-all duration-300 ${scrolled ? "bg-white border border-gray-100 shadow-sm" : "bg-white/10 backdrop-blur-sm"}`}>
            {/* ... (Existing Navigation Map Logic) ... */}
            {navigation.map((item) => (
              <div key={item.name} className="relative group">
                {item.type === "link" ? (
                  <Link
                    to={item.path}
                    onClick={item.path === "/" ? clearFilters : undefined}
                    className={`
                      px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap block
                      ${isActive(item)
                        ? scrolled ? "bg-[#5A374F] text-white shadow-md" : "bg-white text-[#5A374F]"
                        : scrolled ? "text-gray-600 hover:text-[#5A374F] hover:bg-gray-50" : "text-white/90 hover:bg-white/10"
                      }
                    `}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <>
                    <button
                      className={`
                        px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1 group
                        ${isActive(item)
                          ? scrolled ? "text-[#5A374F] bg-gray-100" : "bg-white/20 text-white"
                          : scrolled ? "text-gray-600 hover:text-[#5A374F] hover:bg-gray-50" : "text-white/90 hover:bg-white/10"
                        }
                      `}
                    >
                      {item.name}
                      <ChevronDown size={14} />
                    </button>
                    {/* DROPDOWN MENU */}
                    <div className="absolute top-full right-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50 pt-2">
                      <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1">
                        {item.children.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.path}
                            className={`
                                block px-4 py-3 text-sm transition-colors hover:bg-gray-50
                                ${location.pathname === subItem.path ? "text-[#5A374F] font-semibold bg-gray-50" : "text-gray-600"}
                              `}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>


          {/* <div 
            className={`xl:hidden border-t px-3 py-2 overflow-x-auto transition-all duration-300 ${
    scrolled
      ? "bg-[#FCFAF7] border-[#e7e2d8] text-black"
      : "bg-[#5A374F] border-white/10"
  }`}
          //className="xl:hidden border-t border-white/10 bg-[#5A374F] px-3 py-2 overflow-x-auto"
          >
  <div className="flex gap-2">

    <Link
      to="/"
      className="px-4 py-2 rounded-full text-xs whitespace-nowrap bg-white text-[#5A374F] font-medium"
    >
      Home
    </Link>

    <Link
      to="/add"
      className="px-4 py-2 rounded-full text-xs whitespace-nowrap bg-white/10 text-white"
    >
      Add Product
    </Link>

    <Link
      to="/orders"
      className="px-4 py-2 rounded-full text-xs whitespace-nowrap bg-white/10 text-white"
    >
      Orders
    </Link>

    <Link
      to="/calculator"
      className="px-4 py-2 rounded-full text-xs whitespace-nowrap bg-white/10 text-white"
    >
      Calc
    </Link>

  </div>
</div> */}

          <div
            className={`xl:hidden border-t px-3 py-2 overflow-x-auto transition-all duration-300 ${scrolled
              ? "bg-[#FCFAF7] border-[#e7e2d8]"
              : "bg-[#5A374F] border-white/10"
              }`}
          >
            <div className="flex gap-2">
              {navigation.map((item) =>
                item.type === "link" ? (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={item.path === "/" ? clearFilters : undefined}
                    className={`
            px-4 py-2 rounded-full text-xs whitespace-nowrap font-medium transition-all
            ${isActive(item)
                        ? scrolled
                          ? "bg-[#5A374F] text-white"
                          : "bg-white text-[#5A374F]"
                        : scrolled
                          ? "bg-gray-200 text-gray-700"
                          : "bg-white/10 text-white"
                      }
          `}
                  >
                    {item.name}
                  </Link>
                ) : null
              )}
            </div>
          </div>

          {/* ================= RIGHT: PROFILE SECTION (NEW) ================= */}
          <div className="flex items-center gap-4 relative">
            {user && (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`flex items-center gap-2 p-1.5 rounded-full transition-all ${scrolled ? "hover:bg-gray-100" : "hover:bg-white/10"
                    }`}
                >
                  <div className="h-9 w-9 rounded-full bg-pink-600 flex items-center justify-center text-white font-bold border-2 border-white/20 shadow-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <ChevronDown size={16} className={scrolled ? "text-gray-600" : "text-white/70"} />
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-20 animate-in fade-in zoom-in duration-200">
                      <div className="px-4 py-3 border-b border-gray-50 mb-1">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Signed in as</p>
                        <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                      </div>

                      <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        <User size={18} /> My Profile
                      </Link>

                      <Link to="/rates" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        <SettingsIcon size={18} /> Settings
                      </Link>

                      <div className="border-t border-gray-50 mt-1 pt-1">
                        <button
                          onClick={() => { logout(); setProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                        >
                          <LogOut size={18} /> Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}