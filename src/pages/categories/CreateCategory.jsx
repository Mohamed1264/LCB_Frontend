import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMe } from "../../hooks/useAuth";
import { useCreateCategory } from "../../hooks/useCategories";
import { useLayout } from "../../hooks/useLayout";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { PageLoader } from "../../components/common/Loading";
import { toast } from "react-toastify";

const CreateCategory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: meData, isLoading: isLoadingMe } = useMe();
  const companyId = meData?.user?.company?.id;
  const createMutation = useCreateCategory();
  const { getSidebarMargin } = useLayout();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const payload = {
      name: form.get("name"),
      description: form.get("description"),
      status: form.get("status") || "active",
    };
    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success(t("categories.create_success") || "تم إنشاء الفئة بنجاح");
        navigate("/categories");
      },
      onError: (error) => {
        toast.error(t("categories.create_error") || "حدث خطأ أثناء إنشاء الفئة");
        console.error("Error creating category:", error);
      },
    });
  };

  if (isLoadingMe) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Navbar />
      <div className={`pt-20 pb-10 px-6 transition-all duration-300 ${getSidebarMargin()}`}>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-bold mb-4">{t("categories.add") || "إضافة فئة"}</h1>
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">{t("categories.fields.name") || "الاسم"}</label>
              <input name="name" required className="mt-1 block w-full border rounded-md p-2 text-sm" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">{t("categories.fields.description") || "الوصف"}</label>
              <textarea name="description" className="mt-1 block w-full border rounded-md p-2 text-sm" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">{t("categories.fields.status") || "الحالة"}</label>
              <select name="status" defaultValue="active" className="mt-1 block w-full border rounded-md p-2 text-sm">
                <option value="active">{t("status_active") || "نشط"}</option>
                <option value="inactive">{t("status_inactive") || "غير نشط"}</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button 
                type="submit" 
                className="bg-orange-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (t("loading") || "جاري الحفظ...") : (t("save") || "حفظ")}
              </button>
              <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded-md border">{t("cancel") || "إلغاء"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCategory;
