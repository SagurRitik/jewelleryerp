
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Download, 
  Maximize2, 
  Minimize2, 
  ExternalLink,
  FileText,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { getCatalogues } from "../api/catalogueApi";

const CatalogueViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [catalogue, setCatalogue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetchCatalogueDetail();
  }, [id]);

  const fetchCatalogueDetail = async () => {
    try {
      setLoading(true);
      const res = await getCatalogues();
      if (res.data.success) {
        const found = res.data.catalogues.find(c => c._id === id);
        setCatalogue(found);
      }
    } catch (error) {
      console.error("Error fetching catalogue:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const elem = document.getElementById("pdf-container");
    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 size={40} className="text-[#5A374F]" />
        </motion.div>
      </div>
    );
  }

  if (!catalogue) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold text-gray-400">Catalogue not found</h2>
        <button 
          onClick={() => navigate("/catalogues")}
          className="mt-4 text-[#5A374F] font-bold underline"
        >
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#1a1a1a]">
      {/* Viewer Header - Hidden in native fullscreen if elem is pdf-container */}
      {!isFullscreen && (
        <div className="bg-white px-6 py-3 flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/catalogues")}
              className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-600"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-[#5A374F] leading-none">{catalogue.title}</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                {catalogue.category} • {new Date(catalogue.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-500 transition-all"
              title="Toggle Fullscreen"
            >
              <Maximize2 size={20} />
            </button>
            
            <a
              href={catalogue.fileUrl}
              download
              className="flex items-center gap-2 bg-[#5A374F] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[#5A374F]/20"
            >
              <Download size={16} />
              Download
            </a>
            
            <a
              href={catalogue.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-500 transition-all"
              title="Open in New Tab"
            >
              <ExternalLink size={20} />
            </a>
          </div>
        </div>
      )}

      {/* Viewer Content */}
      <div id="pdf-container" className="flex-1 bg-[#2a2a2a] relative overflow-hidden flex flex-col items-center">
        {/* Floating Back Button for Fullscreen */}
        {isFullscreen && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-6 left-6 z-[100] flex gap-3"
          >
            <button 
              onClick={toggleFullscreen}
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-3 rounded-2xl border border-white/10 transition-all flex items-center gap-2 shadow-2xl"
            >
              <Minimize2 size={20} />
              <span className="text-[10px] font-bold uppercase tracking-widest pr-1">Exit Fullscreen</span>
            </button>
            <button 
              onClick={() => {
                if (document.exitFullscreen) document.exitFullscreen();
                navigate("/catalogues");
              }}
              className="bg-[#5A374F] text-white p-3 rounded-2xl transition-all flex items-center gap-2 shadow-2xl"
            >
              <ChevronLeft size={20} />
              <span className="text-[10px] font-bold uppercase tracking-widest pr-1">Back to Catalogues</span>
            </button>
          </motion.div>
        )}

        <iframe
          src={`${catalogue.fileUrl}#toolbar=1&navpanes=1&view=FitH`}
          className="w-full h-full border-none"
          title={catalogue.title}
        />
        
        {/* Navigation Instructions (Overlay for a few seconds) */}
        {!isFullscreen && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl text-white/80 text-xs font-medium pointer-events-none"
          >
            Use browser controls to zoom and flip pages
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CatalogueViewPage;
