import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useLogout } from "../../hooks/useAuth";
import { useSidebar } from "../../contexts/SidebarContext";
import Modal from "../common/Modal";
import { LogOut, Globe, AlertTriangle, Menu, X } from "lucide-react";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const logoutMutation = useLogout();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const currentLang = i18n.language?.startsWith("fr") ? "fr" : "ar";
  const isRTL = currentLang === "ar";

  const handleLogoutConfirm = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setIsLogoutModalOpen(false);
        navigate("/login");
      },
    });
  };

  return (
    <>
      <nav
         className={`fixed top-0 w-screen right-0 left-0 h-16 bg-white border-b border-gray-100 shadow-sm z-40 flex items-center justify-between px-6 transition-all duration-300`}
          dir={"rtl"}
      >
        {/* Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title={isCollapsed ? t("sidebar.expand") : t("sidebar.collapse")}
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-0.5 flex shadow-sm">
            <button
              onClick={() => i18n.changeLanguage("ar")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
                currentLang === "ar"
                  ? "bg-orange-600 text-white"
                  : "text-gray-600 hover:bg-white"
              }`}
              title={t("sidebar.language_ar")}
            >
              {t("sidebar.language_ar_short")}
            </button>
            <button
              onClick={() => i18n.changeLanguage("fr")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
                currentLang === "fr"
                  ? "bg-orange-600 text-white"
                  : "text-gray-600 hover:bg-white"
              }`}
              title={t("sidebar.language_fr")}
            >
              {t("sidebar.language_fr_short")}
            </button>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">{t("sidebar.logout")}</span>
          </button>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        title={t("sidebar.logout_title")}
        confirmText={t("sidebar.logout_confirm")}
        isLoading={logoutMutation.isPending}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-3 bg-red-50 rounded-full text-red-500 animate-bounce">
            <AlertTriangle size={32} />
          </div>
          <p className="text-gray-600 font-medium">
            {t("sidebar.logout_message")} <br />
            <span className="text-xs text-gray-400 mt-1 block">
              {t("sidebar.logout_warning")}
            </span>
          </p>
        </div>
      </Modal>
    </>
  );
};

export default Navbar;
