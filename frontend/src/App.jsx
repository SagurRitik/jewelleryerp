import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ModalProvider } from "./context/ModalContext";
import { ProductListProvider } from "./context/ProductListContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

// COMPONENTS
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import PrivateRoute from "./components/PrivateRoute";
import { Toaster } from "sonner";

// AUTH PAGES
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import SetPassword from "./pages/admin/SetPassword.jsx";

/* PRODUCT PAGES */
import Products from "./pages/Products";
import InventoryManagement from "./pages/InventoryManagement.jsx";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import SingleProduct from "./pages/SingleProduct";

/* ORDER PAGES */
import Orders from "./pages/Orders";
import AddOrder from "./pages/AddOrder";
import EditOrder from "./pages/EditOrder";
import OrderDetails from "./pages/OrderDetails";
import CompleteOrder from "./pages/CompleteOrder";
import OrderSlip from "./pages/OrderSlip";

/* INVOICE & POS */
import InvoicePreview from "./pages/InvoicePreview";
import InvoicePage from "./pages/InvoicePage.jsx";

/* REPORTS */
import OrderClosingReport from "./pages/OrderClosingReport.jsx";
import DailySalesClosing from "./pages/DailySalesClosing.jsx";

/* UTILS */
import JewelleryCalculator from "./components/JewelleryCalculator";
import CartPage from "./pages/CartPage";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutPage from "./pages/checkout/CheckoutPage.jsx";
import RatesPage from "./pages/admin/RatesPage.jsx";
import SalesInvoices from "./pages/SalesInvoices.jsx";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import BulkUploadProducts from "./pages/bulkUpload/BulkUploadProducts.jsx";
import CataloguePage from "./pages/CataloguePage.jsx";
import CatalogueViewPage from "./pages/CatalogueViewPage.jsx";



/* ADMIN – RATE MASTERS */
import DiamondRateList from "./pages/admin/diamond/DiamondRateList.jsx";
import DiamondRateForm from "./pages/admin/diamond-rates/DiamondRateForm.jsx";
import StoneRateForm from "./pages/admin/stone-rates/StoneRateForm.jsx";
import StoneRateList from "./pages/admin/stone/StoneRateList.jsx";
import CreateUser from "./pages/admin/CreateUser.jsx";
import UserManagement from "./pages/admin/UserManagement.jsx";
import LandingPage from "./pages/LandingPage.jsx";

/* LEDGER */
import MetalLedgerPage from "./pages/MetalLedgerPage.jsx";
import MetalManualCreditPage from "./pages/MetalManualCreditPage.jsx";
import MetalDebitPage from "./pages/MetalDebitPage.jsx";
import MetalStockPurityPage from "./pages/MetalStockPurityPage.jsx";

/* INVOICES */
import InvoiceDetails from "./pages/sales/InvoiceDetails.jsx";

/* RETURNS & CREDIT NOTES */
import ReturnList from "./pages/returns/ReturnList.jsx";
import CreateReturn from "./pages/returns/CreateReturn.jsx";
import ReturnDetails from "./pages/returns/ReturnDetails.jsx";
import CreditNoteList from "./pages/creditNotes/CreditNoteList.jsx";

/* OTHER PAGES */
import ManualBillingForm from "./pages/ManualBillingForm.jsx";
import ExpensePage from "./pages/ExpensePage.jsx";
import AddExpensePage from "./pages/AddExpensePage.jsx";
import InquiryList from "./pages/InquiryListPage.jsx";
import AddInquiryPage from "./pages/AddInquiryPage.jsx";
import InquiryDetailPage from "./pages/InquiryDetailPage.jsx";
import BulkUploadInquiries from "./pages/bulkUpload/BulkUploadInquiries.jsx";

/* DASHBOARD REPORTS */
import SalesBreakdown from "./pages/Dashboard/SalesBreakdown.jsx";
import MetalReportPage from "./pages/Dashboard/MetalReportPage.jsx";
import DiamondReportPage from "./pages/Dashboard/DiamondReportPage.jsx";
import SalesReportPage from "./pages/Dashboard/SalesReportPage.jsx";
import StonesReportPage from "./pages/Dashboard/StonesReportPage.jsx";
import GSTDashboard from "./pages/Dashboard/GSTDashboard.jsx";
import DeadStockReportPage from "./pages/Dashboard/DeadStockReportPage.jsx";
import BarcodeTagPrinter from "./pages/BarcodeTagPrinter.jsx";

