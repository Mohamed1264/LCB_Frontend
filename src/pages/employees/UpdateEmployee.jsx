import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMe } from "../../hooks/useAuth";
import { useEmployees, useUpdateEmployee } from "../../hooks/useEmployees";
import { useJobs } from "../../hooks/useJobs";
import { useLocations } from "../../hooks/useLocations";
import { usePermissions } from "../../hooks/usePermissions";
import { useLayout } from "../../hooks/useLayout";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { CheckCircle, ArrowLeft, AlertCircle, Lock, User, ShieldCheck, ChevronRight } from "lucide-react";
import Modal from "../../components/common/Modal";
import PasswordResetModal from "../../components/modals/PasswordResetModal";
import { partitionPermissions } from "../../utils/permissionGroups";

const UpdateEmployee = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: meData } = useMe();
  const companyId = meData?.user?.company?.id;

  const { data: employees } = useEmployees(companyId);
  const { data: jobs } = useJobs(companyId);
  const { data: locations } = useLocations(companyId);
  const { data: permissions } = usePermissions();
  const updateMutation = useUpdateEmployee();
  const { isRTL, getSidebarPadding } = useLayout();

  // Navigation State
  const [activeTab, setActiveTab] = useState("general"); // "general" or "account"

  const employee = employees?.find((emp) => emp.id === parseInt(id));

  const [formData, setFormData] = useState({
    user: { full_name: "", email: "", phone: "", birth_date: "", gender: "" },
    job_role_id: "",
    location_id: "",
    salary: "",
    salary_type: "",
    status: "active",
    permissions: [],
  });

  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: "", message: "", field: null });

  useEffect(() => {
    if (employee) {
      setFormData({
        user: {
          full_name: employee.user?.full_name || "",
          email: employee.user?.email || "",
          phone: employee.user?.phone || "",
          birth_date: employee.user?.birth_date || "",
          gender: employee.user?.gender || "",
        },
        job_role_id: employee.job_role_id || "",
        location_id: employee.location_id || "",
        salary: employee.salary || "",
        salary_type: employee.salary_type || "",
        status: employee.status || "active",
        permissions: employee.user?.permissions?.map(p => p.id) || [],
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("user_")) {
      const fieldName = name.replace("user_", "");
      setFormData((prev) => ({
        ...prev,
        user: { ...prev.user, [fieldName]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const togglePermission = (permissionId) => {
    setFormData((prev) => {
      const current = prev.permissions || [];
      const updated = current.includes(permissionId)
        ? current.filter(id => id !== permissionId)
        : [...current, permissionId];
      return { ...prev, permissions: updated };
    });
  };

  // Partition permissions into resource groups
  const { groups, others } = partitionPermissions(permissions || []);

  const toggleGroup = (group) => {
    const childIds = group.children.map(c => c.id);
    setFormData(prev => {
      const set = new Set(prev.permissions || []);
      const allSelected = childIds.every(id => set.has(id));
      if (allSelected) {
        childIds.forEach(id => set.delete(id));
      } else {
        childIds.forEach(id => set.add(id));
      }
      return { ...prev, permissions: Array.from(set) };
    });
  };

  const isGroupFullySelected = (group) => {
    const childIds = group.children.map(c => c.id);
    return childIds.every(id => formData.permissions.includes(id));
  };

  const isGroupPartiallySelected = (group) => {
    const childIds = group.children.map(c => c.id);
    const selected = childIds.filter(id => formData.permissions.includes(id)).length;
    return selected > 0 && selected < childIds.length;
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.user.full_name.trim()) newErrors.user_full_name = t("field_required");
    if (!formData.user.email.trim()) newErrors.user_email = t("field_required");
    if (!formData.job_role_id) newErrors.job_role_id = t("field_required");
    if (!formData.salary) newErrors.salary = t("field_required");
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
        // If errors are in general info, switch to general tab
        setActiveTab("general");
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        ...formData.user,
        job_role_id: parseInt(formData.job_role_id),
        location_id: parseInt(formData.location_id),
        salary: parseFloat(formData.salary),
        salary_type: formData.salary_type,
        status: formData.status,
        permissions: formData.permissions
      };

      await updateMutation.mutateAsync({
        companyId,
        id: parseInt(id),
        data: payload,
      });
      setShowSuccess(true);
    } catch (error) {
      setIsErrorModalOpen(true);
      setErrorMessage({
        title: t("employee_update_error"),
        message: error.response?.data?.message || error.message
      });
    }
  };

  if (showSuccess) return <SuccessView t={t} isRTL={isRTL} navigate={navigate} getSidebarPadding={getSidebarPadding} />;

  return (
    <div className="min-h-screen bg-gray-50/50" dir={isRTL ? "rtl" : "ltr"}>
      <Sidebar />
      <Navbar />
      
      <div className={`pt-24 pb-12 transition-all duration-300 ${getSidebarPadding()}`}>
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Header */}
          <div className="mb-8 flex justify-between items-end">
            <div>
              <button onClick={() => navigate("/employees")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600 mb-2 transition-colors">
                <ArrowLeft className="w-4 h-4" /> {t("go_back")}
              </button>
              <h1 className="text-3xl font-bold text-gray-900">{t("employee_edit_title")}</h1>
              <p className="text-gray-500">{t("employee_edit_subtitle")}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Professional Tab Switcher */}
            <div className="flex border-b border-gray-100 bg-gray-50/50">
              <button
                onClick={() => setActiveTab("general")}
                className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-medium transition-all ${
                  activeTab === "general" ? "bg-white text-orange-600 border-b-2 border-orange-500" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <User className="w-5 h-5" />
                {t("employee_info")}
              </button>
              <button
                onClick={() => setActiveTab("account")}
                className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-medium transition-all ${
                  activeTab === "account" ? "bg-white text-orange-600 border-b-2 border-orange-500" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
                {t("employee_account_section")}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              {activeTab === "general" ? (
                /* --- GENERAL INFO TAB --- */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                  <FormInput label={t("employee_full_name")} name="user_full_name" value={formData.user.full_name} onChange={handleChange} error={errors.user_full_name} required />
                  <FormInput label={t("employee_email")} name="user_email" type="email" value={formData.user.email} onChange={handleChange} error={errors.user_email} required />
                  <FormInput label={t("employee_phone")} name="user_phone" value={formData.user.phone} onChange={handleChange} error={errors.user_phone} required />
                  <FormInput label={t("employee_birth_date")} name="user_birth_date" type="date" value={formData.user.birth_date} onChange={handleChange} />
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t("employee_job_role")} *</label>
                    <select name="job_role_id" value={formData.job_role_id} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all">
                      <option value="">{t("employee_select_job_role")}</option>
                      {jobs?.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t("employee_salary")}</label>
                    <div className="relative">
                        <input type="number" name="salary" value={formData.salary} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" />
                        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">MAD</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* --- ACCOUNT & AUTHORIZATION TAB --- */
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                  {/* Credentials Card */}
                  <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6">
                    <h3 className="text-orange-800 font-bold mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5" /> {t("employee_account_section")}
                    </h3>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-orange-700/70">{t("employee_phone")}</p>
                            <p className="text-lg font-semibold text-orange-900">{formData.user.phone || "---"}</p>
                        </div>
                        <button 
                            type="button" 
                            onClick={() => setIsPasswordResetModalOpen(true)}
                            className="bg-white px-5 py-2.5 border border-orange-200 text-orange-600 rounded-xl font-semibold hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                        >
                            {t("password_reset_button")}
                        </button>
                    </div>
                  </div>

                  {/* Permissions Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-600" /> {t("employee_permissions_section")}
                        </h3>
                        <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                            {formData.permissions.length} {t("selected") || "Selected"}
                        </span>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 max-h-[400px] overflow-y-auto">
                      {/* Groups */}
                      <div className="space-y-3 mb-4">
                        {groups.map(group => (
                          <div key={group.key} className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isGroupFullySelected(group)}
                              ref={el => { if (el) el.indeterminate = isGroupPartiallySelected(group); }}
                              onChange={() => toggleGroup(group)}
                              className="w-4 h-4 accent-orange-500"
                            />
                            <button type="button" onClick={() => toggleGroup(group)} className="text-sm font-medium text-gray-800 hover:underline">
                              {t(group.labelKey)}
                            </button>
                            <span className="text-xs text-gray-500">({group.children.length})</span>
                          </div>
                        ))}
                      </div>

                      {/* Other permissions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {others?.map((perm) => (
                          <div 
                              key={perm.id} 
                              onClick={() => togglePermission(perm.id)}
                              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                  formData.permissions.includes(perm.id) 
                                  ? "bg-white border-orange-500 shadow-sm ring-2 ring-orange-500/5" 
                                  : "bg-transparent border-gray-200 hover:border-orange-200"
                              }`}
                          >
                            <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                                formData.permissions.includes(perm.id) ? "bg-orange-500 border-orange-500" : "bg-white border-gray-300"
                            }`}>
                              {formData.permissions.includes(perm.id) && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <span className={`text-sm font-medium ${formData.permissions.includes(perm.id) ? "text-gray-900" : "text-gray-500"}`}>
                              {t(`permissions.${perm.name}`)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Footer */}
              <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col md:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/employees")}
                  className="flex-1 px-6 py-3.5 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-[2] px-6 py-3.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {updateMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  {t("employee_update")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <PasswordResetModal 
        isOpen={isPasswordResetModalOpen} 
        onClose={() => setIsPasswordResetModalOpen(false)} 
        onConfirm={(data) => updateMutation.mutateAsync({ companyId, id, data })} 
      />

      <Modal isOpen={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)} title={errorMessage.title}>
        <div className="text-center p-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">{errorMessage.message}</p>
        </div>
      </Modal>
    </div>
  );
};

// Helper Components for Cleaner Code
const FormInput = ({ label, name, type = "text", value, onChange, error, required }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl transition-all focus:ring-2 focus:ring-orange-500/20 outline-none ${
        error ? "border-red-500" : "border-gray-300 focus:border-orange-500"
      }`}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const SuccessView = ({ t, navigate, isRTL, getSidebarPadding }) => (
  <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
    <Sidebar />
    <div className={`pt-24 transition-all duration-300 ${getSidebarPadding()}`}>
      <div className="max-w-md mx-auto p-6 bg-white rounded-3xl shadow-xl border border-gray-100 text-center animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("employee_update_success_title")}</h2>
        <p className="text-gray-500 mb-8">{t("employee_update_success_message")}</p>
        <button onClick={() => navigate("/employees")} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all">
          {t("go_back_employees")}
        </button>
      </div>
    </div>
  </div>
);

export default UpdateEmployee;