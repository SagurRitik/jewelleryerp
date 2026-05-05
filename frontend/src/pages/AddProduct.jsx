
import ProductForm from "../components/ProductForm";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import { useProductList } from "../context/ProductListContext";

export default function AddProduct() {
  const navigate = useNavigate();
  const { invalidateCache } = useProductList();

  return (
    <div className="min-h-screen bg-[#F5F3F0]">

    <BackButton />
   
      <div className="max-w-5xl mx-auto px-6 ">
             
    
       
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          
          <div>

            
           
<h1 className="text-3xl font-bold text-#5A374F flex items-center gap-3 pl-4 border-l-4 border-#5A374F rounded-sm">
  Add Product
</h1>
            <p className="text-sm text-gray-500 mt-2 pl-5">
              Create a new item in your inventory
            </p>
          </div>


          <button
            onClick={() => navigate("/")}
            className="
              px-5 py-2.5
              rounded-lg
              text-gray-600
              bg-[#F5F3F0]
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
        </div>

        {/* ===== Form Card ===== */}
         <div className="">
          <ProductForm onSuccess={() => {
            invalidateCache();
            navigate("/");
          }} />
        </div>

      </div>
    </div>
  );
}