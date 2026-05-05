import { useState } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";

const INQUIRY_API = "/inquiries";

export default function BulkUploadInquiries() {
  const [excel, setExcel] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const bulkUpload = async () => {
    if (!excel) return alert("Please select Excel file");

    const fd = new FormData();
    fd.append("excel", excel);

    try {
      setLoading(true);
      setMessage("");

      const res = await API.post(`${INQUIRY_API}/bulk`, fd);
      setReport(res.data);
      setMessage(`🚀 ${res.data.count} Inquiries uploaded successfully!`);
    } catch (e) {
      setMessage(e.response?.data?.message || "❌ Bulk upload failed");
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = message.includes("🚀");

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        * {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .fade-in {
          animation: slideIn 0.6s ease-out;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        input[type="file"] {
          display: none;
        }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Bulk Enquiry Upload</h1>
          <p style={styles.subtitle}>Import multiple enquiries at once using an Excel spreadsheet</p>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.uploadSection}>
          <div style={styles.fileInputWrapper}>
            <label htmlFor="excel-input" style={styles.fileLabel}>
              <div style={styles.fileIconBox}>📊</div>
              <h3 style={styles.fileName}>Enquiry Spreadsheet</h3>
              <p style={styles.fileDescription}>Customer data, products, and notes (.xlsx)</p>
              {excel && <p style={styles.selectedFile}>✓ {excel.name}</p>}
            </label>
            <input
              id="excel-input"
              type="file"
              accept=".xlsx"
              onChange={e => setExcel(e.target.files[0])}
            />
          </div>

          <div style={styles.actions}>
            <button
              onClick={bulkUpload}
              disabled={loading || !excel}
              style={{
                ...styles.button,
                ...(loading || !excel ? styles.buttonDisabled : styles.buttonPrimary),
              }}
            >
              {loading ? "Uploading..." : "🚀 Upload Inquiries"}
            </button>
            
            <button
              onClick={() => navigate("/inquiries")}
              style={{ ...styles.button, ...styles.buttonSecondary }}
            >
              Back to Enquiries
            </button>
          </div>

          {message && (
            <div style={{ ...styles.messageBox, ...(isSuccess ? styles.messageSuccess : styles.messageError) }}>
              {message}
            </div>
          )}

          {report && (
            <div style={styles.reportSection}>
              <h2 style={styles.reportTitle}>Upload Result</h2>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statNumber}>{report.count}</div>
                  <div style={styles.statLabel}>Uploaded</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statNumber}>{report.skipped}</div>
                  <div style={styles.statLabel}>Skipped (Invalid)</div>
                </div>
              </div>
            </div>
          )}
          
          <div style={styles.guidelines}>
            <h3 style={styles.guideTitle}>Excel Format Guidelines</h3>
            <ul style={styles.guideList}>
              <li>Required Columns: <strong>CustomerName</strong>, <strong>Mobile</strong></li>
              <li>Optional: Email, Address, Budget, ProductType, Metal, Stone, Notes, Status, Priority, Salesperson, Source</li>
              <li>Status options: NEW, CONTACTED, FOLLOW_UP, INTERESTED, NEGOTIATION, NOT_INTERESTED, CONVERTED, CLOSED</li>
              <li>Priority options: LOW, MEDIUM, HIGH</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#f8fafc",
    minHeight: "100vh",
    paddingBottom: 60,
  },
  header: {
    background: "#6B2E4A",
    color: "#fff",
    padding: "60px 24px",
    textAlign: "center",
  },
  headerContent: {
    maxWidth: 800,
    margin: "0 auto",
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    margin: "0 0 12px 0",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.9,
  },
  mainContent: {
    maxWidth: 800,
    margin: "-40px auto 0",
    padding: "0 24px",
  },
  uploadSection: {
    background: "#fff",
    borderRadius: 16,
    padding: 32,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  fileInputWrapper: {
    marginBottom: 24,
  },
  fileLabel: {
    display: "block",
    padding: "40px 20px",
    border: "2px dashed #e2e8f0",
    borderRadius: 12,
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    background: "#f1f5f9",
  },
  fileIconBox: {
    fontSize: 40,
    marginBottom: 16,
  },
  fileName: {
    fontSize: 18,
    fontWeight: 600,
    color: "#1e293b",
    margin: "0 0 8px 0",
  },
  fileDescription: {
    fontSize: 14,
    color: "#64748b",
    margin: 0,
  },
  selectedFile: {
    marginTop: 16,
    color: "#10b981",
    fontWeight: 600,
    fontSize: 14,
  },
  actions: {
    display: "flex",
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    padding: "12px 24px",
    borderRadius: 8,
    border: "none",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  buttonPrimary: {
    background: "#6B2E4A",
    color: "#fff",
  },
  buttonSecondary: {
    background: "#e2e8f0",
    color: "#475569",
  },
  buttonDisabled: {
    background: "#cbd5e1",
    color: "#94a3b8",
    cursor: "not-allowed",
  },
  messageBox: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    fontSize: 14,
    fontWeight: 500,
    textAlign: "center",
  },
  messageSuccess: {
    background: "#ecfdf5",
    color: "#065f46",
    border: "1px solid #d1fae5",
  },
  messageError: {
    background: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fee2e2",
  },
  reportSection: {
    marginTop: 32,
    paddingTop: 32,
    borderTop: "1px solid #e2e8f0",
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: 700,
    margin: "0 0 20px 0",
    color: "#1e293b",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    background: "#f8fafc",
    padding: 20,
    borderRadius: 12,
    textAlign: "center",
    border: "1px solid #e2e8f0",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 800,
    color: "#6B2E4A",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginTop: 4,
  },
  guidelines: {
    background: "#fff9f0",
    padding: 20,
    borderRadius: 12,
    border: "1px solid #ffeeba",
  },
  guideTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#856404",
    margin: "0 0 12px 0",
  },
  guideList: {
    margin: 0,
    paddingLeft: 20,
    fontSize: 13,
    color: "#856404",
    lineHeight: 1.6,
  },
};
