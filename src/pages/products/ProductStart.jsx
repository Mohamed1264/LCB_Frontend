import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLayout } from "../../hooks/useLayout";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { Package, Truck, ArrowRight } from "lucide-react";

const ProductStart = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentLang, isRTL, getSidebarPadding } = useLayout();

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      <Sidebar />
      <Navbar />
      <div
        className={`pt-24 transition-all duration-300 ${getSidebarPadding()}`}
      >
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("product_start_title")}
            </h1>
            <p className="text-gray-600 mb-8">
              {t("product_start_subtitle")}
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Add Shipment Button */}
              <button
                onClick={() => navigate("/shipments/create")}
                className="group relative p-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-white text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <Truck className="w-12 h-12" />
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {t("product_start_add_shipment")}
                </h3>
                <p className="text-orange-50 text-sm">
                  {t("product_start_add_shipment_desc")}
                </p>
              </button>

              {/* Skip & Go to Products Button */}
              <button
                onClick={() => navigate("/products/create")}
                className="group relative p-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-white text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <Package className="w-12 h-12" />
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {t("product_start_skip")}
                </h3>
                <p className="text-gray-300 text-sm">
                  {t("product_start_skip_desc")}
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductStart;
