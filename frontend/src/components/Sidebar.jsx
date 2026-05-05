import { rolePermissions } from "../config/rolePermissions.js";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Upload, ChevronDown, X, Home, ShoppingBag, PlusCircle, FileText, Calculator, BarChart2, DollarSign, Settings, User, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/NazaraWhite.png";
import { useState, useEffect } from "react";

export default function Sidebar({ isOpen, onClose }) {
  const [openMenu, setOpenMenu] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems = [
    {
      name: "Home",
      icon: Home,
      permission: "products",
    },
    {
      name: "admin",
      icon: ShoppingBag,
      permission: "rates",
      children: [
        { name: "Dashboard", path: "/dashboard", icon: DollarSign, permission: "dashboard", },
        { name: "Admin Rates", path: "/rates", icon: Settings, permission: "rates" },
        { name: "Manual Billing", path: "/manual-billing", icon: FileText, permission: "manual-billing" },
        { name: "Create User", path: "/admin/users/new", icon: PlusCircle, permission: "create-user" },
        { name: "User Management", path: "/admin/users", icon: User, permission: "user-management" },
      ]
    },

    {
      name: "Order Management",
      icon: ShoppingBag,
      permission: "orders",
      children: [
        { name: "Create Order", path: "/orders/new" },
        { name: "All Orders", path: "/orders" },
        { name: "Estimates", path: "/quotations", icon: FileText, permission: "quotation" },
      ],
    },
    {
      name: "Inventory",
      icon: Home,
      permission: "products",
      children: [
        { name: "Inventory Summary", path: "/inventory-management" },
        { name: "Add Product", path: "/add" },
        { name: "Bulk Upload", path: "/products/bulk-upload" },
      ],
    },

    {
      name: "reports",
      icon: BarChart2,
      permission: "reports",
      children: [
        { name: "Sales Invoices", path: "/sales-invoices" },
        { name: "Daily Closing", path: "/reports/sales-closing" },
      ],
    },
    {
      name: "Accounting",
      icon: DollarSign,
      permission: "expenses",
      children: [
        { name: "Metal Ledger", path: "/metal-ledger", icon: FileText, permission: "metal-ledger" },
        { name: "Returns", path: "/returns", icon: FileText, permission: "returns" },
        { name: "Credit Notes", path: "/credit-notes", icon: FileText, permission: "credit-notes" },
        { name: "Gst-reports", path: "/gst-dashboard", icon: BarChart2, permission: "gst-reports" },
        { name: "Calculator", path: "/calculator", icon: Calculator, permission: "products" },
        { name: "Expenses", path: "/expenses", icon: FileText, permission: "expenses" },
        { name: "Purchase Entry", path: "/purchases/new", icon: PlusCircle, permission: "suppliers" },
        { name: "Suppliers", path: "/suppliers", icon: User, permission: "suppliers" },
      ]
    },
    {
      name: "Enquiry",
      icon: FileText,
      permission: "inquiries",
      children: [
        { name: "Enquiries", path: "/inquiries", icon: FileText, permission: "inquiries" },
      ]
    }
  ];

  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.children) {
        const isActive = item.children.some((child) =>
          location.pathname.startsWith(child.path)
        );
        if (isActive) {
          setOpenMenu(item.name);
        }
      }
    });
  }, [location.pathname]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-all duration-500 ease-in-out ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 left-0 h-full w-72 bg-[#5A374F] text-white z-[70] shadow-2xl flex flex-col transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-6 shrink-0 relative">
          <div className="flex flex-col">
            <img src={logo} alt="Nazara" className="h-10 w-auto object-contain" />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"
          >
            <X size={22} className="text-white/70" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1 custom-scrollbar">
          {menuItems
            .filter((item) =>
              rolePermissions[user?.role]?.includes(item.permission)
            )
            .map((item, index) => {
              const isParentActive =
                item.children?.some((child) =>
                  location.pathname.startsWith(child.path)
                );

              const isOpenMenu = openMenu === item.name;

              return (
                <div key={item.name}>
                  <button
                    onClick={() =>
                      item.children
                        ? setOpenMenu(isOpenMenu ? null : item.name)
                        : onClose()
                    }
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isParentActive
                      ? "bg-white text-[#5A374F] font-semibold"
                      : "text-white/70 hover:bg-white/5"
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      {item.icon && <item.icon size={18} />}
                      <span className="text-[13px] uppercase">{item.name}</span>
                    </div>

                    {item.children && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${isOpenMenu ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>

                  {item.children && (
                    <div
                      className={`overflow-hidden transition-all duration-300 ${isOpenMenu ? "max-h-96 mt-1" : "max-h-0"}`}
                    >
                      <div className="ml-8 flex flex-col gap-1">
                        {item.children.map((child) => {
                          const isActive = location.pathname === child.path;

                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              onClick={onClose}
                              className={`px-3 py-2 rounded-lg text-sm transition-all ${isActive
                                ? "bg-white text-[#5A374F] font-semibold"
                                : "text-white/60 hover:text-white hover:bg-white/5"
                                }`}
                            >
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        <div className="p-4 bg-black/10 backdrop-blur-md shrink-0 border-t border-white/5">
          {user && (
            <Link
              to="/profile"
              onClick={onClose}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all mb-3 group"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 p-[2px]">
                <div className="h-full w-full rounded-full bg-[#5A374F] flex items-center justify-center border border-white/10">
                  {user.name ? <span className="text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span> : <User size={18} />}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-white/90 group-hover:text-pink-300">
                  {user.name || "User Account"}
                </p>
                <p className="text-[10px] text-white/40 truncate uppercase tracking-tighter">
                  {user.email}
                </p>
              </div>
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-300 py-3 rounded-xl transition-all duration-300 border border-white/5 active:scale-[0.98]"
          >
            <LogOut size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Logout System</span>
          </button>

          <div className="text-center text-[9px] text-white/20 mt-4 font-light tracking-[0.2em] uppercase">
            powered by sagurit
          </div>
        </div>
      </div>
    </>
  );
}
