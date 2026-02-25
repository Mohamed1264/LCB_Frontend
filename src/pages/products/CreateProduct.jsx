import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMe } from "../../hooks/useAuth";
import { useCategories } from "../../hooks/useCategories";
import { useShipments } from "../../hooks/useShipments";
import { useEmployees } from "../../hooks/useEmployees";
import { useCreateProduct } from "../../hooks/useProducts";
import { useLayout } from "../../hooks/useLayout";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { PageLoader } from "../../components/common/Loading";
import { Upload, X, CheckCircle, Plus, ArrowLeft, User, Calendar, Trash2, AlertCircle } from "lucide-react";
import Modal from "../../components/common/Modal";

const CreateProduct = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shipmentIdFromQuery = searchParams.get("shipment_id");
  const createdByFromQuery = searchParams.get("created_by");

  const { data: meData, isLoading: isLoadingMe } = useMe();
  const companyId = meData?.user?.company?.id;
  console.log(companyId);
  
  const { data: categories, isLoading: isLoadingCategories } =
    useCategories(companyId);
  const { data: shipments, isLoading: isLoadingShipments } =
    useShipments(companyId);
  const { data: employees, isLoading: isLoadingEmployees } =
    useEmployees(companyId);
  const createMutation = useCreateProduct();
  const { currentLang, isRTL, getSidebarPadding } = useLayout();

  const [formData, setFormData] = useState({
    name: "",
    reference: "",
    category_id: "",
    shipment_id: shipmentIdFromQuery || "",
    location_id: "",
    price_min: "",
    price_max: "",
    purchase_price: "",
    currency: "MAD",
    quantity: "",
    is_local_product: true,
    is_rentable: false,
    image: null,
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lifecycles, setLifecycles] = useState([]);
  const [isLifecycleModalOpen, setIsLifecycleModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: "", message: "", field: null });
  const [currentLifecycle, setCurrentLifecycle] = useState({
    performed_by: "",
    stage: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Update shipment_id when query param changes
  useEffect(() => {
    if (shipmentIdFromQuery) {
      setFormData((prev) => ({ ...prev, shipment_id: shipmentIdFromQuery }));
    }
  }, [shipmentIdFromQuery]);

  // Auto-populate lifecycle with shipment creator info
  useEffect(() => {
    if (createdByFromQuery && employees?.length > 0) {
      const defaultStage = t("shipment_received") || "استلام الشحنة";
      setLifecycles([{
        id: Date.now(),
        performed_by: createdByFromQuery,
        stage: defaultStage,
        description: t("shipment_received_description") || "تم استلام الشحنة من المورد",
        date: new Date().toISOString().split("T")[0],
      }]);
    }
  }, [createdByFromQuery, employees, t]);

  // Auto-populate location_id from employee's location
  useEffect(() => {
    if (meData?.employee?.location_id) {
      setFormData((prev) => ({ ...prev, location_id: meData.employee.location_id }));
    }
  }, [meData?.employee?.location_id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = t("field_required");
    }
    if (!formData.reference.trim()) {
      newErrors.reference = t("field_required");
    }
    if (!formData.category_id) {
      newErrors.category_id = t("field_required");
    }
    if (!formData.purchase_price || parseFloat(formData.purchase_price) <= 0) {
      newErrors.purchase_price = t("product_purchase_price_invalid");
    }
    if (!formData.price_min || parseFloat(formData.price_min) < 0) {
      newErrors.price_min = t("product_price_invalid");
    }
    if (!formData.price_max || parseFloat(formData.price_max) < 0) {
      newErrors.price_max = t("product_price_invalid");
    }
    if (
      parseFloat(formData.price_min) > parseFloat(formData.price_max)
    ) {
      newErrors.price_max = t("product_price_max_error");
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = t("product_quantity_invalid");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddLifecycle = () => {
    if (!currentLifecycle.performed_by || !currentLifecycle.stage) {
      return;
    }
    setLifecycles([...lifecycles, { ...currentLifecycle, id: Date.now() }]);
    setCurrentLifecycle({
      performed_by: "",
      stage: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
    setIsLifecycleModalOpen(false);
  };

  const handleRemoveLifecycle = (id) => {
    setLifecycles(lifecycles.filter((lc) => lc.id !== id));
  };

  const handleSubmit = async (e) => {
    console.log(formData);
    e.preventDefault();
    if (!validate()) return;

    try {
      const productData = {
        ...formData,
        shipment_id: formData.shipment_id || null,
        price_min: parseFloat(formData.price_min),
        price_max: parseFloat(formData.price_max),
        purchase_price: parseFloat(formData.purchase_price),
        quantity: parseInt(formData.quantity),
        lifecycles: lifecycles.map((lc) => ({
          performed_by: parseInt(lc.performed_by),
          stage: lc.stage,
          description: lc.description,
          date: lc.date,
        })),
      };

      await createMutation.mutateAsync(productData);
      setShowSuccess(true);
    } catch (error) {
      console.error("Error creating product:", error);
      const errorData = error.response?.data;
      
      // Show error modal with specific error message
      if (errorData) {
        setErrorMessage({
          title: errorData.message || t("product_create_error") || "خطأ في إنشاء المنتج",
          message: errorData.details || errorData.message || t("product_create_error") || "حدث خطأ أثناء إنشاء المنتج",
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
          title: t("product_create_error") || "خطأ في إنشاء المنتج",
          message: error.message || t("product_create_error") || "حدث خطأ أثناء إنشاء المنتج",
          field: null,
        });
        setIsErrorModalOpen(true);
      }
    }
  };

  const handleAddAnother = () => {
    setShowSuccess(false);
    setFormData({
      name: "",
      reference: "",
      category_id: "",
      shipment_id: shipmentIdFromQuery || "",
      price_min: "",
      price_max: "",
      purchase_price: "",
      currency: "MAD",
      quantity: "",
      is_local_product: true,
      is_rentable: false,
      image: null,
    });
    setImagePreview(null);
    setErrors({});
    setLifecycles([]);
  };

  const handleGoBack = () => {
    navigate("/products");
  };

  

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
                {t("product_success_title")}
              </h2>
              <p className="text-gray-600 mb-8">
                {t("product_success_message")}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleAddAnother}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  {t("product_add_another")}
                </button>
                <button
                  onClick={handleGoBack}
                  className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  {t("product_go_back")}
                </button>
              </div>
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
        className={`pt-24 ${
          isRTL ? "pr-64" : "pl-64"
        } transition-all duration-300`}
      >
        <div className="max-w-3xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("product_create_title")}
            </h1>
            <p className="text-gray-600 mb-6">
              {t("product_create_subtitle")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("product_name")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={t("product_name_placeholder")}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Reference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("product_reference")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.reference ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={t("product_reference_placeholder")}
                />
                {errors.reference && (
                  <p className="mt-1 text-sm text-red-500">{errors.reference}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("product_category")} <span className="text-red-500">*</span>
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.category_id ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">{t("product_select_category")}</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="mt-1 text-sm text-red-500">{errors.category_id}</p>
                )}
              </div>

              {/* Shipment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("product_shipment")} {shipmentIdFromQuery && (
                    <span className="text-sm text-gray-500">
                      ({t("product_shipment_prefilled")})
                    </span>
                  )}
                </label>
                <select
                  name="shipment_id"
                  value={formData.shipment_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={!!shipmentIdFromQuery}
                >
                  <option value="">{t("product_no_shipment")}</option>
                  {shipments?.map((shipment) => (
                    <option key={shipment.id} value={shipment.id}>
                      {shipment.reference} - {new Date(shipment.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                {shipmentIdFromQuery && (
                  <p className="mt-1 text-sm text-gray-500">
                    {t("product_shipment_locked")}
                  </p>
                )}
              </div>

              {/* Price Min */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("product_price_min")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price_min"
                  value={formData.price_min}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.price_min ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={t("product_price_min_placeholder")}
                />
                {errors.price_min && (
                  <p className="mt-1 text-sm text-red-500">{errors.price_min}</p>
                )}
              </div>

              {/* Price Max */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("product_price_max")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price_max"
                  value={formData.price_max}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.price_max ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={t("product_price_max_placeholder")}
                />
                {errors.price_max && (
                  <p className="mt-1 text-sm text-red-500">{errors.price_max}</p>
                )}
              </div>

              {/* Purchase Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("product_purchase_price")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="purchase_price"
                  value={formData.purchase_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.purchase_price ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={t("product_purchase_price_placeholder")}
                />
                {errors.purchase_price && (
                  <p className="mt-1 text-sm text-red-500">{errors.purchase_price}</p>
                )}
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("product_currency")} <span className="text-red-500">*</span>
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="MAD">{t("currency_mad")}</option>
                  <option value="USD">{t("currency_usd")}</option>
                  <option value="CNY">{t("currency_cny")}</option>
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("product_quantity")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  step="1"
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.quantity ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={t("product_quantity_placeholder")}
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>
                )}
              </div>

              {/* Checkboxes */}
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="is_local_product"
                    checked={formData.is_local_product}
                    onChange={handleChange}
                    className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {t("product_is_local")}
                  </span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="is_rentable"
                    checked={formData.is_rentable}
                    onChange={handleChange}
                    className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {t("product_is_rentable")}
                  </span>
                </label>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("product_image")}
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
                        <span className="font-semibold">{t("product_click_to_upload")}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("product_image_format")}
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

              {/* Product Lifecycle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("product_lifecycle") || "دورة حياة المنتج"}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                  {lifecycles.map((lifecycle) => {
                    const employee = employees?.find((emp) => emp.id === parseInt(lifecycle.performed_by));
                    return (
                      <div
                        key={lifecycle.id}
                        className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start justify-between gap-2"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User size={14} className="text-orange-600" />
                            <span className="text-sm font-bold text-orange-800">
                              {employee?.user?.full_name || employee?.user?.name || "موظف"}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-orange-700 mb-1">
                            {lifecycle.stage}
                          </p>
                          {lifecycle.description && (
                            <p className="text-xs text-orange-600 mb-1">
                              {lifecycle.description}
                            </p>
                          )}
                          <div className="flex items-center gap-1 text-xs text-orange-500">
                            <Calendar size={12} />
                            <span>{new Date(lifecycle.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLifecycle(lifecycle.id)}
                          className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setIsLifecycleModalOpen(true)}
                    className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:bg-gray-100 hover:border-orange-400 transition-colors min-h-[100px]"
                  >
                    <Plus className="w-6 h-6 text-gray-400" />
                    <span className="text-xs font-medium text-gray-600">
                      {t("add_lifecycle") || "إضافة مرحلة"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Lifecycle Modal */}
              {isLifecycleModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      {t("add_lifecycle") || "إضافة مرحلة في دورة الحياة"}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("employee") || "الموظف"} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={currentLifecycle.performed_by}
                          onChange={(e) =>
                            setCurrentLifecycle({
                              ...currentLifecycle,
                              performed_by: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="">{t("select_employee") || "اختر الموظف"}</option>
                          {employees?.map((employee) => (
                            <option key={employee.id} value={employee.id}>
                              {employee.user?.full_name || employee.user?.name || `Employee ${employee.id}`}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("stage") || "المرحلة"} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={currentLifecycle.stage}
                          onChange={(e) =>
                            setCurrentLifecycle({
                              ...currentLifecycle,
                              stage: e.target.value,
                            })
                          }
                          placeholder={t("stage_placeholder") || "مثال: استلام المنتج"}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("description") || "الوصف"}
                        </label>
                        <textarea
                          value={currentLifecycle.description}
                          onChange={(e) =>
                            setCurrentLifecycle({
                              ...currentLifecycle,
                              description: e.target.value,
                            })
                          }
                          placeholder={t("description_placeholder") || "وصف إضافي..."}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("date") || "التاريخ"}
                        </label>
                        <input
                          type="date"
                          value={currentLifecycle.date}
                          onChange={(e) =>
                            setCurrentLifecycle({
                              ...currentLifecycle,
                              date: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setIsLifecycleModalOpen(false);
                          setCurrentLifecycle({
                            performed_by: "",
                            stage: "",
                            description: "",
                            date: new Date().toISOString().split("T")[0],
                          });
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {t("cancel")}
                      </button>
                      <button
                        type="button"
                        onClick={handleAddLifecycle}
                        disabled={!currentLifecycle.performed_by || !currentLifecycle.stage}
                        className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {t("add") || "إضافة"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/products")}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {createMutation.isPending
                    ? t("product_creating")
                    : t("product_create")}
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

export default CreateProduct;
