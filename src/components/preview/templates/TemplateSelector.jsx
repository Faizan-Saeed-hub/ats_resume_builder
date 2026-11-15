import React from "react";
import { MdViewQuilt, MdArticle, MdBusiness, MdPalette } from "react-icons/md";

const templates = [
  {
    id: "modern-professional",
    name: "Modern Professional",
    description: "Original 2-column balanced layout (Default)",
    icon: <MdViewQuilt />,
    isDefault: true,
  },
  {
    id: "minimal-ats",
    name: "Minimal ATS-Friendly",
    description: "High-parseability single column",
    icon: <MdArticle />,
  },
  {
    id: "corporate-executive",
    name: "Corporate Executive",
    description: "Header banner & leadership style",
    icon: <MdBusiness />,
  },
  {
    id: "creative-modern",
    name: "Creative Modern",
    description: "Left accent column & modern aesthetic",
    icon: <MdPalette />,
  },
];

const TemplateSelector = ({ selectedTemplate, onSelectTemplate }) => {
  const current = selectedTemplate || "modern-professional";

  return (
    <div className="exclude-print mb-4 p-3 bg-white/90 backdrop-blur rounded-xl border border-blue-200/80 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#172554] flex items-center gap-1.5">
          <MdViewQuilt className="text-[#2563EB] text-sm" />
          CV Template Gallery
        </span>
        <span className="text-[11px] font-medium text-gray-500">
          Switch anytime without losing data
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {templates.map((t) => {
          const isActive = current === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTemplate(t.id)}
              className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all text-xs font-medium border ${
                isActive
                  ? "bg-[#2563EB] text-white border-[#2563EB] shadow-md scale-[1.02]"
                  : "bg-gray-50 text-gray-700 hover:bg-blue-50 border-gray-200 hover:border-blue-300"
              }`}
            >
              <span className={`text-base ${isActive ? "text-white" : "text-[#2563EB]"}`}>
                {t.icon}
              </span>
              <div className="overflow-hidden">
                <div className="font-semibold truncate">{t.name}</div>
                {t.isDefault && (
                  <span
                    className={`text-[9px] uppercase font-bold tracking-wider px-1 py-0.2 rounded ${
                      isActive ? "bg-white/20 text-white" : "bg-blue-100 text-[#2563EB]"
                    }`}
                  >
                    Default
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TemplateSelector;

