// src/components/Auth/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t, i18n } = useTranslation();
  const [credentials, setCredentials] = useState({ phone: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { mutate: loginMutate, isPending } = useLogin();

  const validateField = (name, value) => {
    if (!value) return `${name === "phone" ? t("login_phone_label") : t("login_password_label")} ${t("field_required")}`;
    if (name === "phone" && !/^[0-9+\-\s()]{10,15}$/.test(value)) return t("login_phone_invalid");
    if (name === "password" && value.length < 6) return t("login_password_min");
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const phoneError = validateField("phone", credentials.phone);
    const passwordError = validateField("password", credentials.password);
    setErrors({ phone: phoneError, password: passwordError });
    setTouched({ phone: true, password: true });
    if (phoneError || passwordError) return;

    loginMutate(credentials, {
      onSuccess: () => {
        toast.success(`✅ ${t("login_success")}`);
        navigate("/welcome", { replace: true });
      },
      onError: (error) => {
        // Prefer server-provided message when available
        const serverMessage = error?.response?.data?.message || error?.message;
        toast.error(`❌ ${serverMessage || t("login_error")}`);
        // also set field-level errors if backend returned validation errors
        const errors = error?.response?.data?.errors;
        if (errors) {
          const fieldErrors = {};
          if (errors.phone) fieldErrors.phone = errors.phone[0];
          if (errors.password) fieldErrors.password = errors.password[0];
          setErrors(prev => ({ ...prev, ...fieldErrors }));
        }
      }
    });
  };

  const currentLang = i18n.language?.startsWith("fr") ? "fr" : "ar";

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 font-sans px-4"
      dir={currentLang === "ar" ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-md">
        {/* Brand + language switch */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t("login_brand")}</h1>
          <div className="inline-flex rounded-full border border-gray-200 bg-white shadow-sm text-xs font-medium overflow-hidden">
            <button
              type="button"
              onClick={() => i18n.changeLanguage("ar")}
              className={`px-3 py-1 transition ${currentLang === "ar" ? "bg-orange-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              العربية
            </button>
            <button
              type="button"
              onClick={() => i18n.changeLanguage("fr")}
              className={`px-3 py-1 border-s-l border-gray-200 transition ${currentLang === "fr" ? "bg-orange-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              Français
            </button>
          </div>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t("login_phone_label")}</label>
                <input
                  type="tel"
                  name="phone"
                  value={credentials.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={t("login_phone_placeholder")}
                  disabled={isPending}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition ${
                    errors.phone && touched.phone
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                  } shadow-sm`}
                />
                {errors.phone && touched.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t("login_password_label")}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={t("login_password_placeholder")}
                    disabled={isPending}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition ${
                      errors.password && touched.password
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                    } shadow-sm`}
                  />
                 
                </div>
                {errors.password && touched.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isPending}
                className={`w-full py-3 px-6 rounded-xl font-semibold text-white shadow-md transition-all duration-200 ${
                  isPending
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5"
                }`}
              >
                {isPending ? t("login_loading") : t("login_submit")}
              </button>
              {/* information Erreur */
              
              }
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
