import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMe } from "../../hooks/useAuth";
import { useSuppliers, useUpdateSupplier } from "../../hooks/useSuppliers";
import { useLayout } from "../../hooks/useLayout";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import Modal from "../../components/common/Modal";
import { PageLoader } from "../../components/common/Loading";
import { CheckCircle } from "lucide-react";

const EditSupplier = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: meData, isLoading: isLoadingMe } = useMe();
  const companyId = meData?.user?.company?.id;

  const { data: suppliers, isLoading: isLoadingSuppliers } = useSuppliers(companyId);
  const updateMutation = useUpdateSupplier();
  const { currentLang, isRTL, getSidebarPadding } = useLayout();

  const supplier = suppliers?.find((s) => s.id === parseInt(id));

  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "", status: "active" });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: "", message: "" });

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        status: supplier.status || "active",
      });
    }
  }, [supplier]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = t("field_required");
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t("employee_email_invalid");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await updateMutation.mutateAsync({ companyId, id, data: formData });
      setShowSuccess(true);
    } catch (error) {
      console.error(error);
      setErrorMessage({ title: t("supplier_update_error") || "خطأ", message: error.response?.data?.message || error.message });
      setIsErrorModalOpen(true);
    }
  };

  const handleGoBack = () => navigate("/suppliers");

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
              <button onClick={handleGoBack} className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-lg">{t("go_back") || "العودة"}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
        <Sidebar />
        <Navbar />
        <div className={`pt-24 transition-all duration-300 ${getSidebarPadding()}`}>
          <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("supplier_update_success") || "تم تحديث المورد"}</h2>
              <p className="text-gray-600 mb-8">{t("supplier_update_success_message") || "تم تحديث بيانات المورد بنجاح"}</p>
              <div className="flex gap-4">
                <button onClick={() => setShowSuccess(false)} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg">{t("edit_again") || "تعديل مرة أخرى"}</button>
                <button onClick={handleGoBack} className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg">{t("go_back") || "العودة"}</button>
              </div>
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
        <div className="max-w-3xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("supplier_edit") || "تعديل مورد"}</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("name") || "الاسم"} <span className="text-red-500">*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("email") || "البريد"}</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("phone") || "الهاتف"}</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("address") || "العنوان"}</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={handleGoBack} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg">{t("cancel") || "إلغاء"}</button>
                <button type="submit" className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg">{t("update") || "حفظ"}</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Modal isOpen={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)} title={errorMessage.title} onConfirm={() => setIsErrorModalOpen(false)} confirmText={t("ok") || "حسناً"}>
        <div className="text-center py-4">
          <p className="text-gray-700 font-medium mb-2">{errorMessage.title}</p>
          <p className="text-sm text-gray-600">{errorMessage.message}</p>
        </div>
      </Modal>
    </div>
  );
};

export default EditSupplier;
