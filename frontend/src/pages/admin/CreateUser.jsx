

import { useState } from "react";
import api from "../../api/axios";
import { UserPlus } from "lucide-react";

export default function CreateUser() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!form.role) {
      setError("Please select a role");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/invite", form);

      setMessage("✅ Invitation sent successfully");
      setForm({
        name: "",
        email: "",
        role: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="bg-[#5A374F] p-3 rounded-xl">
            <UserPlus className="text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Create New User
          </h2>
        </div>

        {/* Success / Error */}
        {message && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              required
              onChange={handleChange}
              className="mt-1 w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#5A374F] outline-none"
              placeholder="Enter full name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              required
              onChange={handleChange}
              className="mt-1 w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#5A374F] outline-none"
              placeholder="Enter email"
            />
          </div>

          {/* Role */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Select Role
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              required
              className="mt-1 w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#5A374F] outline-none"
            >
              <option value="">-- Select Role --</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="salesperson">Salesperson</option>
              <option value="accountant">Accountant</option>
              <option value="inventory">Inventory</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#5A374F] to-[#8b5a7a] text-white py-3 rounded-lg font-medium hover:opacity-90 transition"
          >
            {loading ? "Sending Invite..." : "Create & Send Invitation"}
          </button>
        </form>
      </div>
    </div>
  );
}