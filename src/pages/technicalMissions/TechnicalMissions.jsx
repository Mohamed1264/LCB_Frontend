import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  useTechnicalMissions,
  useDeleteTechnicalMission,
} from "../../hooks/useTechnicalMissions";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { useLayout } from "../../hooks/useLayout";
import { PageLoader } from "../../components/common/Loading";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import TechnicalMissionFormModal from "../../components/forms/TechnicalMissionFormModal";
import Modal from "../../components/common/Modal";
import PermissionGate from "../../routes/PermissionGate";

const TechnicalMissions = () => {
  const { t } = useTranslation();
  const { data: missions, isLoading } = useTechnicalMissions();
  const deleteMutation = useDeleteTechnicalMission();
  const { getSidebarMargin, currentLang } = useLayout();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);

  const filteredMissions = useMemo(() => {
    if (!missions) return [];
    return missions.filter((mission) =>
      mission.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mission.employees?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [missions, searchTerm]);

  const handleDelete = () => {
    if (!selectedMission) return;

    deleteMutation.mutate(selectedMission.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedMission(null);
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
            {t("technicalMissions.title")} ({filteredMissions?.length || 0})
          </h1>

          <PermissionGate permission="technical_mission_add">
            <button
              onClick={() => {
                setSelectedMission(null);
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
            placeholder={t("technicalMissions.search_placeholder")}
            className={`w-full ${
              currentLang === "ar" ? "pr-10 pl-4" : "pl-10 pr-4"
            } py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none shadow-sm`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

{/* Table */}
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
  <table className="w-full text-sm table-auto">
    <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
      <tr>
        <th className="px-4 py-3 text-center">{t("jobTasks.table.name")}</th>
        <th className="px-4 py-3 text-center">{t("jobTasks.table.description")}</th>
        <th className="px-4 py-3 text-center">{t("jobTasks.table.role")}</th>
        <th className="px-4 py-3 text-center">{t("jobTasks.table.actions")}</th>
      </tr>
    </thead>
    <tbody>
      {filteredMissions?.length === 0 ? (
        <tr>
          <td colSpan={4} className="text-center py-8 text-gray-400">
            {t("technicalMissions.empty")}
          </td>
        </tr>
      ) : (
        filteredMissions.map((mission) => (
          <tr key={mission.id} className="border-t hover:bg-orange-50/40 transition">
            <td className="px-4 py-3 font-bold text-center text-gray-800">{mission.name}</td>
            <td className="px-4 py-3 text-center text-gray-500 max-w-xs truncate">
              {mission.description || t("technicalMissions.no_description")}
            </td>
            <td className="px-4 py-3 text-center">
              {mission.job_role?.name || t("technicalMissions.no_role")}
            </td>
            <td className="px-4 py-3 text-center">
              <div className="flex justify-center gap-2">
                <PermissionGate permission="technical_mission_edit">
                  <button
                    onClick={() => {
                      setSelectedMission(mission);
                      setIsFormOpen(true);
                    }}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit size={16} />
                  </button>
                </PermissionGate>

                <PermissionGate permission="technical_mission_delete">
                  <button
                    onClick={() => {
                      setSelectedMission(mission);
                      setIsDeleteOpen(true);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
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

      <TechnicalMissionFormModal
        key={selectedMission?.id || "new"}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        mission={selectedMission}
      />

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedMission(null);
        }}
        onConfirm={handleDelete}
        title={t("technicalMissions.delete.title")}
        confirmText={t("technicalMissions.delete.confirm")}
        isLoading={deleteMutation.isPending}
      >
        {t("technicalMissions.delete.message")}{" "}
        <strong>{selectedMission?.location}</strong> ?
      </Modal>
    </div>
  );
};

export default TechnicalMissions;
