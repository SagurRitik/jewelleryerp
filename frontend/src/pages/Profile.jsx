

import api from "../api/axios.js";

import { useNavigate } from "react-router-dom";


import React, { useState } from 'react';
import { useAuth } from "../context/AuthContext";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Edit,
  Camera,
  Lock,
  Activity,
  Award,
  Clock,
  LogOut
} from 'lucide-react';



// --- Placeholder Data for UI Enhancement ---
const activityHistory = [
  { action: 'Logged in', time: 'Just now', icon: Activity },
  { action: 'Updated profile', time: '2 hours ago', icon: Edit },
  { action: 'Changed password', time: '1 week ago', icon: Lock }
];

const achievements = [
  { title: 'Early Adopter', description: 'Joined during beta phase', earned: true },
  { title: 'Verified User', description: 'Email verification complete', earned: true },
  { title: 'Top Contributor', description: 'Made 50+ contributions', earned: false }
];

export default function Profile() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");


  const navigate = useNavigate();



  const handleLogout = async () => {
    try {
      await logout(); // wait for logout
      navigate("/login"); // redirect
    } catch (err) {
      console.error("Logout failed", err);
    }
  };



  const handlePasswordChange = async () => {
    try {
      const { data } = await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      alert(data.message);

      // clear fields
      setCurrentPassword("");
      setNewPassword("");

    } catch (err) {
      alert(err.response?.data?.message || "Error updating password");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#501b46] border-solid"></div>
      </div>
    );
  }

  // Helper function for tab content rendering
  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
              <p className="text-sm text-gray-500">Update your personal details and contact information</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#501b46]/20 focus:border-[#501b46]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <input
                    type="text"
                    defaultValue={user.role}
                    disabled
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>




              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    defaultValue={user.email}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#501b46]/20 focus:border-[#501b46]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">User ID</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    defaultValue={user._id}
                    disabled
                    className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500 font-mono text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="bg-[#501b46] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#3d1339] transition-colors shadow-sm">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Security Settings</h3>
              <p className="text-sm text-gray-500">Manage your password and account security</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                {/* <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Current Password</label>
                  <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#501b46]/20 focus:border-[#501b46]" />
                </div> */}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#501b46]/20 focus:border-[#501b46]"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#501b46]/20 focus:border-[#501b46]"
                  />
                </div>

                {/* 
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">New Password</label>
                  <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#501b46]/20 focus:border-[#501b46]" />
                </div> */}
                <button
                  onClick={handlePasswordChange}
                  className="w-full bg-[#501b46] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#3d1339] transition-colors shadow-sm"
                >
                  Update Password
                </button>


              </div>



              <div className="h-px bg-gray-200 my-6"></div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Account Status</h4>
                <div className={`flex items-center justify-between p-4 rounded-lg ${user.isVerified ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                  <div>
                    <p className={`font-medium ${user.isVerified ? 'text-green-800' : 'text-red-800'}`}>
                      {user.isVerified ? 'Verified Account' : 'Unverified Account'}
                    </p>
                    <p className={`text-sm ${user.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                      {user.isVerified ? 'Your account is fully verified and secure.' : 'Please verify your email address.'}
                    </p>
                  </div>
                  {user.isVerified ? (
                    <Shield className="w-5 h-5 text-green-600" />
                  ) : (
                    <button className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium hover:bg-red-200 transition-colors">
                      Verify Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'activity':
        return (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
              <p className="text-sm text-gray-500">Your recent actions and system interactions</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {activityHistory.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-[#501b46]/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[#501b46]" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a]">User Profile</h1>
          <p className="text-gray-500 mt-1">Manage your personal information and preferences</p>
        </div>

        {/* Profile Overview Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Cover Photo Area */}
          <div className="h-32 bg-gradient-to-r from-[#501b46] to-[#8b4a7d]"></div>

          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-12 md:-mt-16 relative">

              <div className="flex flex-col md:flex-row md:items-end gap-6">
                {/* Avatar */}
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-white p-1 shadow-lg">
                    <div className="w-full h-full rounded-full bg-[#501b46] text-white flex items-center justify-center text-5xl font-bold overflow-hidden">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <button className="absolute bottom-2 right-2 w-8 h-8 bg-white text-[#501b46] rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors border border-gray-200">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Basic Info */}
                <div className="pb-2 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center md:justify-start gap-2">
                    {user.name}
                    <span className="bg-[#501b46] text-white text-xs px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                      {user.role}
                    </span>
                  </h2>
                  <p className="text-gray-500 font-medium">{user.role === 'admin' ? 'Store Manager' : 'Sales Representative'}</p>

                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mt-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {user.email}
                    </div>
                    {user.isVerified && (
                      <div className="flex items-center gap-1.5 text-green-600">
                        <Shield className="w-4 h-4" />
                        Verified
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 md:mt-0 flex gap-3 justify-center md:justify-end">
                {/* <button 
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
                >
                  
                  Sign Out
                </button> */}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>

                <button className="flex items-center gap-2 px-4 py-2 bg-[#501b46] text-white rounded-lg hover:bg-[#3d1339] transition-colors font-medium text-sm shadow-sm">
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column - Stats */}
          <div className="space-y-6">

            {/* Stats Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4">Profile Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Activity className="w-4 h-4 text-[#501b46]" />
                    <span className="text-sm">Status</span>
                  </div>
                  <span className="font-semibold text-green-600 text-sm bg-green-50 px-2 py-0.5 rounded-full">Active</span>
                </div>
                <div className="h-px bg-gray-100"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Award className="w-4 h-4 text-[#501b46]" />
                    <span className="text-sm">Role Level</span>
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">
                    {user.role === 'admin' ? 'Level 3' : 'Level 1'}
                  </span>
                </div>
                <div className="h-px bg-gray-100"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 text-[#501b46]" />
                    <span className="text-sm">Member Since</span>
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">
                    {new Date(user.createdAt).toLocaleDateString("en-US", { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Achievements Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4">Achievements</h3>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${achievement.earned ? 'bg-[#501b46]/5 border-[#501b46]/10' : 'bg-gray-50 border-gray-100'
                      }`}
                  >
                    <Award className={`w-5 h-5 mt-0.5 flex-shrink-0 ${achievement.earned ? 'text-[#501b46]' : 'text-gray-400'
                      }`} />
                    <div>
                      <p className={`font-medium text-sm ${achievement.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                        {achievement.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>



          </div>

          {/* Right Column - Tabs Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Tabs Navigation */}
            <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm inline-flex w-full md:w-auto">
              {['personal', 'security', 'activity'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                    ? 'bg-[#501b46] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content Area */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              {renderTabContent()}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}