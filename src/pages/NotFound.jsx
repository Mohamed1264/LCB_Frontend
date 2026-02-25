import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowRight, AlertCircle } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans" dir="rtl">
      <div className="max-w-md w-full text-center">
        {/* Illustration Section */}
        <div className="relative mb-8">
          <div className="text-9xl font-black text-orange-600/10 select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="bg-white p-6 rounded-3xl shadow-xl shadow-orange-100/50 border border-orange-50">
                <AlertCircle size={64} className="text-orange-600 animate-pulse" />
             </div>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-3xl font-black text-gray-800 mb-3">عذراً، الصفحة غير موجودة!</h1>
        <p className="text-gray-500 mb-10 leading-relaxed">
          يبدو أن الرابط الذي حاولت الوصول إليه غير صحيح أو تم نقله لمكان آخر. لا تقلق، يمكنك العودة دائماً.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-200"
          >
            <Home size={20} />
            العودة للرئيسية
          </button>
          
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 text-gray-500 hover:text-orange-600 font-bold py-3 transition-colors"
          >
            الرجوع للخلف
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;