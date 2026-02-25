import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCreateJob, useUpdateJob } from "../../hooks/useJobs";

const JobRoleFormModal = ({ isOpen, onClose, job }) => {
  const { t, i18n } = useTranslation();
  const isEdit = Boolean(job);

  const [formData, setFormData] = useState({
    name: job?.name || "",
    description: job?.description || "",
    status: job?.status || "active",
  });

  const createMutation = useCreateJob();
  const updateMutation = useUpdateJob();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    if (isEdit) {
      updateMutation.mutate(
        { id: job.id, data: formData },
        { onSuccess: onClose }
      );
    } else {
      createMutation.mutate(formData, { onSuccess: onClose });
    }
  };

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
              ? t("jobs.form.edit_title")
              : t("jobs.form.add_title")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={t("jobs.table.name")}
            className="w-full px-3 py-2 border rounded-lg"
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder={t("jobs.table.description")}
            className="w-full px-3 py-2 border rounded-lg"
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="active">
              {t("jobs.status.active")}
            </option>
            <option value="inactive">
              {t("jobs.status.inactive")}
            </option>
          </select>
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

export default JobRoleFormModal;