import React from "react";
import { useTranslation } from "react-i18next";
import { useLayout } from "../../hooks/useLayout";

// 1️⃣ Spinner بسيط للأجزاء الصغيرة
export const Spinner = ({ size = "md", color = "orange" }) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-4",
    lg: "w-12 h-12 border-4",
  };

  const colorClasses = {
    orange: "border-orange-500/20 border-t-orange-600",
    blue: "border-blue-500/20 border-t-blue-600",
    white: "border-white/20 border-t-white",
  };

  return (
    <div
      className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}
    />
  );
};

// 2️⃣ PageLoader للشاشات الكاملة
export const PageLoader = () => {
  const { t } = useTranslation(); // ✅ خاص يكون هنا
  const { currentLang } = useLayout();

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[999] flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center">
        {/* الدائرة المتحركة */}
        <div className="w-24 h-24 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
        
        {/* النص أو اللوغو في المنتصف */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-black text-orange-600">LCB</span>
        </div>
      </div>
      
      <p className="mt-4 text-gray-500 font-bold animate-pulse tracking-widest text-sm"
      dir={currentLang === "ar" ? "rtl" : "ltr"}
      >
        {t("loading")}
      </p>
    </div>
  );
};

// التصدير الافتراضي
export default PageLoader;