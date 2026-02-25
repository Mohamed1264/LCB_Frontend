import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  useCreateTechnicalMission,
  useUpdateTechnicalMission,
} from "../../hooks/useTechnicalMissions";
import { useMe } from "../../hooks/useAuth";

const TechnicalMissionFormModal = ({ isOpen, onClose, mission }) => {
  const { t, i18n } = useTranslation();
  const isEdit = Boolean(mission);
  const { data: currentUser } = useMe();

  const [formData, setFormData] = useState({
    technician_id: mission?.technician_id || "",
    location: mission?.location || "",
    start_date: mission?.start_date || "",
    end_date: mission?.end_date || "",
    charges: mission?.charges || "",
    status: mission?.status || "pending",
  });

  const [employees, setEmployees] = useState([]);

  const createMutation = useCreateTechnicalMission();
  const updateMutation = useUpdateTechnicalMission();

  // تحديث state عند تغيير mission
  useEffect(() => {
    setFormData({
      technician_id: mission?.technician_id || "",
      location: mission?.location || "",
      start_date: mission?.start_date || "",
      end_date: mission?.end_date || "",
      charges: mission?.charges || "",
      status: mission?.status || "pending",
    });
  }, [mission]);

  // جلب الموظفين (يمكن استبدالها بـ hook للموظفين)
  useEffect(() => {
    // في حالة وجود API استدعاء الموظفين
    // للآن نستخدم بيانات وهمية
    if (currentUser?.employees) {
      setEmployees(currentUser.employees);
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.technician_id.trim()) return;
    if (!formData.location.trim()) return;
    if (!formData.start_date) return;

    if (isEdit) {
      updateMutation.mutate(
        { id: mission.id, data: formData },
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
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white">
          <h2 className="text-lg font-bold">
            {isEdit
              ? t("technicalMissions.form.edit_title")
              : t("technicalMissions.form.add_title")}
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
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder={t("technicalMissions.form.location_placeholder")}
            className="w-full px-3 py-2 border rounded-lg"
          />

          <input
            type="number"
            name="technician_id"
            value={formData.technician_id}
            onChange={handleChange}
            placeholder={t("technicalMissions.form.technician_placeholder")}
            className="w-full px-3 py-2 border rounded-lg"
          />

          <div>
            <label className="block text-sm font-medium mb-1">
              {t("technicalMissions.form.start_date")}
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t("technicalMissions.form.end_date")}
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <input
            type="number"
            name="charges"
            value={formData.charges}
            onChange={handleChange}
            placeholder={t("technicalMissions.form.charges_placeholder")}
            className="w-full px-3 py-2 border rounded-lg"
            min="0"
            step="0.01"
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">
              {t("technicalMissions.form.select_status")}
            </option>
            <option value="pending">
              {t("technicalMissions.status.pending")}
            </option>
            <option value="in_progress">
              {t("technicalMissions.status.in_progress")}
            </option>
            <option value="completed">
              {t("technicalMissions.status.completed")}
            </option>
            <option value="cancelled">
              {t("technicalMissions.status.cancelled")}
            </option>
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-6 sticky bottom-0 bg-white pt-4">
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

export default TechnicalMissionFormModal;
