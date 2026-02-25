import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMe } from "../../hooks/useAuth";
import { useCategories, useDeleteCategory } from "../../hooks/useCategories";
import { useLayout } from "../../hooks/useLayout";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import Modal from "../../components/common/Modal";
import { PageLoader } from "../../components/common/Loading";
import PermissionGate from "../../routes/PermissionGate";
import {
  Trash2,
  Edit,
  Plus,
  Folder,
  Search,
  LayoutGrid,
  Table,
  CheckCircle,
  AlertCircle,
  Filter,
  Download,
  Package,
  MoreVertical,
  Tag,
} from "lucide-react";

const Categories = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: meData, isLoading: isLoadingMe } = useMe();
  const companyId = meData?.user?.company?.id;
  const { data: categories, isLoading: isLoadingCategories } =
    useCategories(companyId);
  const deleteMutation = useDeleteCategory();
  const { currentLang, isRTL, getSidebarPadding } = useLayout();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Direction-aware constants
  const dir = isRTL ? "rtl" : "ltr";
  const searchIconPosition = !isRTL ? "right-3" : "left-3";
  const paddingDirection = isRTL ? "pr-10" : "pl-10";

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    
    return categories.filter((category) => {
      const searchLower = searchTerm.toLowerCase();
      const name = category.name || "";
      const description = category.description || "";
      
      return (
        name.toLowerCase().includes(searchLower) ||
        description.toLowerCase().includes(searchLower)
      );
    });
  }, [categories, searchTerm]);

  // Statistics calculation
  const stats = useMemo(() => {
    if (!categories) return { total: 0, active: 0 };
    
    return {
      total: categories.length,
      active: categories.filter(cat => cat.status === "active").length,
    };
  }, [categories]);

  // Handle delete
  const handleDelete = useCallback((category) => {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  }, []);

  const confirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ companyId, id: selectedCategory.id });
      setSuccessMessage(t("category_deleted_success") || "التصنيف حذف بنجاح");
      setIsDeleteOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  // Export categories data
  const handleExport = () => {
    const data = filteredCategories.map(cat => ({
      name: cat.name,
      description: cat.description,
      status: cat.status,
      createdAt: cat.created_at,
    }));
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `categories-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoadingMe || isLoadingCategories) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      <Sidebar />
      <Navbar />
      
      <main
        className={`pt-24 transition-all duration-300 ${getSidebarPadding()}`}
      >
        <div className="max-w-7xl mx-auto p-6">
          {/* Success Message */}
          {successMessage && (
            <div 
              className={`mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-slide-down ${
                isRTL ? "flex-row-reverse" : ""
              }`}
              role="alert"
            >
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-green-700">{successMessage}</p>
            </div>
          )}

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header Section */}
            <div className="p-8 border-b border-gray-100">
              <div className={`flex ${isRTL ? "flex-row-reverse" : ""} justify-between items-start`}>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {t("categories_title") || "التصنيفات"}
                  </h1>
                  <p className="text-gray-600">
                    {t("categories_subtitle") || "إدارة تصنيفات المنتجات والخدمات"}
                  </p>
                </div>
                
                <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    aria-label={t("export") || "تصدير"}
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">{t("export") || "تصدير"}</span>
                  </button>
                  
                  <PermissionGate permission="category_add">
                    <button
                      onClick={() => navigate("/categories/create")}
                      className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm hover:shadow-md"
                    >
                      <Plus className="w-5 h-5" />
                      <span>{t("category_add") || "إضافة تصنيف"}</span>
                    </button>
                  </PermissionGate>
                </div>
              </div>

              {/* Stats Cards */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 ${isRTL ? "text-right" : "text-left"}`}>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-sm text-blue-600 font-medium mb-1">{t("total_categories") || "إجمالي التصنيفات"}</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <p className="text-sm text-green-600 font-medium mb-1">{t("active_categories") || "التصنيفات النشطة"}</p>
                  <p className="text-2xl font-bold text-green-700">{stats.active}</p>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="p-6 bg-gray-50 border-b border-gray-100">
              <div className={`flex flex-col lg:flex-row gap-4 ${isRTL ? "lg:flex-row-reverse" : ""}`}>
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className={`absolute ${searchIconPosition} top-3 w-5 h-5 text-gray-400`} />
                  <input
                    type="text"
                    placeholder={t("categories.search_placeholder") || "ابحث باسم التصنيف..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full ${paddingDirection} pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow`}
                    aria-label={t("search") || "بحث"}
                  />
                </div>

                {/* Filter and View Toggle */}
                <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      showFilters
                        ? "bg-orange-100 text-orange-600"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">{t("filter") || "تصفية"}</span>
                  </button>

                  <div className="flex gap-1 bg-white rounded-lg border border-gray-300 p-1">
                    <button
                      onClick={() => setViewMode("table")}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === "table"
                          ? "bg-orange-500 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                      aria-label={t("table_view") || "عرض جدول"}
                    >
                      <Table className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === "grid"
                          ? "bg-orange-500 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                      aria-label={t("grid_view") || "عرض شبكي"}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6">
              {/* Empty State */}
              {filteredCategories.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Folder className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-lg mb-4">
                    {searchTerm
                      ? t("no_categories_found") || "لم يتم العثور على تصنيفات"
                      : t("no_categories") || "لا توجد تصنيفات"}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => navigate("/categories/create")}
                      className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {t("category_add_first") || "أضف تصنيفك الأول"}
                    </button>
                  )}
                </div>
              )}

              {/* Grid View */}
              {viewMode === "grid" && filteredCategories.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group"
                    >
                      {/* Card Header */}
                      <div className="p-6 bg-gradient-to-br from-orange-50 to-white border-b border-gray-100">
                        <div className={`flex items-start justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                          <div className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <Tag className="w-5 h-5 text-orange-500" />
                              <h3 className="font-bold text-gray-900 text-lg">
                                {category.name}
                              </h3>
                            </div>
                            {category.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {category.description}
                              </p>
                            )}
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              category.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {category.status === "active"
                              ? t("active") || "نشط"
                              : t("inactive") || "غير نشط"}
                          </span>
                        </div>
                      </div>

                      {/* Card Stats */}
                      <div className="p-6 bg-gray-50 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {t("products_count") || "عدد المنتجات"}:
                          </span>
                          <span className="font-semibold text-gray-900">
                            {category.products_count || 0}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="p-6 bg-white border-t border-gray-100">
                        <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <PermissionGate permission="category_edit">
                            <button
                              onClick={() => navigate(`/categories/${category.id}/edit`)}
                              className="flex-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2 group-hover:shadow-sm"
                            >
                              <Edit className="w-4 h-4" />
                              {t("edit") || "تعديل"}
                            </button>
                          </PermissionGate>
                          <PermissionGate permission="category_delete">
                            <button
                              onClick={() => handleDelete(category)}
                              className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2 group-hover:shadow-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                              {t("delete") || "حذف"}
                            </button>
                          </PermissionGate>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Table View */}
              {viewMode === "table" && filteredCategories.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className={`px-6 py-4 font-semibold text-gray-900 ${isRTL ? "text-right" : "text-left"}`}>
                          {t("name") || "الاسم"}
                        </th>
                        <th className={`px-6 py-4 font-semibold text-gray-900 ${isRTL ? "text-right" : "text-left"}`}>
                          {t("description") || "الوصف"}
                        </th>
                        <th className={`px-6 py-4 font-semibold text-gray-900 ${isRTL ? "text-right" : "text-left"}`}>
                          {t("products_count") || "عدد المنتجات"}
                        </th>
                        <th className={`px-6 py-4 font-semibold text-gray-900 ${isRTL ? "text-right" : "text-left"}`}>
                          {t("status") || "الحالة"}
                        </th>
                        <th className={`px-6 py-4 font-semibold text-gray-900 ${isRTL ? "text-right" : "text-left"}`}>
                          {t("actions") || "الإجراءات"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredCategories.map((category, idx) => (
                        <tr
                          key={category.id}
                          className={`hover:bg-gray-50 transition-colors ${
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Folder className="w-4 h-4 text-orange-600" />
                              </div>
                              <span className="font-medium text-gray-900">
                                {category.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {category.description || "-"}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {category.products_count || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                category.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {category.status === "active"
                                ? t("active") || "نشط"
                                : t("inactive") || "غير نشط"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                              <PermissionGate permission="category_edit">
                                <button
                                  onClick={() => navigate(`/categories/${category.id}/edit`)}
                                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                  title={t("edit") || "تعديل"}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </PermissionGate>
                              <PermissionGate permission="category_delete">
                                <button
                                  onClick={() => handleDelete(category)}
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                  title={t("delete") || "حذف"}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </PermissionGate>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedCategory(null);
        }}
        title={t("delete_category_title") || "حذف التصنيف"}
        onConfirm={confirmDelete}
        confirmText={t("delete") || "حذف"}
        confirmColor="danger"
      >
        <div className={`text-center py-4 ${isRTL ? "rtl" : ""}`}>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <p className="text-gray-700 font-medium mb-2">
            {t("delete_category_confirm") || "هل أنت متأكد من حذف هذا التصنيف؟"}
          </p>
          {selectedCategory && (
            <>
              <p className="text-sm text-gray-600 mb-2">
                {t("delete_cannot_undo") || "لا يمكن التراجع عن هذا الإجراء"}
              </p>
              <p className="font-semibold text-gray-900">
                {selectedCategory.name}
              </p>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Categories;