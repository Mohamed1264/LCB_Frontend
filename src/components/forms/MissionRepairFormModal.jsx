import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  useCreateMissionRepair,
  useUpdateMissionRepair,
} from "../../hooks/useMissionRepairs";

const MissionRepairFormModal = ({ isOpen, onClose, repair }) => {
  const { t, i18n } = useTranslation();
  const isEdit = Boolean(repair);

  const [formData, setFormData] = useState({
    title: repair?.title || "",
    description: repair?.description || "",
    status: repair?.status || "pending",
  });

  const createMutation = useCreateMissionRepair();
  const updateMutation = useUpdateMissionRepair();

  // تحديث state عند تغيير repair
  useEffect(() => {
    setFormData({
      title: repair?.title || "",
      description: repair?.description || "",
      status: repair?.status || "pending",
    });
  }, [repair]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;

    if (isEdit) {
      updateMutation.mutate(
        { id: repair.id, data: formData },
        { onSuccess: onClose }
      );
    } else {
      createMutation.mutate(formData, { onSuccess: onClose });
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
              ? t("missionRepairs.form.edit_title")
              : t("missionRepairs.form.add_title")}
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
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder={t("missionRepairs.form.title_placeholder")}
            className="w-full px-3 py-2 border rounded-lg"
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder={t("missionRepairs.form.description_placeholder")}
            className="w-full px-3 py-2 border rounded-lg"
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">
              {t("missionRepairs.form.select_status")}
            </option>
            <option value="pending">
              {t("missionRepairs.status.pending")}
            </option>
            <option value="in_progress">
              {t("missionRepairs.status.in_progress")}
            </option>
            <option value="completed">
              {t("missionRepairs.status.completed")}
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
            disabled={isLoading}
            className="px-4 py-2 bg-orange-600 text-white rounded-xl disabled:opacity-50"
          >
            {isEdit ? t("common.update") : t("common.add")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MissionRepairFormModal;
