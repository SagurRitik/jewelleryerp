// import { useState } from "react";
// import api from "../api/axios"; // Aapka configured axios
// import { useNavigate, Link } from "react-router-dom";
// import logo from "../assets/nazara_logo.png"; 

// export default function Signup() {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role: "salesperson", // Default role
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       // Backend API call to send OTP
//       await api.post("/auth/signup", formData);
//       // Success: Redirect to Verify Page, passing email in state
//       navigate("/verify-otp", { state: { email: formData.email } });
//     } catch (err) {
//       setError(err.response?.data?.message || "Signup failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border-t-4 border-[#501b46]">
//         <div className="flex flex-col items-center mb-6">
//           <img src={logo} alt="Nazara" className="h-12 mb-2 brightness-0" style={{filter: "brightness(0)"}} /> 
//           <h2 className="text-2xl font-bold text-[#501b46]">Create Account</h2>
//         </div>

//         {error && <div className="bg-red-50 text-red-600 p-2 text-sm rounded mb-4">{error}</div>}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             name="name"
//             placeholder="Full Name"
//             required
//             className="w-full px-4 py-2 border rounded outline-none focus:border-[#501b46]"
//             onChange={handleChange}
//           />
//           <input
//             name="email"
//             type="email"
//             placeholder="Email Address"
//             required
//             className="w-full px-4 py-2 border rounded outline-none focus:border-[#501b46]"
//             onChange={handleChange}
//           />
//           <input
//             name="password"
//             type="password"
//             placeholder="Password"
//             required
//             className="w-full px-4 py-2 border rounded outline-none focus:border-[#501b46]"
//             onChange={handleChange}
//           />
          
//           <div>
//             <label className="text-sm text-gray-600">Select Role</label>
//             <select
//               name="role"
//               className="w-full px-4 py-2 border rounded outline-none focus:border-[#501b46] mt-1 bg-white"
//               onChange={handleChange}
//               value={formData.role}
//             >
//               <option value="salesperson">Salesperson</option>
//               <option value="admin">Admin</option>
//             </select>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-[#501b46] text-white py-2 rounded hover:bg-[#3d1536] disabled:opacity-50"
//           >
//             {loading ? "Sending OTP..." : "Sign Up"}
//           </button>
//         </form>

//         <p className="mt-4 text-center text-sm text-gray-600">
//           Already have an account? <Link to="/login" className="text-[#501b46] font-bold">Login</Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// import { useState } from "react";
// import { Eye, EyeOff, Lock, Mail, User, Sparkles, Gem, ChevronRight } from "lucide-react";
// import api from "../api/axios";
// import { useNavigate, Link } from "react-router-dom";
// import logo from "../assets/nazara_logo.png";

// /* Floating Diamond */
// function FloatingDiamond({ delay, duration, size, x, y }) {
//   return (
//     <div
//       className="absolute opacity-20 animate-float"
//       style={{
//         left: `${x}%`,
//         top: `${y}%`,
//         animationDelay: `${delay}s`,
//         animationDuration: `${duration}s`,
//       }}
//     >
//       <Gem className="text-white rotate-45" style={{ width: size, height: size }} />
//     </div>
//   );
// }

// export default function Signup() {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role: "salesperson",
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [isHovered, setIsHovered] = useState(false);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       await api.post("/auth/signup", formData);
//       navigate("/verify-otp", { state: { email: formData.email } });
//     } catch (err) {
//       setError(err?.response?.data?.message || "Signup failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex relative overflow-hidden bg-black">

//       {/* Background Pattern */}
//       <div className="absolute inset-0 opacity-10">
//         <div
//           className="absolute inset-0"
//           style={{
//             backgroundImage:
//               "radial-gradient(circle at 2px 2px, rgba(90,55,79,0.3) 1px, transparent 0)",
//             backgroundSize: "40px 40px",
//           }}
//         />
//       </div>

//       {/* LEFT BRANDING */}
//       <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-br from-[#5A374F] via-[#8b5a7a] to-[#5A374F] animate-gradient-shift" />

//         <FloatingDiamond delay={0} duration={8} size={40} x={10} y={15} />
//         <FloatingDiamond delay={1} duration={10} size={30} x={80} y={25} />
//         <FloatingDiamond delay={2} duration={7} size={50} x={20} y={70} />
//         <FloatingDiamond delay={1.5} duration={9} size={35} x={75} y={60} />

//         <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
//           <div className="text-center space-y-10 max-w-lg">
//             <div className="relative">
//               <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-3xl blur-xl" />
//               <div className="relative bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20">
//                 <img src={logo} alt="Nazara" className="h-36 mx-auto" />
//                 <Sparkles className="absolute -top-3 -left-3 text-yellow-300 animate-pulse" />
//               </div>
//             </div>

