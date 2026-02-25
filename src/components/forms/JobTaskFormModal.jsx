import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCreateJobTask, useUpdateJobTask } from "../../hooks/useJobTask";

const JobTaskFormModal = ({ isOpen, onClose, task, jobRoles }) => {
  const { t, i18n } = useTranslation();
  const isEdit = Boolean(task);

  const [formData, setFormData] = useState(() => ({
    job_role_id: task?.job_role_id || "",
    name: task?.name || "",
    description: task?.description || "",
  }));

  const createMutation = useCreateJobTask();
  const updateMutation = useUpdateJobTask();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.job_role_id) return;
    if (!formData.name.trim()) return;

    if (isEdit) {
      updateMutation.mutate(
        { id: task.id, data: formData },
        { onSuccess: onClose }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: onClose,
      });
    }
  };

  const isLoading =
    createMutation.isPending || updateMutation.isPending;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-lg">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">
            {isEdit
              ? t("jobTasks.form.edit_title")
              : t("jobTasks.form.add_title")}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-4">

          <select
            name="job_role_id"
            value={formData.job_role_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">
              {t("jobTasks.form.select_role")}
            </option>

            {jobRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={t("jobTasks.table.name")}
            className="w-full px-3 py-2 border rounded-lg"
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder={t("jobTasks.table.description")}
            className="w-full px-3 py-2 border rounded-lg"
          />

        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-xl"
          >
            {t("common.cancel")}
          </button>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-orange-600 text-white rounded-xl"
          >
            {isEdit
              ? t("common.update")
              : t("common.add")}
          </button>
        </div>

      </div>
    </div>
  );
};

export default JobTaskFormModal;