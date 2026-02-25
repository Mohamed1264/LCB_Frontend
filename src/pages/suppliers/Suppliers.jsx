import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMe } from "../../hooks/useAuth";
import { useSuppliers, useDeleteSupplier } from "../../hooks/useSuppliers";
import { useLayout } from "../../hooks/useLayout";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import Modal from "../../components/common/Modal";
import { PageLoader } from "../../components/common/Loading";
import PermissionGate from "../../routes/PermissionGate";
import { Trash2, Edit, Plus, Search, Users, Eye } from "lucide-react";

const Suppliers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: meData, isLoading: isLoadingMe } = useMe();
  const companyId = meData?.user?.company?.id;

  const { data: suppliers, isLoading: isLoadingSuppliers } = useSuppliers(companyId);
  const deleteMutation = useDeleteSupplier();
  const { currentLang, getSidebarMargin } = useLayout();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredSuppliers = useMemo(() => {
    if (!suppliers) return [];
    const q = searchTerm.toLowerCase();
    return suppliers.filter((s) =>
      (s.name || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      (s.phone || "").toLowerCase().includes(q)
    );
  }, [suppliers, searchTerm]);

  const handleDelete = () => {
    if (!selectedId) return;
    deleteMutation.mutate(
      { companyId, id: selectedId },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setSelectedId(null);
        },
      }
    );
  };

  if (isLoadingMe || isLoadingSuppliers) return <PageLoader />;

  return (
    <div className=" min-h-screen bg-gray-50"
         dir={currentLang === "ar" ? "rtl" : "ltr"}

    >
      <Sidebar />
      <Navbar />

      <div
        className={`pt-20 pb-10 px-6 transition-all duration-300 ${getSidebarMargin()}`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-800">
              {t("suppliers.title") || "الموردون"} ({filteredSuppliers?.length || 0})
            </h1>
            <div className="flex items-center gap-2">
              <PermissionGate permission="suplier_add">
                <button
                  onClick={() => navigate("/suppliers/create")}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  <Plus size={16} /> {t("suppliers.add") || "إضافة مورد"}
                </button>
              </PermissionGate>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6 flex items-center gap-3">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder={t("suppliers.search_placeholder") || "ابحث باسم المورد أو الهاتف..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            {filteredSuppliers.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{t("suppliers.empty") || "لا يوجد موردين"}</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase border-b border-gray-100">
                    <th className="px-4 py-3 text-start">{t("suppliers.table.name") || "الاسم"}</th>
                    <th className="px-4 py-3 text-start">{t("suppliers.table.email") || "البريد"}</th>
                    <th className="px-4 py-3 text-start">{t("suppliers.table.phone") || "الهاتف"}</th>
                    <th className="px-4 py-3 text-start">{t("suppliers.table.actions") || "إجراءات"}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((s) => (
                    <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                      <td className="px-4 py-3 text-gray-500">{s.email || "-"}</td>
                      <td className="px-4 py-3 text-gray-500">{s.phone || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <PermissionGate permission="suplier_view">
                            <button
                              onClick={() => navigate(`/suppliers/profile/${s.id}`)}
                              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md"
                              title={t("view") || "عرض"}
                            >
                              <Eye size={14} />
                            </button>
                          </PermissionGate>
                          <PermissionGate permission="suplier_edit">
                            <button
                              onClick={() => navigate(`/suplier/edit/${s.id}`)}
                              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md"
                            >
                              <Edit size={14} />
                            </button>
                          </PermissionGate>
                          <PermissionGate permission="suplier_delete">
                            <button
                              onClick={() => {
                                setSelectedId(s.id);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"
                            >
                              <Trash2 size={14} />
                            </button>
                          </PermissionGate>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedId(null);
        }}
        onConfirm={handleDelete}
        title={t("suppliers.delete.title") || "تأكيد الحذف"}
        confirmText={t("suppliers.delete.confirm") || "حذف"}
        isLoading={deleteMutation.isPending}
      >
        <div className="text-sm text-gray-600">
          {t("suppliers.delete.message") || "هل أنت متأكد من حذف المورد"}{" "}
          "{suppliers?.find((s) => s.id === selectedId)?.name}"{" "}
          {t("suppliers.delete.question") || "؟"}
        </div>
      </Modal>
    </div>
  );
};

export default Suppliers;