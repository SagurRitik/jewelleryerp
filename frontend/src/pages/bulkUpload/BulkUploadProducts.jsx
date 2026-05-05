

import { useState } from "react";
import axios from "axios";
import { useProductList } from "../../context/ProductListContext";

const API = "/api/products";

export default function BulkUploadProducts() {
  const [excel, setExcel] = useState(null);
  const [zip, setZip] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { invalidateCache } = useProductList();

  const validateExcel = async () => {
    if (!excel) return alert("Please select Excel file");

    const fd = new FormData();
    fd.append("excel", excel);

    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post(`${API}/validate-excel`, fd);
      setReport(res.data);
      setMessage("✅ Excel validation successful");
    } catch (e) {
      setMessage(e.response?.data?.message || "❌ Validation failed");
    } finally {
      setLoading(false);
    }
  };

  const bulkUpload = async () => {
    if (!excel || !zip) return alert("Excel & ZIP both required");

    const fd = new FormData();
    fd.append("excel", excel);
    fd.append("images", zip);

    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post(`${API}/bulk-upload`, fd);
      setReport(res.data);
      invalidateCache();
      setMessage("🚀 Bulk upload completed successfully");
    } catch (e) {
      setMessage(e.response?.data?.message || "❌ Bulk upload failed");
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = message.includes("✅") || message.includes("🚀");

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        * {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .fade-in {
          animation: slideIn 0.6s ease-out;
        }

        .loading {
          animation: pulse 1.5s ease-in-out infinite;
        }

        input[type="file"] {
          display: none;
        }

        input[type="file"]::file-selector-button {
          display: none;
        }
      `}</style>

      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Bulk Product Upload</h1>
          <p style={styles.subtitle}>Upload and manage your product inventory with Excel and images</p>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Upload Section */}
        <div style={styles.uploadSection}>
          <h2 style={styles.sectionTitle}>📁 Upload Files</h2>
          
          <div style={styles.fileInputsGrid}>
            {/* Excel Upload */}
            <div style={styles.fileInputWrapper}>
              <label htmlFor="excel-input" style={styles.fileLabel}>
                <div style={styles.fileIconBox}>
                  <span style={styles.fileIcon}>📊</span>
                </div>
                <h3 style={styles.fileName}>Excel Spreadsheet</h3>
                <p style={styles.fileDescription}>Product data (.xlsx)</p>
                {excel && <p style={styles.selectedFile}>✓ {excel.name}</p>}
              </label>
              <input
                id="excel-input"
                type="file"
                accept=".xlsx"
                onChange={e => setExcel(e.target.files[0])}
              />
            </div>

            {/* ZIP Upload */}
            <div style={styles.fileInputWrapper}>
              <label htmlFor="zip-input" style={styles.fileLabel}>
                <div style={styles.fileIconBox}>
                  <span style={styles.fileIcon}>📦</span>
                </div>
                <h3 style={styles.fileName}>Images Archive</h3>
                <p style={styles.fileDescription}>Product images (.zip)</p>
                {zip && <p style={styles.selectedFile}>✓ {zip.name}</p>}
              </label>
              <input
                id="zip-input"
                type="file"
                accept=".zip"
                onChange={e => setZip(e.target.files[0])}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actionsSection}>
          <button
            onClick={validateExcel}
            disabled={loading || !excel}
            style={{
              ...styles.button,
              ...(loading || !excel ? styles.buttonDisabled : styles.buttonSecondary),
            }}
          >
            {loading ? <span style={styles.loadingText}>Validating...</span> : "🧪 Validate Excel"}
          </button>

          <button
            onClick={bulkUpload}
            disabled={loading || !excel || !zip || report?.errors?.length > 0}
            style={{
              ...styles.button,
              ...(loading || !excel || !zip || report?.errors?.length > 0
                ? styles.buttonDisabled
                : styles.buttonPrimary),
            }}
          >
            {loading ? <span style={styles.loadingText}>Uploading...</span> : "🚀 Bulk Upload"}
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div
            style={{
              ...styles.messageBox,
              ...(isSuccess ? styles.messageSuccess : styles.messageError),
            }}
            className="fade-in"
          >
            <p style={styles.messageText}>{message}</p>
          </div>
        )}

        {/* Report Section */}
        {report && (
          <div style={styles.reportSection} className="fade-in">
            <div style={styles.reportHeader}>
              <h2 style={styles.reportTitle}>📊 Upload Report</h2>
              <span style={styles.reportBadge}>{report.sheetUsed}</span>
            </div>

            {"insertedCount" in report && (
              <>
                <div style={styles.statsGrid}>
                  <div style={styles.statCard}>
                    <div style={styles.statNumber}>{report.insertedCount}</div>
                    <div style={styles.statLabel}>Inserted</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statNumber}>{report.updatedCount}</div>
                    <div style={styles.statLabel}>Updated</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statNumber}>{report.skippedCount}</div>
                    <div style={styles.statLabel}>Skipped</div>
                  </div>
                </div>

                {/* Inserted Table */}
                {report.report?.inserted?.length > 0 && (
                  <div style={styles.tableContainer}>
                    <h3 style={styles.tableTitle}>📥 Inserted Products</h3>
                    <div style={styles.tableWrapper}>
                      <table style={styles.table}>
                        <thead>
                          <tr style={styles.tableHeaderRow}>
                            <th style={styles.tableHeader}>Row</th>
                            <th style={styles.tableHeader}>SKU</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.report.inserted.map((r, i) => (
                            <tr key={i} style={styles.tableRow}>
                              <td style={styles.tableCell}>{r.row}</td>
                              <td style={styles.tableCell}><code style={styles.skuCode}>{r.sku}</code></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Updated Table */}
                {report.report?.updated?.length > 0 && (
                  <div style={styles.tableContainer}>
                    <h3 style={styles.tableTitle}>🔁 Updated Products</h3>
                    <div style={styles.tableWrapper}>
                      <table style={styles.table}>
                        <thead>
                          <tr style={styles.tableHeaderRow}>
                            <th style={styles.tableHeader}>Row</th>
                            <th style={styles.tableHeader}>SKU</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.report.updated.map((r, i) => (
                            <tr key={i} style={styles.tableRow}>
                              <td style={styles.tableCell}>{r.row}</td>
                              <td style={styles.tableCell}><code style={styles.skuCode}>{r.sku}</code></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Skipped Table */}
                {report.report?.skipped?.length > 0 && (
                  <div style={styles.tableContainer}>
                    <h3 style={styles.tableTitle}>⚠️ Skipped / Errors</h3>
                    <div style={styles.tableWrapper}>
                      <table style={styles.table}>
                        <thead>
                          <tr style={styles.tableHeaderRow}>
                            <th style={styles.tableHeader}>Row</th>
                            <th style={styles.tableHeader}>SKU</th>
                            <th style={styles.tableHeader}>Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.report.skipped.map((r, i) => (
                            <tr key={i} style={styles.tableRow}>
                              <td style={styles.tableCell}>{r.row}</td>
                              <td style={styles.tableCell}><code style={styles.skuCode}>{r.sku || "-"}</code></td>
                              <td style={styles.tableCell}>{r.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "linear-gradient(135deg, #f5f7fa 0%, #eef2f7 100%)",
    minHeight: "100vh",
    paddingBottom: 60,
  },
  header: {
    background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
    color: "#fff",
    paddingTop: 48,
    paddingBottom: 48,
    boxShadow: "0 4px 20px rgba(44, 62, 80, 0.15)",
  },
  headerContent: {
    maxWidth: 1200,
    margin: "0 auto",
    paddingLeft: 24,
    paddingRight: 24,
  },
  title: {
    fontSize: 42,
    fontWeight: 700,
    margin: "0 0 12px 0",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 400,
    margin: 0,
    opacity: 0.9,
    lineHeight: 1.5,
  },
  mainContent: {
    maxWidth: 1200,
    margin: "0 auto",
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 40,
  },
  uploadSection: {
    background: "#fff",
    borderRadius: 16,
    padding: 32,
    marginBottom: 32,
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 600,
    margin: "0 0 24px 0",
    color: "#2c3e50",
  },
  fileInputsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 24,
  },
  fileInputWrapper: {
    position: "relative",
  },
  fileLabel: {
    display: "block",
    padding: 32,
    border: "2px dashed #cbd5e0",
    borderRadius: 12,
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    background: "#f9fafb",
    ":hover": {
      borderColor: "#3498db",
      background: "#e3f2fd",
    },
  },
  fileIconBox: {
    fontSize: 48,
    marginBottom: 16,
    display: "inline-block",
  },
  fileIcon: {
    display: "block",
  },
  fileName: {
    fontSize: 16,
    fontWeight: 600,
    margin: "12px 0 8px 0",
    color: "#2c3e50",
  },
  fileDescription: {
    fontSize: 13,
    color: "#7f8c8d",
    margin: 0,
  },
  selectedFile: {
    fontSize: 13,
    color: "#27ae60",
    margin: "12px 0 0 0",
    fontWeight: 500,
  },
  actionsSection: {
    display: "flex",
    gap: 16,
    marginBottom: 32,
    flexWrap: "wrap",
  },
  button: {
    padding: "12px 28px",
    fontSize: 15,
    fontWeight: 600,
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: 8,
    minWidth: 160,
    justifyContent: "center",
  },
  buttonPrimary: {
    background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
    color: "#fff",
    boxShadow: "0 4px 15px rgba(52, 152, 219, 0.3)",
  },
  buttonSecondary: {
    background: "linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)",
    color: "#fff",
    boxShadow: "0 4px 15px rgba(149, 165, 166, 0.2)",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
    boxShadow: "none",
  },
  loadingText: {
    display: "inline-block",
  },
  messageBox: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    fontSize: 15,
    fontWeight: 500,
  },
  messageSuccess: {
    background: "#d4edda",
    border: "1px solid #c3e6cb",
    color: "#155724",
  },
  messageError: {
    background: "#f8d7da",
    border: "1px solid #f5c6cb",
    color: "#721c24",
  },
  messageText: {
    margin: 0,
  },
  reportSection: {
    background: "#fff",
    borderRadius: 16,
    padding: 32,
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
  },
  reportHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
    paddingBottom: 16,
    borderBottom: "2px solid #ecf0f1",
  },
  reportTitle: {
    fontSize: 22,
    fontWeight: 600,
    margin: 0,
    color: "#2c3e50",
  },
  reportBadge: {
    background: "#e8f4f8",
    color: "#16a085",
    padding: "6px 16px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    background: "linear-gradient(135deg, #f5f7fa 0%, #eef2f7 100%)",
    padding: 20,
    borderRadius: 12,
    textAlign: "center",
    border: "1px solid #ecf0f1",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 700,
    color: "#2c3e50",
    margin: "0 0 8px 0",
  },
  statLabel: {
    fontSize: 13,
    color: "#7f8c8d",
    fontWeight: 500,
    margin: 0,
  },
  tableContainer: {
    marginBottom: 28,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: 600,
    margin: "0 0 16px 0",
    color: "#2c3e50",
  },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: 8,
    border: "1px solid #ecf0f1",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
  },
  tableHeaderRow: {
    background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
    borderBottom: "2px solid #ecf0f1",
  },
  tableHeader: {
    padding: 16,
    textAlign: "left",
    fontSize: 13,
    fontWeight: 600,
    color: "#495057",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tableRow: {
    borderBottom: "1px solid #ecf0f1",
    transition: "background-color 0.2s ease",
  },
  tableCell: {
    padding: 16,
    fontSize: 14,
    color: "#2c3e50",
  },
  skuCode: {
    background: "#f5f7fa",
    padding: "2px 8px",
    borderRadius: 4,
    fontFamily: "'Courier New', monospace",
    fontSize: 13,
    color: "#e74c3c",
  },
};