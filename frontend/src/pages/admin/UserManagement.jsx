import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { Shield, Trash2, RefreshCcw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      
      const { data } = await api.get("/auth/all-users");
      setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    
    fetchUsers();
  }, []);

  const toggleStatus = async (id) => {
    await api.patch(`/auth/toggle-status/${id}`);
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await api.delete(`/auth/delete/${id}`);
    fetchUsers();
  };

  const roleBadge = (role) => {
    const colors = {
      superadmin: "bg-purple-100 text-purple-700",
      admin: "bg-blue-100 text-blue-700",
      manager: "bg-yellow-100 text-yellow-700",
      salesperson: "bg-green-100 text-green-700",
      accountant: "bg-pink-100 text-pink-700",
      inventory: "bg-gray-200 text-gray-700",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[role]}`}>
        {role}
      </span>
    );
  };

  if (loading) return <div className="p-6">Loading users...</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-xl rounded-2xl p-6">

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 text-gray-600 hover:text-gray-800 hover:border-gray-200 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-2xl font-semibold text-gray-800">
              User Management
            </h2>
          </div>

          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-600 text-sm">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3 text-gray-600">{u.email}</td>
                  <td className="p-3">{roleBadge(u.role)}</td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        u.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {u.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>

                  <td className="p-3 text-center flex justify-center gap-3">

                    {/* Toggle Active */}
                    <button
                      onClick={() => toggleStatus(u._id)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <Shield size={18} />
                    </button>

                    {/* Delete (Superadmin cannot delete themselves) */}
                    {/* {user.role === "superadmin" && u.role !== "superadmin" && (
                      <button
                        onClick={() => deleteUser(u._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}  */}

                    {["superadmin", "admin"].includes(user.role) && u.role !== "superadmin" && (
  <button
    onClick={() => deleteUser(u._id)}
    className="text-red-600 hover:text-red-800"
  >
    <Trash2 size={18} />
  </button>
)}

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}