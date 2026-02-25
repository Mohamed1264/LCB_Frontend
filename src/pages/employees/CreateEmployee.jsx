import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMe } from "../../hooks/useAuth";
import { useJobs } from "../../hooks/useJobs";
import { useLocations } from "../../hooks/useLocations";
import { usePermissions } from "../../hooks/usePermissions";
import { useCreateEmployee } from "../../hooks/useEmployees";
import { useLayout } from "../../hooks/useLayout";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { 
  CheckCircle, 
  ArrowLeft, 
  AlertCircle, 
  Plus, 
  UserPlus, 
  Shield, 
  Briefcase, 
  MapPin, 
  Wallet,
  Calendar,
  Mail,
  Phone,
  User,
  Lock
} from "lucide-react";
import Modal from "../../components/common/Modal";
import { partitionPermissions } from "../../utils/permissionGroups";

const CreateEmployee = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: meData } = useMe();
  const companyId = meData?.user?.company?.id;
  
  const { data: jobs } = useJobs(companyId);
  const { data: locations } = useLocations(companyId);
  const { data: permissions } = usePermissions();
  const createMutation = useCreateEmployee();
  const { isRTL, getSidebarPadding } = useLayout();

  const isSubmitting = createMutation?.isPending || createMutation?.isLoading;

  const [formData, setFormData] = useState({
    user: {
      full_name: "",
      email: "",
      phone: "",
      password: "",
      password_confirmation: "",
      birth_date: "",
      gender: "",
    },
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
  const [errorMessage, setErrorMessage] = useState({ title: "", message: "", field: null });
  const [showAccount, setShowAccount] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("user_")) {
      const fieldName = name.replace("user_", "");
      setFormData(prev => ({
        ...prev,
        user: { ...prev.user, [fieldName]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const togglePermission = (permissionId) => {
    setFormData((prev) => {
      const set = new Set(prev.permissions || []);
      if (set.has(permissionId)) set.delete(permissionId);
      else set.add(permissionId);
      return { ...prev, permissions: Array.from(set) };
    });
  };

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
    if (!formData.user.phone.trim()) newErrors.user_phone = t("field_required");
    if (!formData.user.gender) newErrors.user_gender = t("field_required");
    if (!formData.job_role_id) newErrors.job_role_id = t("field_required");
    if (!formData.location_id) newErrors.location_id = t("field_required");
    if (!formData.salary_type) newErrors.salary_type = t("field_required");
    
    if (showAccount) {
      if (!formData.user.email.trim()) {
        newErrors.user_email = t("field_required");
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user.email)) {
        newErrors.user_email = t("login_phone_invalid");
      }
      
      if (!formData.user.password.trim() || formData.user.password.length < 6) {
        newErrors.user_password = t("login_password_min");
      }

      if (formData.user.password !== formData.user.password_confirmation) {
        newErrors.user_password_confirmation = t("passwords_dont_match") || "Passwords do not match";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        full_name: formData.user.full_name,
        phone: formData.user.phone,
        gender: formData.user.gender,
        birth_date: formData.user.birth_date || null,
        job_role_id: parseInt(formData.job_role_id),
        location_id: parseInt(formData.location_id),
        salary: parseFloat(formData.salary),
        salary_type: formData.salary_type,
        status: formData.status,
        company_id: companyId,
        email: showAccount ? formData.user.email : null,
        password: showAccount ? formData.user.password : null,
        permissions: showAccount ? formData.permissions : [],
      };

      await createMutation.mutateAsync(payload);
      setShowSuccess(true);
    } catch (error) {
      const errorData = error.response?.data;
      setErrorMessage({
        title: errorData?.message || t("login_error"),
        message: errorData?.details || t("login_error"),
        field: errorData?.field || null,
      });
      setIsErrorModalOpen(true);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
        <Sidebar />
        <Navbar />
        <div className={`pt-24 transition-all duration-300 ${getSidebarPadding()}`}>
          <div className="max-w-2xl mx-auto p-6 text-center">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("employee_success_title")}</h2>
              <p className="text-gray-600 mb-10 text-lg">{t("employee_success_message")}</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => window.location.reload()} 
                  className="flex-1 px-6 py-4 border border-gray-200 rounded-2xl flex items-center justify-center gap-2 font-semibold hover:bg-gray-50"
                >
                  <Plus className="w-5 h-5" /> {t("employee_add_another")}
                </button>
                <button 
                  onClick={() => navigate("/employees")} 
                  className="flex-1 px-6 py-4 bg-orange-500 text-white rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-orange-600"
                >
                  <ArrowLeft className="w-5 h-5" /> {t("go_back_employees")}
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
      <div className={`pt-24 pb-12 transition-all duration-300 ${getSidebarPadding()}`}>
        <div className="max-w-5xl mx-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t("employee_create_title")}</h1>
                    <p className="text-gray-500 text-sm">{t("employee_create_subtitle")}</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  
                  {/* Left Column: Personal Info */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                      <User className="w-5 h-5 text-orange-500" />
                      {t("employee_profile_info") || "Personal Information"}
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("employee_full_name")} *</label>
                        <input 
                          type="text" name="user_full_name" value={formData.user.full_name} onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-xl border ${errors.user_full_name ? 'border-red-500' : 'border-gray-200'}`}
                          placeholder={t("employee_full_name_placeholder")}
                        />
                        {errors.user_full_name && <p className="text-red-500 text-xs mt-1">{errors.user_full_name}</p>}
                      </div>

                      {/* Phone and Email row */}
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("employee_phone")} *</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                              type="tel" name="user_phone" value={formData.user.phone} onChange={handleChange}
                              placeholder="0600000000" // Added placeholder here
                              className={`w-full ps-10 pe-4 py-3 rounded-xl border ${errors.user_phone ? 'border-red-500' : 'border-gray-200'}`}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("employee_email")}</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                              type="email" name="user_email" value={formData.user.email} onChange={handleChange}
                              className={`w-full ps-10 pe-4 py-3 rounded-xl border ${errors.user_email ? 'border-red-500' : 'border-gray-200'}`}
                              placeholder="mail@example.com"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("employee_gender")} *</label>
                          <select 
                            name="user_gender" value={formData.user.gender} onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-xl border ${errors.user_gender ? 'border-red-500' : 'border-gray-200'}`}
                          >
                            <option value="">{t("employee_select_gender")}</option>
                            <option value="male">{t("employee_gender_male")}</option>
                            <option value="female">{t("employee_gender_female")}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("employee_birth_date")}</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                              type="date" name="user_birth_date" value={formData.user.birth_date} onChange={handleChange}
                              className="w-full ps-10 pe-4 py-3 rounded-xl border border-gray-200"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Job Info */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                      <Briefcase className="w-5 h-5 text-orange-500" />
                      {t("sidebar.jobs")}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("employee_job_role")} *</label>
                        <select 
                          name="job_role_id" value={formData.job_role_id} onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-xl border ${errors.job_role_id ? 'border-red-500' : 'border-gray-200'}`}
                        >
                          <option value="">{t("employee_select_job_role")}</option>
                          {jobs?.map(job => <option key={job.id} value={job.id}>{job.name}</option>)}
                        </select>
                      </div>

                      {/* Location is now here, under the Phone/Mail level */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("employee_location")} *</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <select 
                            name="location_id" value={formData.location_id} onChange={handleChange}
                            className={`w-full ps-10 pe-4 py-3 rounded-xl border ${errors.location_id ? 'border-red-500' : 'border-gray-200'}`}
                          >
                            <option value="">{t("employee_select_location")}</option>
                            {locations?.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("employee_salary")} *</label>
                          <div className="relative">
                             <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                             <input 
                               type="number" name="salary" value={formData.salary} onChange={handleChange}
                               className={`w-full ps-10 pe-4 py-3 rounded-xl border ${errors.salary ? 'border-red-500' : 'border-gray-200'}`}
                             />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("employee_salary_type")} *</label>
                          <select 
                            name="salary_type" value={formData.salary_type} onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-xl border ${errors.salary_type ? 'border-red-500' : 'border-gray-200'}`}
                          >
                            <option value="">{t("employee_select_salary_type")}</option>
                            <option value="mois">{t("employee_salary_type_mois")}</option>
                            <option value="semaine">{t("employee_salary_type_semaine")}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Toggle Section */}
                <div className="mt-12 bg-orange-50/50 rounded-3xl p-8 border border-orange-100">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <Shield className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{t("employee_add_account")}</h4>
                        <p className="text-sm text-gray-500">{t("login_welcome")}</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setShowAccount(!showAccount)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all focus:outline-none ${showAccount ? 'bg-orange-500' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${showAccount ? (isRTL ? '-translate-x-6' : 'translate-x-6') : (isRTL ? '-translate-x-1' : 'translate-x-1')}`} />
                    </button>
                  </div>

                  {showAccount && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-top-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("employee_password")} *</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                              type="password" name="user_password" value={formData.user.password} onChange={handleChange}
                              className={`w-full ps-10 pe-4 py-3 rounded-xl border ${errors.user_password ? 'border-red-500' : 'border-gray-200'}`}
                            />
                          </div>
                          {errors.user_password && <p className="text-red-500 text-xs mt-1">{errors.user_password}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("password_confirm_placeholder") || "Confirm Password"} *</label>
                          <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                              type="password" name="user_password_confirmation" value={formData.user.password_confirmation} onChange={handleChange}
                              className={`w-full ps-10 pe-4 py-3 rounded-xl border ${errors.user_password_confirmation ? 'border-red-500' : 'border-gray-200'}`}
                            />
                          </div>
                          {errors.user_password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.user_password_confirmation}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">{t("employee_permissions")}</label>
                        {/* Render groups first */}
                        <div className="space-y-3 mb-3">
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
                            </div>
                          ))}

                          {/* Render remaining standalone permissions */}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {others?.map((perm) => (
                            <label key={perm.id} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${formData.permissions.includes(perm.id) ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                              <input 
                                type="checkbox" checked={formData.permissions.includes(perm.id)} 
                                onChange={() => togglePermission(perm.id)} className="w-4 h-4 accent-orange-500" 
                              />
                              <span className="text-xs font-medium truncate">{t(`permissions.${perm.name}`, perm.name)}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex gap-4">
                <button type="button" onClick={() => navigate("/employees")} className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-white transition-all">
                  {t("cancel")}
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-200 disabled:opacity-50 transition-all">
                  {isSubmitting ? t("login_loading") : t("employee_create")}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Modal isOpen={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)} title={errorMessage.title}>
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-800 font-bold mb-2">{errorMessage.title}</p>
          <p className="text-sm text-gray-500 leading-relaxed">{errorMessage.message}</p>
        </div>
      </Modal>
    </div>
  );
};

export default CreateEmployee;