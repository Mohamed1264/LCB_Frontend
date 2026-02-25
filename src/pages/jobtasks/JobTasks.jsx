import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useJobTasks, useDeleteJobTask } from "../../hooks/useJobTask";
import { filterJobs } from "../../components/utils/jobsFilter";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { useLayout } from "../../hooks/useLayout";
import { PageLoader } from "../../components/common/Loading";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import JobTaskFormModal from "../../components/forms/JobTaskFormModal";
import Modal from "../../components/common/Modal";
import { useJobs } from "../../hooks/useJobs";
import PermissionGate from "../../routes/PermissionGate";

const JobTasks = () => {
  const { t } = useTranslation();
  const { data: tasks, isLoading: isLoadingTasks } = useJobTasks();
  const deleteMutation = useDeleteJobTask();
  const { getSidebarMargin, currentLang } = useLayout();
  const { data: roles } = useJobs();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const filteredTasks = useMemo(() => {
    return filterJobs(tasks, searchTerm);
  }, [tasks, searchTerm]);

  const jobRolesOptions = useMemo(() => {
    if (!Array.isArray(roles)) return [];
    return roles.map((role) => ({
      id: role.id,
      name: role.name,
    }));
  }, [roles]);

  const handleDelete = () => {
    if (!selectedTask) return;

    deleteMutation.mutate(selectedTask.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedTask(null);
      },
    });
  };

  if (isLoadingTasks) return <PageLoader />;

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
            {t("jobTasks.title")} ({filteredTasks?.length || 0})
          </h1>

          <PermissionGate permission="job_task_add">
            <button
              onClick={() => {
                setSelectedTask(null);
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
            placeholder={t("jobTasks.search_placeholder")}
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
            {filteredTasks?.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400">
                  {t("jobTasks.empty")}
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task.id} className="border-t hover:bg-orange-50/40 transition">
                  <td className="px-4 py-3 font-bold text-center text-gray-800">{task.name}</td>
                  <td className="px-4 py-3 text-center text-gray-500 max-w-xs truncate">
                    {task.description || t("jobTasks.no_description")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {task.job_role?.name || t("jobTasks.no_role")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <PermissionGate permission="job_task_edit">
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setIsFormOpen(true);
                          }}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit size={16} />
                        </button>
                      </PermissionGate>

                      <PermissionGate permission="job_task_delete">
                        <button
                          onClick={() => {
                            setSelectedTask(task);
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

      <JobTaskFormModal
        key={selectedTask?.id || "new"}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        task={selectedTask}
        jobRoles={jobRolesOptions}
      />

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedTask(null);
        }}
        onConfirm={handleDelete}
        title={t("jobTasks.delete.title")}
        confirmText={t("jobTasks.delete.confirm")}
        isLoading={deleteMutation.isPending}
      >
        {t("jobTasks.delete.message")}{" "}
        <strong>{selectedTask?.name}</strong> ?
      </Modal>
    </div>
  );
};

export default JobTasks;