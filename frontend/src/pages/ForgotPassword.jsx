// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import api from "../api/axios";

// export default function ForgotPassword() {
//   const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
  
//   const navigate = useNavigate();

//   // Step 1: Send OTP
//   const handleSendOtp = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     setMessage("");

//     try {
//       const res = await api.post("/auth/forgot-password", { email });
//       if (res.data.success) {
//         setMessage("OTP sent to your email!");
//         setStep(2); // Move to next step
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to send OTP");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Step 2: Reset Password
//   const handleResetPassword = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     setMessage("");

//     try {
//       const res = await api.post("/auth/reset-password", { 
//         email, 
//         otp, 
//         newPassword 
//       });
      
//       if (res.data.success) {
//         alert("Password Reset Successful! Please Login.");
//         navigate("/login");
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || "Reset failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border-t-4 border-[#501b46]">
//         <h2 className="text-2xl font-bold text-[#501b46] text-center mb-2">Reset Password</h2>
//         <p className="text-center text-gray-500 text-sm mb-6">
//           {step === 1 ? "Enter your email to receive OTP" : "Enter OTP and new password"}
//         </p>

//         {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm text-center">{error}</div>}
//         {message && <div className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm text-center">{message}</div>}

//         {step === 1 ? (
//           /* STEP 1 FORM */
//           <form onSubmit={handleSendOtp} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Email Address</label>
//               <input
//                 type="email"
//                 required
//                 className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-[#501b46] focus:border-[#501b46] outline-none"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-[#501b46] text-white py-2.5 rounded-lg hover:bg-[#3b1333] transition disabled:opacity-50 font-medium"
//             >
//               {loading ? "Sending OTP..." : "Send OTP"}
//             </button>
//           </form>
//         ) : (
//           /* STEP 2 FORM */
//           <form onSubmit={handleResetPassword} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
//               <input
//                 type="text"
//                 required
//                 placeholder="6-digit code"
//                 className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-[#501b46] focus:border-[#501b46] outline-none tracking-widest text-center"
//                 value={otp}
//                 onChange={(e) => setOtp(e.target.value)}
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">New Password</label>
//               <input
//                 type="password"
//                 required
//                 placeholder="New secure password"
//                 className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-[#501b46] focus:border-[#501b46] outline-none"
//                 value={newPassword}
//                 onChange={(e) => setNewPassword(e.target.value)}
//               />
//             </div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-[#501b46] text-white py-2.5 rounded-lg hover:bg-[#3b1333] transition disabled:opacity-50 font-medium"
//             >
//               {loading ? "Resetting..." : "Reset Password"}
//             </button>
//           </form>
//         )}

//         <div className="mt-4 text-center">
//           <Link to="/login" className="text-sm text-[#501b46] hover:underline font-semibold">
//             Back to Login
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }




import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, KeyRound, Sparkles, Gem, ChevronRight } from "lucide-react";
import api from "../api/axios";
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
      <Gem className="text-white rotate-45" style={{ width: size, height: size }} />
    </div>
  );
}

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const navigate = useNavigate();

  /* STEP 1 */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await api.post("/auth/forgot-password", { email });
      if (res.data.success) {
        setMessage("OTP sent to your email");
        setStep(2);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* STEP 2 */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      if (res.data.success) {
        navigate("/login");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-black">

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
              Secure account recovery
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT */}
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
                {step === 1 ? (
                  <Mail className="text-white w-8 h-8" />
                ) : (
                  <KeyRound className="text-white w-8 h-8" />
                )}
              </div>
              <h2 className="text-3xl font-light">Reset Password</h2>
              <p className="text-gray-500 text-sm">
                {step === 1
                  ? "Receive OTP on your email"
                  : "Enter OTP & new password"}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded text-sm text-center">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded text-sm text-center">
                {message}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-6">
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

                <button
                  type="submit"
                  disabled={loading}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="w-full h-14 bg-gradient-to-r from-[#5A374F] to-[#8b5a7a] text-white rounded-xl shadow-xl flex items-center justify-center gap-2"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                  <ChevronRight
                    className={`transition-transform ${
                      isHovered ? "translate-x-1" : ""
                    }`}
                  />
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="6-digit code"
                    className="h-14 w-full border-2 rounded-xl text-center tracking-widest focus:border-[#5A374F] outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A374F]/60" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-12 h-14 w-full border-2 rounded-xl focus:border-[#5A374F] outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-gradient-to-r from-[#5A374F] to-[#8b5a7a] text-white rounded-xl shadow-xl"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            )}

            <div className="text-center text-sm">
              <Link to="/login" className="text-[#5A374F] font-medium">
                Back to Login
              </Link>
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
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }
        @keyframes gradient-shift {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
