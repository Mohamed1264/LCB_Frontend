import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMe } from "../../hooks/useAuth";
import { useSuppliers } from "../../hooks/useSuppliers";
import { useEmployees } from "../../hooks/useEmployees";
import { useShipments, useUpdateShipment } from "../../hooks/useShipments";
import { useLayout } from "../../hooks/useLayout";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { PageLoader } from "../../components/common/Loading";
import { Upload, X, CheckCircle, ArrowLeft, AlertCircle } from "lucide-react";
import Modal from "../../components/common/Modal";

const IMAGE_BASE_URL = "http://127.0.0.1:8000/images/shipments/";

const UpdateShipment = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: meData, isLoading: isLoadingMe } = useMe();
  const companyId = meData?.user?.company?.id;
  const userId = meData?.user?.id;

  const { data: suppliers, isLoading: isLoadingSuppliers } =
    useSuppliers(companyId);
  const { data: employees, isLoading: isLoadingEmployees } =
    useEmployees(companyId);
  const { data: shipments, isLoading: isLoadingShipments } = useShipments(companyId);
  const updateMutation = useUpdateShipment();
  const { currentLang, isRTL, getSidebarPadding } = useLayout();

  const shipment = shipments?.find((s) => s.id === parseInt(id));

  const [formData, setFormData] = useState({
    reference: "",
    date: new Date().toISOString().split("T")[0],
    total_cost: "",
    supplier_id: "",
    created_by: "",
    bon_image: null,
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasNewImage, setHasNewImage] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: "", message: "", field: null });

  // Load shipment data when available
  useEffect(() => {
    if (shipment) {
      setFormData({
        reference: shipment.reference || "",
        date: shipment.date ? new Date(shipment.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        total_cost: shipment.total_cost || "",
        supplier_id: shipment.supplier_id || "",
        created_by: shipment.created_by || "",
        bon_image: null,
      });
      // Set image preview if shipment has an image
      if (shipment.bon_image) {
        setImagePreview(IMAGE_BASE_URL + shipment.bon_image);
      }
    }
  }, [shipment]);

  // Find the employee ID for the current user
  useEffect(() => {
    if (employees && userId && !formData.created_by) {
      const employee = employees.find((emp) => emp.user_id === userId);
      if (employee) {
        setFormData((prev) => ({ ...prev, created_by: employee.id }));
      }
    }
  }, [employees, userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, bon_image: file }));
      setHasNewImage(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, bon_image: null }));
    setHasNewImage(false);
    // Restore original image if exists
    if (shipment?.bon_image) {
      setImagePreview(IMAGE_BASE_URL + shipment.bon_image);
    } else {
      setImagePreview(null);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.reference.trim()) {
      newErrors.reference = t("field_required");
    }
    if (!formData.date) {
      newErrors.date = t("field_required");
    }
    if (!formData.total_cost || parseFloat(formData.total_cost) <= 0) {
      newErrors.total_cost = t("shipment_cost_invalid");
    }
    if (!formData.supplier_id) {
      newErrors.supplier_id = t("field_required");
    }
    if (!formData.created_by) {
      newErrors.created_by = t("field_required");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const shipmentData = {
        ...formData,
        total_cost: parseFloat(formData.total_cost),
        // Only include image if a new one was selected
        bon_image: hasNewImage ? formData.bon_image : undefined,
      };

      await updateMutation.mutateAsync({ companyId, id, data: shipmentData });
      setShowSuccess(true);
    } catch (error) {
      console.error("Error updating shipment:", error);
      const errorData = error.response?.data;
      
      // Show error modal with specific error message
      if (errorData) {
        setErrorMessage({
          title: errorData.message || t("shipment_update_error") || "خطأ في تحديث الشحنة",
          message: errorData.details || errorData.message || t("shipment_update_error") || "حدث خطأ أثناء تحديث الشحنة",
          field: errorData.field || null,
        });
        setIsErrorModalOpen(true);
        
        // If there's a specific field error, highlight it
        if (errorData.field) {
          setErrors((prev) => ({
            ...prev,
            [errorData.field]: errorData.details || errorData.message,
          }));
        }
      } else {
        setErrorMessage({
          title: t("shipment_update_error") || "خطأ في تحديث الشحنة",
          message: error.message || t("shipment_update_error") || "حدث خطأ أثناء تحديث الشحنة",
          field: null,
        });
        setIsErrorModalOpen(true);
      }
    }
  };

  const handleGoBack = () => {
    navigate("/shipments");
  };

  if (isLoadingMe || isLoadingSuppliers || isLoadingEmployees || isLoadingShipments) {
    return <PageLoader />;
  }

  if (!shipment) {
    return (
      <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
        <Sidebar />
        <Navbar />
        <div className={`pt-24 transition-all duration-300 ${getSidebarPadding()}`}>
          <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <p className="text-gray-600">{t("shipment_not_found")}</p>
              <button
                onClick={handleGoBack}
                className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                {t("go_back")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
        <Sidebar />
        <Navbar />
        <div
          className={`pt-24 transition-all duration-300 ${getSidebarPadding()}`}
        >
          <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t("shipment_update_success_title")}
              </h2>
              <p className="text-gray-600 mb-8">
                {t("shipment_update_success_message")}
              </p>
              <button
                onClick={handleGoBack}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <ArrowLeft className="w-5 h-5" />
                {t("shipment_go_back")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      <Sidebar />
      <Navbar />
      <div
        className={`pt-24 transition-all duration-300 ${getSidebarPadding()}`}
      >
        <div className="max-w-3xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("shipment_update_title")}
            </h1>
            <p className="text-gray-600 mb-6">
              {t("shipment_update_subtitle")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Reference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("shipment_reference")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.reference ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={t("shipment_reference_placeholder")}
                />
                {errors.reference && (
                  <p className="mt-1 text-sm text-red-500">{errors.reference}</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("shipment_date")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.date ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-500">{errors.date}</p>
                )}
              </div>

              {/* Total Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("shipment_total_cost")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="total_cost"
                  value={formData.total_cost}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.total_cost ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={t("shipment_total_cost_placeholder")}
                />
                {errors.total_cost && (
                  <p className="mt-1 text-sm text-red-500">{errors.total_cost}</p>
                )}
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("shipment_supplier")} <span className="text-red-500">*</span>
                </label>
                <select
                  name="supplier_id"
                  value={formData.supplier_id}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.supplier_id ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">{t("shipment_select_supplier")}</option>
                  {suppliers?.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
                {errors.supplier_id && (
                  <p className="mt-1 text-sm text-red-500">{errors.supplier_id}</p>
                )}
              </div>

              {/* Created By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("shipment_created_by")} <span className="text-red-500">*</span>
                </label>
                <select
                  name="created_by"
                  value={formData.created_by}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.created_by ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">{t("shipment_select_employee")}</option>
                  {employees?.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.user?.full_name || `Employee ${employee.id}`}
                    </option>
                  ))}
                </select>
                {errors.created_by && (
                  <p className="mt-1 text-sm text-red-500">{errors.created_by}</p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("shipment_bon_image")}
                </label>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">{t("shipment_click_to_upload")}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("shipment_image_format")}
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/shipments")}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updateMutation.isPending
                    ? t("shipment_updating")
                    : t("shipment_update")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      <Modal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title={errorMessage.title || "خطأ"}
        onConfirm={() => setIsErrorModalOpen(false)}
        confirmText="حسناً"
      >
        <div className="text-center py-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <p className="text-gray-700 font-medium mb-2">{errorMessage.title}</p>
          <p className="text-sm text-gray-600">{errorMessage.message}</p>
          {errorMessage.field && (
            <p className="text-xs text-orange-600 mt-3 font-semibold">
              يرجى تصحيح حقل: {errorMessage.field === "reference" ? "رقم المرجع" : errorMessage.field}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default UpdateShipment;
