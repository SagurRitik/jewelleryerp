import React, { useState, useEffect, useRef } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { toast } from "sonner";
import {
  Database,
  Download,
  UploadCloud,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileArchive,
  HardDrive,
  Lock,
  Layers,
  FileCheck,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
  Server
} from "lucide-react";

export default function BackupManagement() {
  const { user } = useAuth();
  const { isDark } = useTheme();

  // Status & stats
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Download Backup State
  const [includeMedia, setIncludeMedia] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState("");

  // Restore Backup State
  const [selectedFile, setSelectedFile] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch live system status
  const fetchStatus = async () => {
    try {
      setLoadingStats(true);
      const { data } = await api.get("/admin/backup/status");
      if (data.success) {
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching backup status:", err);
      toast.error(err.response?.data?.message || "Failed to load database status");
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // 1. One-Click Backup Download
  const handleDownloadBackup = async () => {
    try {
      setDownloading(true);
      setDownloadProgress("Packaging database collections & media files...");

      const response = await api.get(
        `/admin/backup/download?includeMedia=${includeMedia}`,
        {
          responseType: "blob",
          timeout: 10 * 60 * 1000, // 10 minutes timeout
        }
      );

      setDownloadProgress("Finalizing download...");

      // Extract filename from header if present, or fallback
      let filename = `Nazara_ERP_Backup_${new Date().toISOString().slice(0, 10)}.zip`;
      const disposition = response.headers["content-disposition"];
      if (disposition && disposition.indexOf("filename=") !== -1) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      }

      // Trigger browser download
      const blob = new Blob([response.data], { type: "application/zip" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("System backup downloaded successfully!", {
        description: `Saved as ${filename}`,
      });
    } catch (err) {
      console.error("Download error:", err);
      toast.error(
        err.response?.data?.message || "Failed to download backup archive."
      );
    } finally {
      setDownloading(false);
      setDownloadProgress("");
    }
  };

  // Handle file drop/selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".zip")) {
      toast.error("Invalid file format. Please select a .zip backup archive.");
      return;
    }
    setSelectedFile(file);
    setRestoreResult(null);
  };

  // 2. Restore Backup Confirmation & Execution
  const handleRestoreSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a .zip backup file to restore.");
      return;
    }

    try {
      setRestoring(true);
      setShowConfirmModal(false);

      const formData = new FormData();
      formData.append("backupFile", selectedFile);

      const { data } = await api.post("/admin/backup/restore", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 15 * 60 * 1000, // 15 min timeout
      });

      if (data.success) {
        setRestoreResult(data);
        toast.success("System successfully restored!", {
          description: "All database collections and media have been updated.",
        });
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchStatus();
      }
    } catch (err) {
      console.error("Restore error:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to restore backup. Check file integrity."
      );
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div
      className={`min-h-screen p-6 md:p-8 transition-colors ${
        isDark ? "bg-zinc-950 text-zinc-100" : "bg-slate-50 text-slate-800"
      }`}
    >
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
                <Database className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  System Backup & Restore
                </h1>
                <p
                  className={`text-sm mt-0.5 ${
                    isDark ? "text-zinc-400" : "text-slate-500"
                  }`}
                >
                  Full database export and zero-loss restore center (Superadmin only)
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={fetchStatus}
            disabled={loadingStats}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm ${
              isDark
                ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            <RefreshCw
              className={`w-4 h-4 ${loadingStats ? "animate-spin" : ""}`}
            />
            Refresh Status
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Database Name */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isDark
                ? "bg-zinc-900/70 border-zinc-800"
                : "bg-white border-slate-200/80 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
                Live Database
              </span>
              <Server className="w-5 h-5 text-amber-500" />
            </div>
            <div className="mt-3 text-xl font-bold truncate">
              {stats?.databaseName || "Connecting..."}
            </div>
            <div
              className={`text-xs mt-1 flex items-center gap-1.5 ${
                isDark ? "text-zinc-400" : "text-slate-500"
              }`}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              MongoDB Online
            </div>
          </div>

          {/* Card 2: Total Collections */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isDark
                ? "bg-zinc-900/70 border-zinc-800"
                : "bg-white border-slate-200/80 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                Collections
              </span>
              <Layers className="w-5 h-5 text-blue-500" />
            </div>
            <div className="mt-3 text-2xl font-bold">
              {stats?.totalCollections ?? "--"}
            </div>
            <div
              className={`text-xs mt-1 ${
                isDark ? "text-zinc-400" : "text-slate-500"
              }`}
            >
              Models, Masters & Logs
            </div>
          </div>

          {/* Card 3: Total Documents */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isDark
                ? "bg-zinc-900/70 border-zinc-800"
                : "bg-white border-slate-200/80 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
                Total Records
              </span>
              <HardDrive className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="mt-3 text-2xl font-bold">
              {stats?.totalDocuments?.toLocaleString() ?? "--"}
            </div>
            <div
              className={`text-xs mt-1 ${
                isDark ? "text-zinc-400" : "text-slate-500"
              }`}
            >
              Total documents stored
            </div>
          </div>

          {/* Card 4: Media Uploads */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isDark
                ? "bg-zinc-900/70 border-zinc-800"
                : "bg-white border-slate-200/80 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-500">
                Media Files
              </span>
              <FileArchive className="w-5 h-5 text-purple-500" />
            </div>
            <div className="mt-3 text-2xl font-bold">
              {stats?.mediaCount ?? "--"}
              <span className="text-sm font-normal text-muted-foreground ml-1.5">
                ({stats?.mediaTotalSizeMB || 0} MB)
              </span>
            </div>
            <div
              className={`text-xs mt-1 ${
                isDark ? "text-zinc-400" : "text-slate-500"
              }`}
            >
              Product & document uploads
            </div>
          </div>
        </div>

        {/* MAIN ACTIONS GRID: DOWNLOAD & RESTORE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ================= SECTION 1: DOWNLOAD BACKUP ================= */}
          <div
            className={`p-6 md:p-8 rounded-3xl border flex flex-col justify-between transition-all ${
              isDark
                ? "bg-zinc-900/90 border-zinc-800/80 shadow-2xl shadow-black/40"
                : "bg-white border-slate-200/90 shadow-md"
            }`}
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Instant System Backup</h2>
                  <p
                    className={`text-xs ${
                      isDark ? "text-zinc-400" : "text-slate-500"
                    }`}
                  >
                    1-Click complete database & media export
                  </p>
                </div>
              </div>

              <p
                className={`text-sm leading-relaxed mb-6 ${
                  isDark ? "text-zinc-300" : "text-slate-600"
                }`}
              >
                Clicking below will bundle all MongoDB collections using{" "}
                <span className="font-semibold text-amber-500">
                  MongoDB EJSON
                </span>{" "}
                (preserving exact ObjectIds, Dates, and numeric precisions) along
                with your uploaded product images into a single timestamped{" "}
                <code className="text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-mono">
                  .zip
                </code>{" "}
                archive.
              </p>

              {/* Options */}
              <div
                className={`p-4 rounded-2xl mb-6 border ${
                  isDark
                    ? "bg-zinc-800/40 border-zinc-700/60"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeMedia}
                    onChange={(e) => setIncludeMedia(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-zinc-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-semibold block">
                      Include Product Images & Uploads Folder
                    </span>
                    <span
                      className={`text-xs block mt-0.5 ${
                        isDark ? "text-zinc-400" : "text-slate-500"
                      }`}
                    >
                      {includeMedia
                        ? `Includes ~${stats?.mediaCount || 0} media files (~${
                            stats?.mediaTotalSizeMB || 0
                          } MB). Recommended for full restoration.`
                        : "Exports database JSON only (ultra fast & lightweight)."}
                    </span>
                  </div>
                </label>
              </div>

              {/* Progress text */}
              {downloading && (
                <div className="mb-4 flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-medium animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{downloadProgress || "Processing archive..."}</span>
                </div>
              )}
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownloadBackup}
              disabled={downloading}
              className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 text-base shadow-lg transition-all transform active:scale-[0.98] ${
                downloading
                  ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/20 hover:shadow-emerald-600/30"
              }`}
            >
              {downloading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating Backup ZIP...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download Complete Backup (.zip)
                </>
              )}
            </button>
          </div>

          {/* ================= SECTION 2: RESTORE BACKUP ================= */}
          <div
            className={`p-6 md:p-8 rounded-3xl border flex flex-col justify-between transition-all ${
              isDark
                ? "bg-zinc-900/90 border-zinc-800/80 shadow-2xl shadow-black/40"
                : "bg-white border-slate-200/90 shadow-md"
            }`}
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Restore System Backup</h2>
                  <p
                    className={`text-xs ${
                      isDark ? "text-zinc-400" : "text-slate-500"
                    }`}
                  >
                    Restore database & media from a previous backup
                  </p>
                </div>
              </div>

              {/* Warning Notice */}
              <div
                className={`p-4 rounded-2xl mb-6 border flex items-start gap-3 ${
                  isDark
                    ? "bg-red-500/10 border-red-500/20 text-red-300"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <span className="font-bold block text-red-500 uppercase tracking-wider mb-0.5">
                    Critical Safety Protection
                  </span>
                  Restoring will update database collections and media files. An{" "}
                  <strong>emergency pre-restore snapshot</strong> is
                  automatically preserved on the server before applying any
                  updates.
                </div>
              </div>

              {/* File Dropzone / Picker */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  selectedFile
                    ? isDark
                      ? "border-emerald-500/60 bg-emerald-500/5"
                      : "border-emerald-500 bg-emerald-50/50"
                    : isDark
                    ? "border-zinc-700 hover:border-amber-500/60 hover:bg-zinc-800/40"
                    : "border-slate-300 hover:border-amber-500 hover:bg-amber-50/30"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".zip,application/zip"
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="space-y-1">
                    <FileCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <div className="font-semibold text-sm truncate max-w-xs mx-auto">
                      {selectedFile.name}
                    </div>
                    <div
                      className={`text-xs ${
                        isDark ? "text-zinc-400" : "text-slate-500"
                      }`}
                    >
                      Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB •
                      Click to choose another
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FileArchive className="w-10 h-10 text-amber-500/80 mx-auto" />
                    <div className="text-sm font-semibold">
                      Click to select or drag & drop backup file (.zip)
                    </div>
                    <div
                      className={`text-xs ${
                        isDark ? "text-zinc-400" : "text-slate-500"
                      }`}
                    >
                      Supports Nazara ERP .zip archives (up to 500 MB)
                    </div>
                  </div>
                )}
              </div>

              {/* Restore Result Card (if completed) */}
              {restoreResult && (
                <div
                  className={`mt-4 p-4 rounded-2xl border text-xs space-y-2 ${
                    isDark
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-emerald-50 border-emerald-200 text-emerald-900"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    Restore Successful!
                  </div>
                  <div>
                    Backup Date:{" "}
                    <strong>
                      {new Date(
                        restoreResult.backupCreatedOn
                      ).toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    Collections Restored:{" "}
                    <strong>
                      {Object.keys(restoreResult.restoredCollections || {}).length}
                    </strong>
                  </div>
                  <div>
                    Media Files Restored:{" "}
                    <strong>{restoreResult.restoredMediaCount || 0}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Restore Action Button */}
            <div className="mt-6">
              <button
                type="button"
                disabled={!selectedFile || restoring}
                onClick={() => setShowConfirmModal(true)}
                className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 text-base shadow-lg transition-all transform active:scale-[0.98] ${
                  !selectedFile || restoring
                    ? "bg-zinc-700 text-zinc-400 cursor-not-allowed opacity-60"
                    : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-600/20 hover:shadow-amber-600/30"
                }`}
              >
                {restoring ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Restoring System... Please wait...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5" />
                    Verify & Restore Backup
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RESTORE CONFIRMATION & PASSWORD MODAL */}
        {/* RESTORE CONFIRMATION MODAL */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
              className={`max-w-md w-full p-6 md:p-8 rounded-3xl border shadow-2xl transition-all ${
                isDark
                  ? "bg-zinc-900 border-zinc-800 text-zinc-100"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Confirm System Restore</h3>
                  <p
                    className={`text-xs ${
                      isDark ? "text-zinc-400" : "text-slate-500"
                    }`}
                  >
                    Please review before proceeding
                  </p>
                </div>
              </div>

              <div
                className={`p-4 rounded-xl mb-6 border text-xs space-y-2 leading-relaxed ${
                  isDark
                    ? "bg-zinc-800/60 border-zinc-700 text-zinc-300"
                    : "bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <div>
                  Archive:{" "}
                  <span className="font-semibold text-amber-500 block truncate">
                    {selectedFile?.name}
                  </span>
                </div>
                <div>
                  Size:{" "}
                  <strong>{(selectedFile?.size / (1024 * 1024)).toFixed(2)} MB</strong>
                </div>
                <div className="pt-1 text-red-500 font-medium">
                  ⚠️ This will replace current database collections with the data in this archive. An emergency safety snapshot will be saved automatically on the server.
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={restoring}
                  onClick={() => setShowConfirmModal(false)}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                    isDark
                      ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                      : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={restoring}
                  onClick={handleRestoreSubmit}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-orange-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {restoring ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Restoring...
                    </>
                  ) : (
                    "Yes, Restore Now"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
