import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const location = useLocation();
  const navigate = useNavigate();
  // Context se setUser ya login function le sakte hain agar direct login karwana ho
  
  // Agar koi direct verify page par aaye bina email ke
  const email = location.state?.email;

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email) {
        setError("Email missing. Please signup again.");
        setLoading(false);
        return;
    }

    try {
      await api.post("/auth/verify", { email, otp });
      // Verify hone ke baad login page ya dashboard bhejein
      alert("Verification Successful! Please Login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm border-t-4 border-[#501b46]">
        <h2 className="text-2xl font-bold text-[#501b46] text-center mb-2">Verify OTP</h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Code sent to <span className="font-bold">{email}</span>
        </p>

        {error && <div className="bg-red-50 text-red-600 p-2 text-sm rounded mb-4 text-center">{error}</div>}

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            maxLength="6"
            className="w-full px-4 py-2 border rounded text-center text-xl tracking-widest outline-none focus:border-[#501b46]"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#501b46] text-white py-2 rounded hover:bg-[#3d1536] disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Login"}
          </button>
        </form>
      </div>
    </div>
  );
}