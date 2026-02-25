import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCreateLocation, useUpdateLocation } from "../../hooks/useLocations";

const LocationFormModal = ({ isOpen, onClose, location }) => {
  const isEdit = Boolean(location);

  const { t, i18n } = useTranslation();
  const dir = i18n.language === "ar" ? "rtl" : "ltr";

  const [formData, setFormData] = useState({
    name: location?.name || "",
    address: location?.address || "",
    status: location?.status || "active",
  });

  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();

  // تحديث state عند تغيير location
  useEffect(() => {
    setFormData({
      name: location?.name || "",
      address: location?.address || "",
      status: location?.status || "active",
    });
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    if (!formData.address.trim()) return;

    if (isEdit) {
      updateMutation.mutate(
        { id: location.id, data: formData },
        { onSuccess: onClose }
      );
    } else {
      createMutation.mutate(formData, { onSuccess: onClose });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" dir={dir}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{isEdit ? t("locations.form.edit_title") : t("locations.form.add_title")}</h2>
          <button onClick={onClose} className="text-gray-400 text-xl font-bold">×</button>
        </div>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={t("locations.form.name_placeholder")}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder={t("locations.form.address_placeholder")}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="active">{t("locations.status.active")}</option>
            <option value="inactive">{t("locations.status.inactive")}</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-xl">{t("common.cancel")}</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-orange-600 text-white rounded-xl">
            {isEdit ? t("common.update") : t("common.add")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationFormModal;