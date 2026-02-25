import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMe } from "../../hooks/useAuth";
import { useEmployees, useDeleteEmployee } from "../../hooks/useEmployees";
import { useProducts } from "../../hooks/useProducts";
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
  Users,
  Search,
  LayoutGrid,
  Table,
  Briefcase,
  CheckCircle,
  AlertCircle,
  Package,
} from "lucide-react";

const Employees = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: meData, isLoading: isLoadingMe } = useMe();
  const companyId = meData?.user?.company?.id;
  const { data: employees, isLoading: isLoadingEmployees } =
    useEmployees(companyId);
  const { data: products, isLoading: isLoadingProducts } = useProducts(companyId);
  const deleteMutation = useDeleteEmployee();
  const { currentLang, isRTL, getSidebarPadding } = useLayout();

  const [searchTerm, setSearchTerm] = useState("");
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    return employees.filter((emp) => {
      const searchLower = searchTerm.toLowerCase();
      const productSearchLower = productSearchTerm.toLowerCase();
      
      const fullName = emp.user?.full_name || emp.user?.name || "";
      const jobRole = emp.jobRole?.name || "";
      const email = emp.user?.email || "";
      
      // Search by name, job role, email, and job tasks

      const matchesGeneralSearch = !searchTerm || (
        fullName.toLowerCase().includes(searchLower) ||
        jobRole.toLowerCase().includes(searchLower) ||
        email.toLowerCase().includes(searchLower) ||
        (emp.jobRole?.tasks && emp.jobRole.tasks.some(task => 
          task.name.toLowerCase().includes(searchLower)
        ))
      );
      
      // Search by products they've worked with
      console.log(emp);
      
      const matchesProductSearch = !productSearchTerm || (
        emp.product_lifecycles && emp.product_lifecycles.some(lifecycle => {
          const product = lifecycle.product;
          console.log(lifecycle);
          
          return product && (
            product.name.toLowerCase().includes(productSearchLower) ||
            (product.reference && product.reference.toLowerCase().includes(productSearchLower))
          );
        })
      );
      
      return matchesGeneralSearch && matchesProductSearch;
    });
  }, [employees, searchTerm, productSearchTerm]);

  const handleDelete = (emp) => {
    setSelectedEmployee(emp);
    setIsDeleteOpen(true);
  };

  
  const confirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ companyId, id: selectedEmployee.id });
      setSuccessMessage(t("employee_deleted_success") || "الموظف حذف بنجاح");
      setIsDeleteOpen(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  if (isLoadingMe || isLoadingEmployees || isLoadingProducts) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      <Sidebar />
      <Navbar />
      <div
        className={`pt-24 transition-all duration-300 ${getSidebarPadding()}`}
      >
        <div className="max-w-7xl mx-auto p-6">
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-700">{successMessage}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {/* Header */}
            <div
              className={`flex ${
                isRTL ? "flex-row-reverse" : ""
              } justify-between items-start mb-8`}
            >
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {t("employees_title") || "الموظفون"}
                </h1>
                <p className="text-gray-600">
                  {t("employees_subtitle") || "إدارة موظفي الشركة"}
                </p>
              </div>
              <PermissionGate permission="employee_add">
                <button
                  onClick={() => navigate("/employees/create")}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  <Plus size={16} /> {t("employee_add") || "إضافة موظف"}
                </button>
              </PermissionGate>
            </div>

            {/* Search and View Toggle */}
            <div
              className={`flex flex-col lg:flex-row ${
                isRTL ? "lg:flex-row-reverse" : ""
              } gap-4 mb-6`}
            >
              <div className="flex-1 space-y-3">
                <div className="relative">
                  <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-3 w-5 h-5 text-gray-400`} />
                  <input
                    type="text"
                    placeholder={t("search_employees_placeholder") || "ابحث بالاسم أو الوظيفة أو المهام..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  />
                </div>
                <div className="relative">
                  <Package className={`absolute ${isRTL ? "right-3" : "left-3"} top-3 w-5 h-5 text-gray-400`} />
                  <input
                    type="text"
                    placeholder={t("search_employees_by_product") || "ابحث بالمنتج (الاسم أو المرجع)..."}
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    className={`w-full ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  />
                </div>
              </div>
              <div className="flex gap-2 self-start">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "table"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Table className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Empty State */}
            {filteredEmployees.length === 0 && (
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-4">
                  {searchTerm
                    ? t("no_employees_found") || "لم يتم العثور على موظفين"
                    : t("no_employees") || "لا توجد موظفين"}
                </p>
                {!searchTerm && (
                  <PermissionGate permission="employee_add">
                    <button
                      onClick={() => navigate("/employees/create")}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                    >
                      <Plus size={16} /> {t("employee_add_first") || "أضف موظفك الأول"}
                    </button>
                  </PermissionGate>
                )}
              </div>
            )}

            {/* Grid View */}
            {viewMode === "grid" && filteredEmployees.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {employee.user?.full_name || employee.user?.name || "N/A"}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {employee.job_role?.name || "N/A"}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          employee.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {employee.status === "active"
                          ? t("active") || "نشط"
                          : t("inactive") || "غير نشط"}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm mb-6">
                      <p className="text-gray-600">
                        <span className="font-medium">{t("email") || "البريد"}: </span>
                        {employee.user?.email || "N/A"}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">{t("phone") || "الهاتف"}: </span>
                        {employee.user?.phone || "N/A"}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <PermissionGate permission="employee_edit">
                        <button
                          onClick={() => navigate(`/employees/${employee.id}/edit`)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                        >
                          <Edit size={16} />
                        </button>
                      </PermissionGate>
                      <PermissionGate permission="employee_delete">
                        <button
                          onClick={() => handleDelete(employee)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                        >
                          <Trash2 size={16} /> 
                        </button>
                      </PermissionGate>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Table View */}
            {viewMode === "table" && filteredEmployees.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-6 py-3 font-semibold text-gray-900">
                        {t("name") || "الاسم"}
                      </th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-900">
                        {t("job_role") || "الوظيفة"}
                      </th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-900">
                        {t("email") || "البريد"}
                      </th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-900">
                        {t("phone") || "الهاتف"}
                      </th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-900">
                        {t("status") || "الحالة"}
                      </th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-900">
                        {t("actions") || "الإجراءات"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((employee, idx) => (
                      <tr
                        key={employee.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 ${
                          idx % 2 === 0 ? "bg-gray-50" : ""
                        }`}
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {employee.user?.full_name || employee.user?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {employee.job_role?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {employee.user?.email || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {employee.user?.phone || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              employee.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {employee.status === "active"
                              ? t("active") || "نشط"
                              : t("inactive") || "غير نشط"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <PermissionGate permission="employee_edit">
                              <button
                                onClick={() =>
                                  navigate(`/employees/${employee.id}/edit`)
                                }
                                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                              >
                                <Edit size={16} /> 
                              </button>
                            </PermissionGate>
                            <PermissionGate permission="employee_delete">
                              <button
                                onClick={() => handleDelete(employee)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                              >
                                <Trash2 size={16} /> 
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedEmployee(null);
        }}
        title={t("delete_employee_title") || "حذف الموظف"}
        onConfirm={confirmDelete}
        confirmText={t("delete") || "حذف"}
        confirmColor="danger"
      >
        <div className="text-center py-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <p className="text-gray-700 font-medium mb-2">
            {t("delete_employee_confirm") || "هل أنت متأكد من حذف هذا الموظف؟"}
          </p>
          {selectedEmployee && (
            <p className="text-sm text-gray-600">
              {t("delete_cannot_undo") || "لا يمكن التراجع عن هذا الإجراء"}
              <br />
              <span className="font-semibold text-gray-900">
                {selectedEmployee.user?.full_name ||
                  selectedEmployee.user?.name}
              </span>
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Employees;
