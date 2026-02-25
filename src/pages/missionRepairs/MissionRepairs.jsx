import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  useMissionRepairs,
  useDeleteMissionRepair,
} from "../../hooks/useMissionRepairs";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { useLayout } from "../../hooks/useLayout";
import { PageLoader } from "../../components/common/Loading";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import MissionRepairFormModal from "../../components/forms/MissionRepairFormModal";
import Modal from "../../components/common/Modal";
import PermissionGate from "../../routes/PermissionGate";

const MissionRepairs = () => {
  const { t } = useTranslation();
  const { data: repairs, isLoading } = useMissionRepairs();
  const deleteMutation = useDeleteMissionRepair();
  const { getSidebarMargin, currentLang } = useLayout();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);

  const filteredRepairs = useMemo(() => {
    if (!repairs) return [];
    return repairs.filter((repair) =>
      repair.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repair.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [repairs, searchTerm]);

  const handleDelete = () => {
    if (!selectedRepair) return;

    deleteMutation.mutate(selectedRepair.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedRepair(null);
      },
    });
  };

  if (isLoading) return <PageLoader />;

  return (
    <div
      className="flex bg-gray-50 min-h-screen font-sans"
      dir={currentLang === "ar" ? "rtl" : "ltr"}
    >
      <Sidebar />
      <Navbar />

      <main
        className={`flex-1 p-8 pt-24 transition-all duration-300 ${getSidebarMargin()}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-black text-gray-800">
            {t("missionRepairs.title")} ({filteredRepairs?.length || 0})
          </h1>

          <PermissionGate permission="mission_repair_add">
            <button
              onClick={() => {
                setSelectedRepair(null);
                setIsFormOpen(true);
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all shadow-sm"
            >
              <Plus size={18} /> {t("common.add")}
            </button>
          </PermissionGate>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search
            className={`absolute ${
              currentLang === "ar" ? "right-3" : "left-3"
            } top-1/2 -translate-y-1/2 text-gray-400`}
            size={16}
          />
          <input
            type="text"
            placeholder={t("missionRepairs.search_placeholder")}
            className={`w-full ${
              currentLang === "ar" ? "pr-10 pl-4" : "pl-10 pr-4"
            } py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none shadow-sm`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">{t("missionRepairs.table.title")}</th>
                <th className="px-4 py-3">{t("missionRepairs.table.description")}</th>
                <th className="px-4 py-3">{t("missionRepairs.table.status")}</th>
                <th className="px-4 py-3 text-center">
                  {t("missionRepairs.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRepairs?.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-400">
                    {t("missionRepairs.empty")}
                  </td>
                </tr>
              ) : (
                filteredRepairs.map((repair) => (
                  <tr key={repair.id} className="border-t hover:bg-orange-50/40 transition">
                    <td className="px-4 py-3 font-bold text-gray-800">
                      {repair.title}
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                      {repair.description || t("missionRepairs.no_description")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        repair.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : repair.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {t(`missionRepairs.status.${repair.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <PermissionGate permission="mission_repair_edit">
                          <button
                            onClick={() => {
                              setSelectedRepair(repair);
                              setIsFormOpen(true);
                            }}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit size={16} />
                          </button>
                        </PermissionGate>

                        <PermissionGate permission="mission_repair_delete">
                          <button
                            onClick={() => {
                              setSelectedRepair(repair);
                              setIsDeleteOpen(true);
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </PermissionGate>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      <MissionRepairFormModal
        key={selectedRepair?.id || "new"}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        repair={selectedRepair}
      />

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedRepair(null);
        }}
        onConfirm={handleDelete}
        title={t("missionRepairs.delete.title")}
        confirmText={t("missionRepairs.delete.confirm")}
        isLoading={deleteMutation.isPending}
      >
        {t("missionRepairs.delete.message")}{" "}
        <strong>{selectedRepair?.title}</strong> ?
      </Modal>
    </div>
  );
};

export default MissionRepairs;
