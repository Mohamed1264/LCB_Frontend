import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMe } from "../../hooks/useAuth";
import { useSuppliers } from "../../hooks/useSuppliers";
import { useLayout } from "../../hooks/useLayout";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { PageLoader } from "../../components/common/Loading";
import { ArrowLeft, Mail, Phone, MapPin, Package, Calendar, DollarSign } from "lucide-react";

const SupplierProfile = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: meData, isLoading: isLoadingMe } = useMe();
  const companyId = meData?.user?.company?.id;

  const { data: suppliers, isLoading: isLoadingSuppliers } = useSuppliers(companyId);
  const { currentLang, isRTL, getSidebarPadding } = useLayout();

  const supplier = suppliers?.find((s) => s.id === parseInt(id));

  if (isLoadingMe || isLoadingSuppliers) return <PageLoader />;

  if (!supplier) {
    return (
      <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
        <Sidebar />
        <Navbar />
        <div className={`pt-24 transition-all duration-300 ${getSidebarPadding()}`}>
          <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <p className="text-gray-600">{t("supplier_not_found") || "المورد غير موجود"}</p>
              <button
                onClick={() => navigate("/suppliers")}
                className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                {t("go_back") || "العودة"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      <Sidebar />
      <Navbar />
      <div className={`pt-24 transition-all duration-300 ${getSidebarPadding()}`}>
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/suppliers")}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                {t("suppliers.profile.title") || "ملف المورد"}
              </h1>
            </div>
            <button
              onClick={() => navigate(`/suppliers/edit/${supplier.id}`)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              {t("supplier_edit") || "تعديل"}
            </button>
          </div>

          {/* Supplier Info Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t("suppliers.profile.info") || "معلومات المورد"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">{t("name") || "الاسم"}</label>
                  <p className="text-lg font-medium text-gray-800">{supplier.name}</p>
                </div>
                {supplier.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">{t("email") || "البريد"}</label>
                      <p className="text-gray-700">{supplier.email}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {supplier.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">{t("phone") || "الهاتف"}</label>
                      <p className="text-gray-700">{supplier.phone}</p>
                    </div>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">{t("address") || "العنوان"}</label>
                      <p className="text-gray-700">{supplier.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shipments Section */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Package size={20} className="text-gray-500" />
              {t("suppliers.profile.shipments") || "الشحنات"}
            </h2>

            {supplier.shipments && supplier.shipments.length > 0 ? (
              <div className="space-y-4">
                {supplier.shipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/shipments/edit/${shipment.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package size={16} className="text-orange-500" />
                        <div>
                          <p className="font-medium text-gray-800">{shipment.reference}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(shipment.created_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign size={14} />
                              {shipment.total_cost} MAD
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {shipment.products_count || 0} {t("products") || "منتجات"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package size={48} className="mx-auto mb-3 opacity-30" />
                <p>{t("suppliers.profile.no_shipments") || "لا توجد شحنات لهذا المورد"}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierProfile;