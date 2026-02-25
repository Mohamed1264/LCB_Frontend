import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMe, useLogout } from "../../hooks/useAuth";
import { useSidebar } from "../../contexts/SidebarContext";
// removed unused import: usePermissions


import { 
  LayoutDashboard, Box, Users, Truck, LogOut, 
  Settings, ChevronLeft, ChevronRight, MapPin, ShieldCheck , Home
} from "lucide-react";
import { Tag } from "lucide-react";

const Sidebar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const logoutMutation = useLogout();
  const { data } = useMe();
  const { isCollapsed } = useSidebar();
  
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const currentLang = i18n.language?.startsWith("fr") ? "fr" : "ar";

  // Determine chevron direction based on language
  const ChevronIcon = currentLang === "fr" ? ChevronRight : ChevronLeft;

  // Extract permissions from tasks
  const userPermissions = useMemo(() => {
    return data?.tasks?.map((t) => t.code) || [];
  }, [data]);

  // Menu configuration with translation keys
  const menuConfig = [
    { 
      name: t("sidebar.home"), 
      path: "/", 
      icon: <Home size={20}/>, 
      permission: null
    },
    { 
      name: t("sidebar.jobs"), 
      path: "/jobs", 
      icon: <ShieldCheck size={20}/>, 
      permission: "job_view" 
    },
    { 
      name: t("sidebar.products"), 
      path: "/products", 
      icon: <Box size={20}/>, 
      permission: "product_view" 
    },
    {
      name: t("sidebar.job_tasks"),
      path:"/job-tasks",
      icon:<Settings size={20}/>,
      permission:"job_task_view" 
    },
    { 
      name: t("sidebar.employees"), 
      path: "/employees", 
      icon: <Users size={20}/>, 
      permission: "employee_view" 
    },
    { 
      name: t("sidebar.shipments"), 
      path: "/shipments", 
      icon: <Truck size={20}/>, 
      permission: "shipment_view" 
    },
    { 
      name: t("sidebar.suppliers"), 
      path: "/suppliers", 
      icon: <Truck size={20}/>, 
      permission: "supplier_view" 
    },
    { 
      name: t("sidebar.categories"), 
      path: "/categories", 
      icon: <Tag size={20}/>, 
      permission: "category_view" 
    },
    { 
      name: t("sidebar.stock"), 
      path: "/stock", 
      icon: <MapPin size={20}/>, 
      permission: "stock_movement_view" 
    },
    {
      name: t("sidebar.MissionRepairs"),
      path: "/mission-repairs",
      icon: <ShieldCheck size={20}/>,
      permission: "mission_repair_view"
    },
    {
      name: t("sidebar.technicalMissions"),
      path: "/technical-missions",
      icon: <Truck size={20}/>,
      permission: "technical_mission_view"
    },      {
      name: t("sidebar.locations"),
      path: "/locations",
      icon: <MapPin size={20}/>,
      permission: "location_view"
    }
  ];

  // Filter menu based on permissions
  const filteredMenu = menuConfig.filter(item => 
    !item.permission || userPermissions.includes(item.permission)
  );

 

  return (
    <div
      className={`mt-16 bg-white h-screen flex flex-col fixed top-0 z-50 shadow-sm transition-all duration-300
        ${isCollapsed ? "w-20" : "w-60"}
        ${currentLang === "ar"
          ? "right-0 border-l border-gray-100"
          : "left-0 border-r border-gray-100"
        }`}
      dir={currentLang === "ar" ? "rtl" : "ltr"}
    >
     

      {isCollapsed && (
        <div className="p-4 border-b border-gray-50 flex justify-center">
          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white font-black text-xs">FMP</div>
        </div>
      )}

      {/* Navigation */}
      <nav className={`flex-1 py-6 space-y-1 overflow-y-auto ${isCollapsed ? "px-2" : "px-4"}`}>
        {filteredMenu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.name : ""}
            className={`flex items-center rounded-xl transition-all duration-200 group ${
              isCollapsed ? "justify-center p-3" : "justify-between p-3"
            } ${
              location.pathname === item.path 
              ? "bg-orange-600 text-white shadow-md shadow-orange-100" 
              : "text-gray-500 hover:bg-gray-50 hover:text-orange-600"
            }`}
          >
            <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
              <span className={location.pathname === item.path ? "text-white" : "text-gray-400 group-hover:text-orange-600"}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="font-bold text-sm">{item.name}</span>
              )}
            </div>
            {!isCollapsed && location.pathname === item.path && <ChevronIcon size={16} />}
          </Link>
        ))}
      </nav>


     

     
    </div>
  );
};

export default Sidebar;