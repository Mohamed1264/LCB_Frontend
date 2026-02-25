import { useSidebar } from "../contexts/SidebarContext";
import { useTranslation } from "react-i18next";

export const useLayout = () => {
  const { isCollapsed } = useSidebar();
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith("fr") ? "fr" : "ar";
  const isRTL = currentLang === "ar";

  const getSidebarMargin = () => {
    if (isCollapsed) {
      return isRTL ? "mr-20" : "ml-20";
    }
    return isRTL ? "mr-64" : "ml-64";
  };

  const getSidebarPadding = () => {
    if (isCollapsed) {
      return isRTL ? "pr-20" : "pl-20";
    }
    return isRTL ? "pr-64" : "pl-64";
  };

  return {
    isCollapsed,
    currentLang,
    isRTL,
    getSidebarMargin,
    getSidebarPadding,
  };
};
