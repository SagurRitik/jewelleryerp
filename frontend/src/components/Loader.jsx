export default function Loader({ text = "Loading..." }) {
  return (
    <div className="flex justify-center items-center py-20 bg-white">
      {/* bg-[#5A374F] */}
      <div className="flex gap-3 items-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
        <span className="text-gray-600">{text}</span>
      </div>
    </div>
  );
}
