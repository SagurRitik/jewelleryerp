import { memo } from "react";
import { TrendingUp, Sparkles } from "lucide-react";
import { useRates } from "../context/RatesContext";
import { motion } from "framer-motion";

const MetalRateCards = memo(function MetalRateCards() {
  const { rates, loading } = useRates();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  const shimmerVariants = {
    animate: {
      x: ["-100%", "200%"],
      transition: {
        repeat: Infinity,
        duration: 2.5,
        ease: "linear",
        repeatDelay: 1
      }
    }
  };

  if (loading || !rates) {
    return (
      <div className="flex gap-4 px-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[52px] w-[150px] lg:w-[170px] rounded-xl bg-white/5 border border-white/10 animate-pulse backdrop-blur-sm"
          />
        ))}
      </div>
    );
  }

  const metals = [
    {
      name: "Gold 24K",
      value: rates.base.gold24KT,
      accent: "from-yellow-400 to-yellow-200",
      icon: "text-yellow-400",
      bgClass: "bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/30",
    },
    {
      name: "Silver 999",
      value: rates.base.silver999,
      accent: "from-gray-300 to-gray-100",
      icon: "text-gray-300",
      bgClass: "bg-gradient-to-br from-gray-400/10 to-transparent border-gray-400/30",
    },
    {
      name: "Plat 950",
      value: rates.base.platinum950,
      accent: "from-indigo-300 to-purple-200",
      icon: "text-indigo-300",
      bgClass: "bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/30",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-3 sm:overflow-x-auto w-full px-0.5 sm:px-1"
    >
      {metals.map((metal, i) => (
        <motion.div
          key={i}
          variants={itemVariants}
          className={`relative overflow-hidden flex items-center justify-between px-2 sm:px-3 md:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl border backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.15)] ${metal.bgClass} hover:border-white/50 transition-colors duration-300 group min-w-0 sm:min-w-[140px] md:min-w-[160px]`}
        >
          {/* Shimmer effect inside the card */}
          <motion.div
            variants={shimmerVariants}
            animate="animate"
            className="absolute top-0 bottom-0 w-[50%] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]"
          />

          <div className="relative z-10 leading-tight min-w-0 flex-1">
            <div className="flex items-center gap-1 mb-0.5 sm:mb-1">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              >
                <Sparkles size={9} className={`${metal.icon} opacity-80 shrink-0`} />
              </motion.div>
              <p className="text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-white/90 truncate">
                {metal.name}
              </p>
            </div>

            <p className={`text-xs sm:text-sm md:text-base font-extrabold tracking-tight bg-gradient-to-r ${metal.accent} bg-clip-text text-transparent drop-shadow-sm whitespace-nowrap`}>
              ₹{Number(metal.value || 0).toLocaleString("en-IN")}
              <span className="text-[8px] sm:text-[9px] md:text-[10px] text-white/50 ml-0.5 font-medium tracking-normal drop-shadow-none">/gm</span>
            </p>
          </div>

          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="hidden sm:flex relative z-10 flex-col items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-black/30 border border-white/10 group-hover:scale-110 group-hover:bg-black/50 transition-all duration-300 ml-1.5 shrink-0"
          >
            <TrendingUp size={11} className={`${metal.icon}`} strokeWidth={2.5} />
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
});

export default MetalRateCards;
