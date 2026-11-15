import React from "react";
import { BsFillArrowRightCircleFill, BsFillArrowLeftCircleFill } from "react-icons/bs";

const FormCloseOpenBtn = ({ formClose, setFormClose }) => {
  return (
    <button
      type="button"
      aria-label={formClose ? "Show Editor Panel" : "Show Live Preview Only"}
      title={formClose ? "Show Editor Panel (Split View)" : "Show Live Preview Only (Full Screen)"}
      className="exclude-print fixed bottom-5 left-6 md:left-8 z-40 font-bold rounded-full bg-white text-[#2563EB] shadow-2xl border-2 border-white transition-all duration-200 hover:scale-110 active:scale-95 hover:text-blue-700 hover:shadow-2xl flex items-center justify-center p-0.5 cursor-pointer group"
      onClick={() => setFormClose(!formClose)}
    >
      {formClose ? (
        <BsFillArrowRightCircleFill className="w-10 h-10 text-[#2563EB] group-hover:text-blue-700 transition-colors" />
      ) : (
        <BsFillArrowLeftCircleFill className="w-10 h-10 text-[#2563EB] group-hover:text-blue-700 transition-colors" />
      )}
    </button>
  );
};

export default FormCloseOpenBtn;
