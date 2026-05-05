

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/productApi";
import ProductForm from "../components/ProductForm";
import { deleteProductBySku } from "../api/productApi";
import { useModal } from "../context/ModalContext";
import { useProductList } from "../context/ProductListContext";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useModal();
  const { invalidateCache } = useProductList();


  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleDeleteProduct = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      // await deleteProductBySku(product.sku);
      await API.delete(`/${product._id}`);
      invalidateCache();
      await showAlert("Product deleted successfully");
      navigate("/"); // collection page
    } catch (error) {
      console.error(error);
      await showAlert("Failed to delete product");
    }
  };

  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/${id}`);
        setProduct(res.data.product);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to load product. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white px-8 py-6 rounded-xl border border-red-100 shadow-sm text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-gray-800 font-medium">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-purple-600 font-medium hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  /* ================= MAIN UI ================= */
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-6">

        {/* ===== Header ===== */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Edit Product
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-500">Editing SKU:</span>
              <span className="font-mono bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold border border-purple-200">
                {product.sku}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="
                px-5 py-2.5
                rounded-lg
                text-gray-600
                bg-white
                border border-gray-200
                font-medium
                text-sm
                hover:bg-gray-50 hover:text-gray-900
                transition-all duration-200
                shadow-sm
              "
            >
              Cancel
            </button>

            <button
              onClick={handleDeleteProduct}
              className="
                px-5 py-2.5
                rounded-lg
                text-red-600
                bg-red-50
                border border-red-100
                font-medium
                text-sm
                hover:bg-red-100 hover:border-red-200
                transition-all duration-200
                flex items-center gap-2
              "
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>

        {/* ===== Form Card ===== */}
        <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 p-8">
          <ProductForm
            existingProduct={product}
            onSuccess={() => {
              invalidateCache();
              navigate("/");
            }}
          />
        </div>

      </div>
    </div>
  );
}