import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
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