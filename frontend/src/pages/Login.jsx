

import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, Sparkles, Gem, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/nazara_logo.png";

/* Floating Diamond */
function FloatingDiamond({ delay, duration, size, x, y }) {
  return (
    <div
      className="absolute opacity-20 animate-float"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      <Gem
        className="text-white rotate-45"
        style={{ width: size, height: size }}
      />
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  // NEW: State to control the Welcome Screen animation
  const [showWelcome, setShowWelcome] = useState(false);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   setLoading(true);
  //   try {
  //     await login(email, password);

  //     // Show the welcome animation instead of navigating immediately
  //     setShowWelcome(true);

  //     // Wait 3 seconds for the animation, then navigate
  //     setTimeout(() => {
  //       navigate("/");
  //     }, 3000);

  //   } catch (err) {
  //     setError(err?.response?.data?.message || "Login failed");
  //     setLoading(false); // Only set loading to false if there's an error
  //   } 
  // };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(email, password);
      const role = res.user.role;

      const roleRoutes = {
        admin: "/dashboard",
        salesperson: "/",
        manager: "/dashboard",
        superadmin: "/admin/users",

      };

      // ⏳ Wait for global animation (AuthContext)
      setTimeout(() => {
        navigate(roleRoutes[role] || "/");
      }, 3000);

    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex relative overflow-hidden bg-black">

      {/* --- NEW: Welcome Screen Overlay --- */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[radial-gradient(circle,#734b6d_0%,#422743_100%)] text-white font-['Jost',sans-serif] animate-fade-in">
          <div className="mb-5">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-20 h-auto">
              <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
            </svg>
          </div>

          <h1 className="font-light tracking-[8px] my-2 text-4xl">WELCOME</h1>

          <div className="flex items-center justify-center gap-3 text-base font-light mb-1">
            <div className="w-8 h-px bg-white/50"></div>
            <span>to</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
            </svg>
            <div className="w-8 h-px bg-white/50"></div>
          </div>

          <h2 className="font-medium tracking-[5px] my-1 text-3xl">NAZARA</h2>
          <div className="text-xs tracking-[4px] font-light text-[#d1b8d1] mb-10">
            DIAMONDS
          </div>

          {/* Animated Dots */}
          <div className="flex gap-2 justify-center mt-5">
            <div className="welcome-dot"></div>
            <div className="welcome-dot"></div>
            <div className="welcome-dot"></div>
          </div>
        </div>
      )}

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(90,55,79,0.3) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* LEFT BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#5A374F] via-[#8b5a7a] to-[#5A374F] animate-gradient-shift" />

        <FloatingDiamond delay={0} duration={8} size={40} x={10} y={15} />
        <FloatingDiamond delay={1} duration={10} size={30} x={80} y={25} />
        <FloatingDiamond delay={2} duration={7} size={50} x={20} y={70} />
        <FloatingDiamond delay={1.5} duration={9} size={35} x={75} y={60} />

        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="text-center space-y-10 max-w-lg">
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-3xl blur-xl" />
              <div className="relative bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20">
                <img src={logo} alt="Nazara" className="h-36 mx-auto" />
                <Sparkles className="absolute -top-3 -left-3 text-yellow-300 animate-pulse" />
              </div>
            </div>

            <div>
              <h1 className="text-5xl font-extralight tracking-widest">
                NAZARA
              </h1>
              <p className="text-xl tracking-[0.3em] text-white/90 mt-2">
                DIAMONDS
              </p>
              <p className="text-sm text-white/70 italic mt-2">
                Lab Grown Diamonds
              </p>
            </div>

            <p className="text-white/70 text-sm tracking-wide">
              Enterprise ERP designed for luxury
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT LOGIN */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white" />

        <div className="w-full max-w-md relative z-10">

          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <img src={logo} className="h-20 mx-auto mb-4" />
            <h2 className="text-3xl text-[#5A374F]">Nazara ERP</h2>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-10 space-y-8">

            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#5A374F] to-[#8b5a7a] rounded-2xl flex items-center justify-center">
                <Lock className="text-white w-8 h-8" />
              </div>
              <h2 className="text-3xl font-light">Welcome Back</h2>
              <p className="text-gray-500">Sign in to continue</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* EMAIL */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A374F]/60" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-14 w-full border-2 rounded-xl focus:border-[#5A374F] outline-none"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A374F]/60" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 h-14 w-full border-2 rounded-xl focus:border-[#5A374F] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* <div className="flex justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-[#5A374F]">
                  Forgot password?
                </Link>
              </div> */}

              <button
                type="submit"
                disabled={loading}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="w-full h-14 bg-gradient-to-r from-[#5A374F] to-[#8b5a7a] text-white rounded-xl shadow-xl flex items-center justify-center gap-2"
              >
                {loading ? "Signing in..." : "Sign In"}
                <ChevronRight
                  className={`transition-transform ${isHovered ? "translate-x-1" : ""
                    }`}
                />
              </button>
            </form>

            {/* Branding Footer */}
            <div className="pt-6 border-t border-gray-100 text-center">
              <p className="text-[10px] text-gray-400 tracking-widest">
                Powered by <span className="text-[#5A374F] font-bold">SagurIT Technologies</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes float {
          0%,100% { transform: translateY(0) rotate(45deg); }
          50% { transform: translateY(-20px) rotate(45deg); }
        }
        .animate-float { animation: float ease-in-out infinite; }
        
        @keyframes gradient-shift {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }

        /* NEW: Added animations for the welcome screen */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { 
          animation: fadeIn 0.5s ease-in-out forwards; 
        }

        @keyframes pulseDot {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .welcome-dot {
          width: 10px;
          height: 10px;
          background-color: white;
          border-radius: 50%;
          opacity: 0.3;
          animation: pulseDot 1.5s infinite ease-in-out;
        }
        .welcome-dot:nth-child(1) { animation-delay: 0s; }
        .welcome-dot:nth-child(2) { animation-delay: 0.3s; }
        .welcome-dot:nth-child(3) { animation-delay: 0.6s; }
      `}</style>
    </div>
  );
}