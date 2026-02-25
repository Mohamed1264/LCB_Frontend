import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUpdateCategory } from "../../hooks/useCategories";
import { useLayout } from "../../hooks/useLayout";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { PageLoader } from "../../components/common/Loading";
import api from "../../api/api";
import { toast } from "react-toastify";

const EditCategory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const updateMutation = useUpdateCategory();
  const { getSidebarMargin } = useLayout();

  const [category, setCategory] = useState(null);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const { data } = await api.get(`/category/${id}`);
        setCategory(data);
      } catch (error) {
        console.error("Error loading category:", error);
      }
    };

    loadCategory();
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const form = new FormData(e.target);

    const payload = {
      name: form.get("name"),
      description: form.get("description"),
      status: form.get("status") || "active",
    };

    updateMutation.mutate(
      { id, data: payload },
      {
        onSuccess: () => {
          toast.success(t("categories.update_success") || "تم تحديث الفئة بنجاح");
          navigate("/categories");
        },
        onError: (error) => {
          toast.error(t("categories.update_error") || "حدث خطأ أثناء تحديث الفئة");
          console.error("Error updating category:", error);
        },
      }
    );
  };

  if (!category) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Navbar />

      <div className={`pt-20 pb-10 px-6 ${getSidebarMargin()}`}>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-bold mb-4">
            {t("categories.edit") || "تعديل فئة"}
          </h1>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="mb-4">
              <label className="block text-sm font-medium">
                {t("categories.fields.name") || "الاسم"}
              </label>
              <input
                name="name"
                defaultValue={category.name}
                required
                className="mt-1 block w-full border rounded-md p-2 text-sm"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">
                {t("categories.fields.description") || "الوصف"}
              </label>
              <textarea
                name="description"
                defaultValue={category.description}
                className="mt-1 block w-full border rounded-md p-2 text-sm"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">
                {t("categories.fields.status") || "الحالة"}
              </label>
              <select
                name="status"
                defaultValue={category.status}
                className="mt-1 block w-full border rounded-md p-2 text-sm"
              >
                <option value="active">{t("status_active") || "نشط"}</option>
                <option value="inactive">{t("status_inactive") || "غير نشط"}</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-orange-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending
                  ? (t("loading") || "جاري الحفظ...")
                  : (t("update") || "حفظ")}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-md border"
              >
                {t("cancel") || "إلغاء"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCategory;
