import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useJobs, useDeleteJob } from "../../hooks/useJobs";
import { filterJobs } from "../../components/utils/jobsFilter";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { PageLoader } from "../../components/common/Loading";
import { Plus, Search, Edit, Trash2, Circle } from "lucide-react";
import JobRoleFormModal from "../../components/forms/JobRoleFormModal";
import Modal from "../../components/common/Modal";
import PermissionGate from "../../routes/PermissionGate";
import { useLayout } from "../../hooks/useLayout";

const JobRoles = () => {
  const { t } = useTranslation();
  const { data: roles, isLoading } = useJobs();
  const deleteMutation = useDeleteJob();
  const { currentLang, getSidebarMargin } = useLayout();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const filteredRoles = useMemo(() => {
    return filterJobs(roles, searchTerm);
  }, [roles, searchTerm]);

  const handleDelete = () => {
    if (!selectedJob) return;

    deleteMutation.mutate(selectedJob.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedJob(null);
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

      <main className={`flex-1 p-6 pt-24 transition-all duration-300 ${getSidebarMargin()}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-black text-gray-800">
            {t("jobs.title")} ({filteredRoles?.length || 0})
          </h1>

          <PermissionGate permission="job_add">
            <button
              onClick={() => {
                setSelectedJob(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
            >
              <Plus size={16} /> {t("jobs.actions.add")}
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
            placeholder={t("jobs.search_placeholder")}
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
                <th className="px-4 py-3 text-center">{t("jobs.table.name")}</th>
                <th className="px-4 py-3 text-center">{t("jobs.table.description")}</th>
                <th className="px-4 py-3 text-center">{t("jobs.table.status")}</th>
                <th className="px-4 py-3 text-center">{t("jobs.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
                    {t("jobs.empty")}
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => (
                  <tr key={role.id} className="border-t hover:bg-orange-50/40 transition">
                    <td className="px-4 py-3 font-bold text-center text-gray-800">{role.name}</td>

                    <td className="px-4 py-3 text-center text-gray-500 max-w-xs truncate">
                      {role.description || t("jobs.no_description")}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <Circle
                          size={8}
                          className={
                            role.status === "active"
                              ? "fill-green-500 text-green-500"
                              : "fill-gray-400 text-gray-400"
                          }
                        />
                        <span className="text-xs font-bold">
                          {role.status === "active"
                            ? t("jobs.status.active")
                            : t("jobs.status.inactive")}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <PermissionGate permission="job_edit">
                          <button
                            onClick={() => {
                              setSelectedJob(role);
                              setIsFormOpen(true);
                            }}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit size={16} />
                          </button>
                        </PermissionGate>

                        <PermissionGate permission="job_delete">
                          <button
                            onClick={() => {
                              setSelectedJob(role);
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

      {/* Form Modal */}
      <JobRoleFormModal
        key={selectedJob?.id || "new"}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        job={selectedJob}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedJob(null);
        }}
        onConfirm={handleDelete}
        title={t("jobs.delete.title")}
        confirmText={t("jobs.delete.confirm")}
        isLoading={deleteMutation.isPending}
      >
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {t("jobs.delete.message")}{" "}
            <span className="font-bold text-red-600">
              {selectedJob?.name}
            </span>
            ?
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {t("jobs.delete.warning")}
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default JobRoles;