//             <div>
//               <h1 className="text-5xl font-extralight tracking-widest">
//                 NAZARA
//               </h1>
//               <p className="text-xl tracking-[0.3em] text-white/90 mt-2">
//                 DIAMONDS
//               </p>
//               <p className="text-sm text-white/70 italic mt-2">
//                 Lab Grown Diamonds
//               </p>
//             </div>

//             <p className="text-white/70 text-sm tracking-wide">
//               Secure onboarding for authorized personnel
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* RIGHT SIGNUP */}
//       <div className="flex-1 flex items-center justify-center p-8 relative">
//         <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white" />

//         <div className="w-full max-w-md relative z-10">

//           {/* Mobile Logo */}
//           <div className="lg:hidden text-center mb-8">
//             <img src={logo} className="h-20 mx-auto mb-4" />
//             <h2 className="text-3xl text-[#5A374F]">Nazara ERP</h2>
//           </div>

//           <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-10 space-y-8">

//             <div className="text-center space-y-2">
//               <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#5A374F] to-[#8b5a7a] rounded-2xl flex items-center justify-center">
//                 <User className="text-white w-8 h-8" />
//               </div>
//               <h2 className="text-3xl font-light">Create Account</h2>
//               <p className="text-gray-500">OTP verification required</p>
//             </div>

//             {error && (
//               <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded text-sm text-center">
//                 {error}
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-6">

//               {/* NAME */}
//               <div>
//                 <label className="text-sm font-medium text-gray-700">
//                   Full Name
//                 </label>
//                 <div className="relative mt-1">
//                   <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A374F]/60" />
//                   <input
//                     name="name"
//                     required
//                     onChange={handleChange}
//                     className="pl-12 h-14 w-full border-2 rounded-xl focus:border-[#5A374F] outline-none"
//                   />
//                 </div>
//               </div>

//               {/* EMAIL */}
//               <div>
//                 <label className="text-sm font-medium text-gray-700">
//                   Email Address
//                 </label>
//                 <div className="relative mt-1">
//                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A374F]/60" />
//                   <input
//                     type="email"
//                     name="email"
//                     required
//                     onChange={handleChange}
//                     className="pl-12 h-14 w-full border-2 rounded-xl focus:border-[#5A374F] outline-none"
//                   />
//                 </div>
//               </div>

//               {/* PASSWORD */}
//               <div>
//                 <label className="text-sm font-medium text-gray-700">
//                   Password
//                 </label>
//                 <div className="relative mt-1">
//                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A374F]/60" />
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     name="password"
//                     required
//                     onChange={handleChange}
//                     className="pl-12 pr-12 h-14 w-full border-2 rounded-xl focus:border-[#5A374F] outline-none"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-4 top-1/2 -translate-y-1/2"
//                   >
//                     {showPassword ? <EyeOff /> : <Eye />}
//                   </button>
//                 </div>
//               </div>

//               {/* ROLE */}
//               <div>
//                 <label className="text-sm font-medium text-gray-700">
//                   Select Role
//                 </label>
//                 <select
//                   name="role"
//                   value={formData.role}
//                   onChange={handleChange}
//                   className="mt-1 h-14 w-full border-2 rounded-xl px-4 focus:border-[#5A374F] outline-none bg-white"
//                 >
//                   <option value="salesperson">Salesperson</option>
//                   <option value="admin">Admin</option>
//                 </select>
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 onMouseEnter={() => setIsHovered(true)}
//                 onMouseLeave={() => setIsHovered(false)}
//                 className="w-full h-14 bg-gradient-to-r from-[#5A374F] to-[#8b5a7a] text-white rounded-xl shadow-xl flex items-center justify-center gap-2"
//               >
//                 {loading ? "Sending OTP..." : "Create Account"}
//                 <ChevronRight
//                   className={`transition-transform ${
//                     isHovered ? "translate-x-1" : ""
//                   }`}
//                 />
//               </button>
//             </form>

//             <div className="text-center text-sm text-gray-600">
//               Already have an account?{" "}
//               <Link to="/login" className="text-[#5A374F] font-medium">
//                 Login
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Animations */}
//       <style>{`
//         @keyframes float {
//           0%,100% { transform: translateY(0) rotate(45deg); }
//           50% { transform: translateY(-20px) rotate(45deg); }
//         }
//         .animate-float { animation: float ease-in-out infinite; }
//         .animate-gradient-shift {
//           background-size: 200% 200%;
//           animation: gradient-shift 15s ease infinite;
//         }
//         @keyframes gradient-shift {
//           0%,100% { background-position: 0% 50%; }
//           50% { background-position: 100% 50%; }
//         }
//       `}</style>
//     </div>
//   );
// }
