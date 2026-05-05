



import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Global Animation States ---
  const [showWelcome, setShowWelcome] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  /* ================= CHECK USER ON APP LOAD ================= */
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const { data } = await api.get("/auth/profile");
        setUser(data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  /* ================= LOGIN ================= */
  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });

      if (data?.user) {
        setUser(data.user);

        // Trigger the global Welcome animation
        setShowWelcome(true);
        setTimeout(() => setShowWelcome(false), 3000); // Hide after 3 seconds
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  /* ================= LOGOUT ================= */
  const logout = async () => {
    // 1. Show the full-screen overlay FIRST
    setShowLogout(true);

    // 2. Wait 3 seconds for the animation to play, then actually logout
    setTimeout(async () => {
      try {
        await api.post("/auth/logout");
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        setUser(null);
        setShowLogout(false); // Hide overlay
      }
    }, 3000);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {/* ================= GLOBAL WELCOME OVERLAY ================= */}
      {showWelcome && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center text-white font-['Jost',sans-serif] animate-fade-in animated-bg">

          {/* 3D Rotating Top Diamond */}
          <div className="mb-8 diamond-3d-spin">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-20 h-auto">
              <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
            </svg>
          </div>

          <h1 className="font-light tracking-[8px] my-2 text-5xl">WELCOME</h1>

          <div className="flex items-center justify-center gap-4 text-base font-light mb-1 mt-2 opacity-80">
            <div className="w-12 h-px bg-white/50"></div>
            <span>to</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
            </svg>
            <div className="w-12 h-px bg-white/50"></div>
          </div>

          <h2 className="font-medium tracking-[6px] mt-4 mb-2 text-4xl">NAZARA</h2>
          <div className="text-sm tracking-[5px] font-light text-[#d1b8d1] mb-12">
            DIAMONDS
          </div>

          {/* Animated Dots */}
          <div className="flex gap-3 justify-center mt-4">
            <div className="welcome-dot"></div>
            <div className="welcome-dot"></div>
            <div className="welcome-dot"></div>
          </div>

          {/* Branding */}
          <div className="mt-12 text-center opacity-60">
            <p className="text-[10px] tracking-[4px] text-white/80">
              Powered by: <span className="font-bold">SagurIT Technologies</span>
            </p>
          </div>

          {/* Bottom 3 Animated Icons */}
          <div className="absolute bottom-12 flex items-center justify-center gap-8">
            <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-white fill-none stroke-[1.5] animate-sparkle-1">
              <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />
            </svg>
            <svg viewBox="0 0 24 24" className="w-7 h-7 stroke-white fill-none stroke-[1.5] animate-float-diamond opacity-70">
              <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
            </svg>
            <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-white fill-none stroke-[1.5] animate-sparkle-2">
              <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />
            </svg>
          </div>
        </div>
      )}

      {/* ================= GLOBAL LOGOUT OVERLAY ================= */}
      {showLogout && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center text-white font-['Jost',sans-serif] animate-fade-in animated-bg">
          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <svg viewBox="0 0 24 24" className="w-10 h-10 fill-white animate-pulse-slow">
              <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 012 2v2h-2V4H5v16h9v-2h2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2h9z" />
            </svg>
          </div>
          <h1 className="font-light text-5xl m-0 mb-4 tracking-wide">Logging Out</h1>
          <div className="font-light text-[#d1b8d1] text-lg mb-10 tracking-[2px]">Please wait...</div>

          <div className="flex gap-3 justify-center mt-2">
            <div className="welcome-dot"></div>
            <div className="welcome-dot"></div>
            <div className="welcome-dot"></div>
          </div>

          {/* Branding */}
          <div className="mt-12 text-center opacity-60">
            <p className="text-[10px] tracking-[4px] text-white/80">
              Powered by: <span className="font-bold">SagurIT Technologies</span>
            </p>
          </div>
        </div>
      )}

      {/* ================= SHARED ANIMATION STYLES ================= */}
      <style>{`
        /* Fade In Overlay */
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.4s ease-in-out forwards; }
        
        /* 1. Multicolor 3D Moving Background */
        .animated-bg {
          background: linear-gradient(-45deg, #422743, #734b6d, #3d203e, #5a374f);
          background-size: 400% 400%;
          animation: gradientShift 10s ease infinite;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* 2. Top Diamond 3D Rotation */
        .diamond-3d-spin {
          perspective: 800px;
        }
        .diamond-3d-spin svg {
          animation: spin3D 4s linear infinite;
        }
        @keyframes spin3D {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }

        /* 3. Loading Dots */
        @keyframes pulseDot {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        .welcome-dot {
          width: 12px; height: 12px; background-color: white; border-radius: 50%; opacity: 0.3;
          animation: pulseDot 1.5s infinite ease-in-out;
          box-shadow: 0 0 10px rgba(255,255,255,0.5);
        }
        .welcome-dot:nth-child(1) { animation-delay: 0s; }
        .welcome-dot:nth-child(2) { animation-delay: 0.3s; }
        .welcome-dot:nth-child(3) { animation-delay: 0.6s; }

        /* 4. Bottom 3 Icons Animations */
        @keyframes floatAndSpin {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(0.8); opacity: 0.4; }
          50% { transform: translateY(-15px) rotate(180deg) scale(1.1); opacity: 0.8; }
        }
        @keyframes floatAndSpinReverse {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(0.8); opacity: 0.4; }
          50% { transform: translateY(-15px) rotate(-180deg) scale(1.1); opacity: 0.8; }
        }
        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-sparkle-1 { animation: floatAndSpin 4s ease-in-out infinite; }
        .animate-float-diamond { animation: gentleFloat 3.5s ease-in-out infinite 0.5s; }
        .animate-sparkle-2 { animation: floatAndSpinReverse 4.5s ease-in-out infinite 1s; }
        
        /* Logout Pulse */
        .animate-pulse-slow {
          animation: gentleFloat 3s ease-in-out infinite;
        }
      `}</style>

      {/* Render the rest of the app */}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);