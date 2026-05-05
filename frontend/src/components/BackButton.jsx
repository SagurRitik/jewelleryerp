// import { useNavigate } from "react-router-dom";

// export default function BackButton() {
//   const navigate = useNavigate();

//   return (
//     <div className="mt-0 px-4 py-2 flex justify-start items-center">
//       <button
//         onClick={() => {
//           if (window.history.length > 1) {
//             navigate(-1);
//           } else {
//             navigate("/");
//           }
//         }}
//         className="
//           inline-flex items-center gap-1

//           text-sm font-medium
//           text-gray-600

//           hover:text-black

//           transition-colors duration-200
//         "
//       >
//         <span>←</span>
//         <span>Back</span>
//       </button>
//     </div>
//   );
// }


// import { useNavigate } from "react-router-dom";

// export default function BackButton() {
//   const navigate = useNavigate();

//   const handleBack = () => {
//     if (window.history.length > 1) {
//       navigate(-1);
//     } else {
//       navigate("/");
//     }
//   };

//   return (
//     <div className="mt-0 px-4 py-2 flex justify-start items-center">
//       <button
//         onClick={handleBack}
//         className="
//           group inline-flex items-center gap-1

//           text-sm font-medium
//           text-[#8A8178]

//           transition-all duration-300 ease-out

//           hover:text-[#6B3151]
//         "
//       >
//         {/* ⬅️ Arrow */}
//         <span
//           className="
//             transition-all duration-300
//             group-hover:-translate-x-1
//             group-active:-translate-x-2
//           "
//         >
//           ←
//         </span>

//         {/* Text */}
//         <span className="relative">
//           Back

//           {/* ✨ underline animation */}
//           <span
//             className="
//               absolute left-0 -bottom-0.5 h-[1px] w-0
//               bg-[#D4AF37]
//               transition-all duration-300
//               group-hover:w-full
//             "
//           />
//         </span>
//       </button>
//     </div>
//   );
// }


// import { useNavigate } from "react-router-dom";

// export default function BackButton() {
//   const navigate = useNavigate();

//   const handleBack = () => {
//     if (window.history.length > 1) {
//       navigate(-1);
//     } else {
//       navigate("/");
//     }
//   };

//   return (
//     <div className="px-4 py-2 flex justify-start items-center">
//       <button
//         onClick={handleBack}
//         className="
//           group flex items-center gap-3

//           text-[#8B7355]
//           hover:text-[#2D2D2D]

//           transition-all duration-300

//           py-2
//         "
//       >
//         {/* 🔲 Icon Box */}
//         <div
//           className="
//             p-1.5
//             border border-stone-200

//             transition-all duration-300

//             group-hover:border-[#A0826D]
//             group-hover:bg-[#FAF8F5]
//           "
//         >
//           <svg
//             className="
//               w-[14px] h-[14px]

//               transition-transform duration-300
//               group-hover:-translate-x-1
//             "
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             viewBox="0 0 24 24"
//           >
//             <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
//           </svg>
//         </div>

//         {/* 🔤 Text */}
//         <span
//           className="
//             text-[10px]
//             font-semibold
//             tracking-widest
//             uppercase

//             transition-all duration-300
//           "
//         >
//           Back
//         </span>
//       </button>
//     </div>
//   );
// }


import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate("/");
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="mb-8 py-4 px-3 flex justify-start items-center">
      <button
        onClick={handleBack}
        className="
          group inline-flex items-center

          text-sm font-serif
          text-gray-500

          transition-all duration-300

          hover:text-[#3A332C]
        "
      >
        {/* ⬅️ Icon */}
        <svg
          className="
            w-4 h-4 mr-2

            transition-transform duration-300
            group-hover:-translate-x-1
          "
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M15 19l-7-7 7-7"
          />
        </svg>

        {/* Text */}
        <span className="relative">
          Back

          {/* ✨ subtle underline */}
          <span
            className="
              absolute left-0 -bottom-0.5 h-[1px] w-0
              bg-[#D4AF37]
              transition-all duration-300
              group-hover:w-full
            "
          />
        </span>
      </button>
    </div>
  );
}