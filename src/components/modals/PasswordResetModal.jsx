import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import Modal from "../common/Modal";

const PasswordResetModal = ({ isOpen, onClose, onConfirm, isLoading = false }) => {
  const { t } = useTranslation();
  const [passwords, setPasswords] = useState({
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!passwords.password.trim()) {
      newErrors.password = t("field_required") || "Required";
    } else if (passwords.password.length < 6) {
      newErrors.password = t("password_min_length") || "Password must be at least 6 characters";
    }

    if (!passwords.password_confirmation.trim()) {
      newErrors.password_confirmation = t("field_required") || "Required";
    } else if (passwords.password !== passwords.password_confirmation) {
      newErrors.password_confirmation = t("password_mismatch") || "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await onConfirm({
        password: passwords.password,
      });
      setPasswords({ password: "", password_confirmation: "" });
      setErrors({});
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  };

  const handleClose = () => {
    setPasswords({ password: "", password_confirmation: "" });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t("password_reset_title") || "Reset Password"}
      onConfirm={handleSubmit}
      confirmText={t("password_reset_confirm") || "Reset"}
      cancelText={t("cancel") || "Cancel"}
      isLoading={isLoading}
    >
      <div className="space-y-4 py-4">
        {/* Password field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("password_new") || "New Password"} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={passwords.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={t("password_placeholder") || "Enter new password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
        </div>

        {/* Confirm Password field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("password_confirm") || "Confirm Password"} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="password_confirmation"
              value={passwords.password_confirmation}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.password_confirmation ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={t("password_confirm_placeholder") || "Confirm new password"}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password_confirmation && (
            <p className="mt-1 text-sm text-red-500">{errors.password_confirmation}</p>
          )}
        </div>

        {/* Info message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            {t("password_reset_info") || "The password must be at least 6 characters long"}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PasswordResetModal;
