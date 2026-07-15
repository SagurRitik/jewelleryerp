
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  Search, 
  FileText, 
  Download, 
  Trash2, 
  X, 
  Plus, 
  BookOpen, 
  Clock,
  Filter,
  CheckCircle,
  AlertCircle,
  Eye,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { getCatalogues, uploadCatalogue, deleteCatalogue } from "../api/catalogueApi";

const CataloguePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = ["admin", "superadmin"].includes(user?.role);
  
  const [catalogues, setCatalogues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Form State
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    category: "General",
    file: null,
    thumbnail: null
  });
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchCatalogues();
  }, []);

  const fetchCatalogues = async () => {
    try {
      setLoading(true);
      const res = await getCatalogues();
      if (res.data.success) {
        setCatalogues(res.data.catalogues);
      }
    } catch (error) {
      console.error("Fetch catalogues error:", error);
      toast.error("Failed to load catalogues");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, type) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast.error("File size too large. Max 50MB allowed.");
        return;
      }
      setUploadForm({ ...uploadForm, [type]: selectedFile });
      
      if (type === 'thumbnail') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setThumbnailPreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.title) {
      toast.error("Title and catalogue file are required");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("title", uploadForm.title);
      formData.append("description", uploadForm.description);
      formData.append("category", uploadForm.category);
      formData.append("file", uploadForm.file);
      if (uploadForm.thumbnail) {
        formData.append("thumbnail", uploadForm.thumbnail);
      }

      const res = await uploadCatalogue(formData);
      if (res.data.success) {
        toast.success("Catalogue uploaded successfully");
        setIsUploadModalOpen(false);
        setUploadForm({ title: "", description: "", category: "General", file: null, thumbnail: null });
        setThumbnailPreview(null);
        fetchCatalogues();
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload catalogue");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevent navigation
    if (!window.confirm("Are you sure you want to delete this catalogue?")) return;
    
    try {
      const res = await deleteCatalogue(id);
      if (res.data.success) {
        toast.success("Catalogue deleted");
        setCatalogues(catalogues.filter(c => c._id !== id));
      }
    } catch (error) {
      toast.error("Failed to delete catalogue");
    }
  };

  const filteredCatalogues = catalogues.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 min-h-screen bg-[#faf9f6]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 text-gray-600 hover:text-[#5A374F] hover:border-[#5A374F]/20 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#5A374F] mb-1">Product Catalogues</h1>
            <p className="text-gray-500">View and manage digital collections</p>
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search catalogues..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A374F]/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 bg-[#5A374F] text-white px-5 py-2 rounded-xl shadow-lg shadow-[#5A374F]/20 transition-all"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">New Catalogue</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Catalogues Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : filteredCatalogues.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredCatalogues.map((catalogue, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={catalogue._id}
              onClick={() => navigate(`/catalogues/${catalogue._id}`)}
              className="group relative bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_-12px_rgba(90,55,79,0.15)] transition-all duration-500 flex flex-col cursor-pointer border border-white/50"
            >
              {/* Card Header (Image/Preview Area) */}
              <div className="h-56 bg-[#f0f0f0] flex items-center justify-center relative overflow-hidden">
                {catalogue.thumbnailUrl ? (
                  <img 
                    src={catalogue.thumbnailUrl} 
                    alt={catalogue.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#5A374F]/5 to-[#5A374F]/10 flex items-center justify-center">
                    <div className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm transform group-hover:scale-110 transition-transform duration-500 border border-white/20">
                      <BookOpen size={40} className="text-[#5A374F]/40" />
                    </div>
                  </div>
                )}
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Overlay Badges */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-[10px] font-black text-[#5A374F] rounded-full uppercase tracking-[0.1em] shadow-sm border border-[#5A374F]/5">
                    {catalogue.category}
                  </span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center z-10">
                   <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 bg-white text-[#5A374F] px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.15em] flex items-center gap-3 transform translate-y-8 group-hover:translate-y-0 shadow-2xl">
                      <Eye size={18} />
                      Open Lookbook
                   </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6 flex-1 flex flex-col bg-white relative">
                <div className="mb-4">
                  <h3 className="text-lg font-black text-gray-900 mb-1.5 group-hover:text-[#5A374F] transition-colors line-clamp-1 tracking-tight">
                    {catalogue.title}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium line-clamp-2 leading-relaxed h-8 overflow-hidden">
                    {catalogue.description || "Digital luxury collection showcase."}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-5 border-t border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mb-0.5">Added On</span>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-black">
                      <Clock size={12} className="text-[#5A374F]/30" />
                      {new Date(catalogue.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDelete(e, catalogue._id)}
                        className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all border border-transparent hover:border-red-100"
                        title="Delete Catalogue"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    <a
                      href={catalogue.fileUrl}
                      onClick={(e) => e.stopPropagation()}
                      download
                      className="w-10 h-10 flex items-center justify-center bg-gray-50 text-[#5A374F] hover:bg-[#5A374F] hover:text-white rounded-full transition-all border border-gray-100 hover:border-[#5A374F] shadow-sm hover:shadow-lg"
                      title="Download PDF"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <FileText size={32} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-400">No catalogues found</h3>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or upload a new one.</p>
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute inset-0 bg-[#5A374F]/20 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#5A374F] text-white relative">
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <BookOpen size={120} />
                </div>

                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                    <Plus size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">New Lookbook</h2>
                    <p className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-bold">Catalogue Management</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsUploadModalOpen(false)}
                  className="p-3 hover:bg-white/10 rounded-full transition-all relative z-10 active:scale-90"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleUpload} className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-1">
                          Collection Title
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Summer 2026..."
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5A374F]/5 focus:bg-white focus:border-[#5A374F]/20 transition-all text-sm font-bold"
                          value={uploadForm.title}
                          onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-1">
                          Category
                        </label>
                        <select
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5A374F]/5 focus:bg-white focus:border-[#5A374F]/20 transition-all text-sm font-bold cursor-pointer"
                          value={uploadForm.category}
                          onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                        >
                          <option value="General">General Collection</option>
                          <option value="Seasonal">Seasonal</option>
                          <option value="Wedding">Bridal / Wedding</option>
                          <option value="High-Jewellery">High Jewellery</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-1">
                          Brief Story
                        </label>
                        <textarea
                          rows="4"
                          placeholder="Describe the collection..."
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5A374F]/5 focus:bg-white focus:border-[#5A374F]/20 transition-all resize-none text-sm font-medium"
                          value={uploadForm.description}
                          onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                        />
                      </div>
                   </div>

                   <div className="space-y-6">
                      {/* Thumbnail Upload */}
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-1">
                          Cover Image (JPG/PNG)
                        </label>
                        <div 
                          className={`relative border-2 border-dashed rounded-[2rem] h-32 flex flex-col items-center justify-center transition-all cursor-pointer hover:bg-gray-50 group overflow-hidden ${uploadForm.thumbnail ? 'border-[#5A374F] bg-[#5A374F]/5' : 'border-gray-100'}`}
                          onClick={() => document.getElementById('thumbnail-file').click()}
                        >
                          <input
                            type="file"
                            id="thumbnail-file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'thumbnail')}
                          />
                          {thumbnailPreview ? (
                            <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : uploadForm.thumbnail ? (
                            <div className="flex items-center gap-3 px-4">
                               <CheckCircle size={24} className="text-[#5A374F]" />
                               <span className="text-[10px] font-black text-[#5A374F] truncate max-w-[120px]">{uploadForm.thumbnail.name}</span>
                            </div>
                          ) : (
                            <>
                              <Plus size={20} className="text-gray-300 group-hover:scale-125 transition-transform" />
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">Add Cover</p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* PDF Upload */}
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-1">
                          Catalogue File (PDF)
                        </label>
                        <div 
                          className={`relative border-2 border-dashed rounded-[2rem] h-48 flex flex-col items-center justify-center transition-all cursor-pointer hover:bg-gray-50 group ${uploadForm.file ? 'border-[#5A374F] bg-[#5A374F]/5' : 'border-gray-100'}`}
                          onClick={() => document.getElementById('catalogue-file').click()}
                        >
                          <input
                            type="file"
                            id="catalogue-file"
                            className="hidden"
                            accept=".pdf,image/*"
                            onChange={(e) => handleFileChange(e, 'file')}
                          />
                          {uploadForm.file ? (
                            <div className="flex flex-col items-center gap-2">
                               <div className="w-12 h-12 bg-[#5A374F] rounded-2xl flex items-center justify-center text-white shadow-xl">
                                  <FileText size={24} />
                               </div>
                               <p className="text-[10px] font-black text-[#5A374F] text-center px-4 truncate max-w-[150px]">{uploadForm.file.name}</p>
                            </div>
                          ) : (
                            <>
                              <Upload size={24} className="text-gray-300 group-hover:-translate-y-2 transition-transform" />
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-3">Upload PDF</p>
                              <p className="text-[8px] text-gray-300 mt-1">Max: 50MB</p>
                            </>
                          )}
                        </div>
                      </div>
                   </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="flex-1 py-5 text-gray-400 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-gray-50 rounded-2xl transition-all"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="flex-[2] py-5 bg-[#5A374F] text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-[0_20px_40px_-10px_rgba(90,55,79,0.3)] hover:scale-[1.02] hover:shadow-[0_25px_50px_-10px_rgba(90,55,79,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        <span>Publish Collection</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(90, 55, 79, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default CataloguePage;
