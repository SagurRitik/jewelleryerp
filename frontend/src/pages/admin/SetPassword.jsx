import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios.js";

export default function SetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await api.post(`/auth/set-password/${token}`, { password });
      alert("Account activated successfully");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Activation failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg space-y-4 w-96"
      >
        <h2 className="text-xl font-bold text-center">
          Set Your Password
        </h2>

        <input
          type="password"
          placeholder="New Password"
          required
          className="w-full border p-2 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          required
          className="w-full border p-2 rounded"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-[#5A374F] text-white py-2 rounded"
        >
          Activate Account
        </button>
      </form>
    </div>
  );
}