/* DIAMOND STOCK */
import DiamondStockPage from "./pages/DiamondStockPage.jsx";
import AddDiamondStock from "./pages/AddDiamondStock.jsx";
import DiamondDetailsPage from "./pages/DiamondDetailsPage.jsx";

/* SUPPLIERS */
import SupplierList from "./pages/suppliers/SupplierList.jsx";
import SupplierForm from "./pages/suppliers/SupplierForm.jsx";
import SupplierLedger from "./pages/suppliers/SupplierLedger.jsx";
import PurchaseEntry from "./pages/suppliers/PurchaseEntry.jsx";

/* QUOTATION / ESTIMATES */
import QuotationPage from "./pages/QuotationPage";
import QuotationBuilder from "./components/QuotationBuilder";
import EstimateList from "./pages/quotation/EstimateList";
import EstimateBuilder from "./pages/quotation/EstimateBuilder";
import EstimatePreview from "./pages/quotation/EstimatePreview";

/* ================= MAIN LAYOUT WRAPPER ================= */
function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col w-full m-0 p-0 relative transition-colors duration-300 ${
      isDark ? "bg-[#121212] text-[#e0e0e0]" : "bg-[#faf9f6] text-[#1a1a1a]"
    }`}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Navbar toggleSidebar={() => setIsSidebarOpen(true)} />
      <main className="flex-1 w-full m-0 p-0">
        <Outlet />
      </main>
    </div>
  );
}

/* ================= APP COMPONENT ================= */
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ModalProvider>
          {/* ProductListProvider wraps Router so product cache persists across ALL route changes */}
          <ProductListProvider>
            <Toaster richColors position="top-right" />
            <Router>
              <Routes>
                {/* ... existing routes ... */}
                <Route path="/verify-otp" element={<VerifyEmail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/set-password/:token" element={<SetPassword />} />

                {/* ================= PROTECTED ROUTES (with Navbar) ================= */}
                <Route element={<MainLayout />}>

                  {/* Salesperson + Admin + Superadmin */}
                  <Route element={<PrivateRoute allowedRoles={["superadmin", "admin", "salesperson"]} />}>
                    <Route path="/" element={<Products />} />
                    <Route path="/inventory-management" element={<InventoryManagement />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/product/:id" element={<SingleProduct />} />
                    <Route path="/LandingPage" element={<LandingPage />} />

                    {/* Cart & Orders */}
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout-success" element={<CheckoutSuccess />} />
                    <Route path="/checkout/calculate" element={<CheckoutPage />} />
                    <Route path="/add" element={<AddProduct />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/orders/new" element={<AddOrder />} />
                    <Route path="/orders/:id" element={<OrderDetails />} />
                    <Route path="/orders/:id/edit" element={<EditOrder />} />
                    <Route path="/orders/:id/complete" element={<CompleteOrder />} />
                    <Route path="/orders/:id/slip" element={<OrderSlip />} />

                    {/* Invoices */}
                    <Route path="/sales-invoices" element={<SalesInvoices />} />

                    {/* Tools */}
                    <Route path="/calculator" element={<JewelleryCalculator />} />

                    {/* Edit/rates (shared) */}
                    <Route path="/edit/:id" element={<EditProduct />} />
                    <Route path="/admin/diamond-rates" element={<DiamondRateList />} />
                    <Route path="/admin/diamond-rates/new" element={<DiamondRateForm />} />
                    <Route path="/admin/diamond-rates/:id/edit" element={<DiamondRateForm />} />
                    <Route path="/admin/stone-rates" element={<StoneRateList />} />
                    <Route path="/admin/stone-rates/new" element={<StoneRateForm />} />
                    <Route path="/admin/stone-rates/:id/edit" element={<StoneRateForm />} />

                    {/* Reports */}
                    <Route path="/reports/sales-closing" element={<DailySalesClosing />} />
                    <Route path="/reports/dead-stock" element={<DeadStockReportPage />} />
                    <Route path="/orders/closing-report" element={<OrderClosingReport />} />
                    <Route path="/catalogues" element={<CataloguePage />} />
                    <Route path="/catalogues/:id" element={<CatalogueViewPage />} />
                  </Route>



                  {/* Admin + Superadmin only */}
                  <Route element={<PrivateRoute allowedRoles={["superadmin", "admin"]} />}>
                    <Route path="/products/bulk-upload" element={<BulkUploadProducts />} />
                    <Route path="/admin/users" element={<UserManagement />} />
                    <Route path="/admin/users/new" element={<CreateUser />} />
                    <Route path="/rates" element={<RatesPage />} />
                    <Route path="/metal-ledger" element={<MetalLedgerPage />} />
                    <Route path="/metal-credit" element={<MetalManualCreditPage />} />
                    <Route path="/metal-debit" element={<MetalDebitPage />} />
                    <Route path="/metal-stock" element={<MetalStockPurityPage />} />
                    <Route path="/gst-dashboard" element={<GSTDashboard />} />
                    <Route path="/invoices/:id" element={<InvoiceDetails />} />
                    <Route path="/returns" element={<ReturnList />} />
                    <Route path="/returns/create/:invoiceId" element={<CreateReturn />} />
                    <Route path="/returns/:id" element={<ReturnDetails />} />
                    <Route path="/credit-notes" element={<CreditNoteList />} />
                    <Route path="/manual-billing" element={<ManualBillingForm />} />
                    <Route path="/expenses" element={<ExpensePage />} />
                    <Route path="/expenses/new" element={<AddExpensePage />} />
                    <Route path="/expenses/edit/:id" element={<AddExpensePage />} />
                    <Route path="/inquiries" element={<InquiryList />} />
                    <Route path="/inquiries/bulk" element={<BulkUploadInquiries />} />
                    <Route path="/inquiries/new" element={<AddInquiryPage />} />
                    <Route path="/inquiries/:id" element={<InquiryDetailPage />} />
                    <Route path="/sales-breakdown" element={<SalesBreakdown />} />
                    <Route path="/reports/metals" element={<MetalReportPage />} />
                    <Route path="/reports/diamonds" element={<DiamondReportPage />} />
                    <Route path="/reports/stones" element={<StonesReportPage />} />
                    <Route path="/reports/sales" element={<SalesReportPage />} />
                    <Route path="/reports/dead-stock" element={<DeadStockReportPage />} />
                    <Route path="/barcode-print" element={<BarcodeTagPrinter />} />
                    <Route path="/suppliers" element={<SupplierList />} />
                    <Route path="/suppliers/new" element={<SupplierForm />} />
                    <Route path="/suppliers/edit/:id" element={<SupplierForm />} />
                    <Route path="/suppliers/:id" element={<SupplierLedger />} />
                    <Route path="/purchases/new" element={<PurchaseEntry />} />
                    <Route path="/quotation" element={<QuotationPage />} />
                    {/* ===== ESTIMATES ===== */}
                    <Route path="/quotations" element={<EstimateList />} />
                    <Route path="/quotations/new" element={<EstimateBuilder />} />
                    <Route path="/quotations/:id" element={<EstimatePreview />} />
                    <Route path="/quotations/:id/edit" element={<EstimateBuilder />} />

                    {/* DIAMOND STOCK */}
                    <Route path="/diamonds" element={<DiamondStockPage />} />
                    <Route path="/diamonds/new" element={<AddDiamondStock />} />
                    <Route path="/diamonds/edit/:id" element={<AddDiamondStock />} />
                    <Route path="/diamonds/:id" element={<DiamondDetailsPage />} />
                  </Route>

                </Route>
                {/* END MAIN LAYOUT */}

                {/* ================= STANDALONE PRINT ROUTES (no Navbar) ================= */}
                <Route element={<PrivateRoute allowedRoles={["superadmin", "admin", "salesperson"]} />}>
                  <Route path="/invoice/:invoiceId" element={<InvoicePreview />} />
                  <Route path="/invoice/:id" element={<InvoicePage />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<div className="p-10 text-center text-red-500 font-bold">404 - Page Not Found</div>} />
              </Routes>
            </Router>
          </ProductListProvider>
        </ModalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
