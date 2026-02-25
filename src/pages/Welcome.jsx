import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMe } from "../hooks/useAuth";
import { Sparkles, Box, User, CheckCircle } from "lucide-react";
import { PageLoader } from "../components/common/Loading";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import { useLayout } from "../hooks/useLayout";

const Welcome = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data, isLoading } = useMe();
  const { getSidebarMargin, currentLang } = useLayout();

  if (isLoading) return <PageLoader />;

  const user = data?.user;
  const fullName = user?.name || t("welcome.user");

  // Extract permission codes
  const permissions = useMemo(() => {
    return new Set(data?.tasks?.map((task) => task.code) || []);
  }, [data]);

  console.log(permissions);
  
  // All possible quick actions (reactive to language change)
  const allActions = useMemo(
    () => [
      {
        permission: "product_view",
        title: t("welcome.quick_actions.products"),
        description: t("welcome.quick_actions.products_desc"),
        icon: Box,
        path: "/products",
        color: "from-green-500 to-emerald-600",
      },
      {
        permission: "employee_view",
        title: t("welcome.quick_actions.employees"),
        description: t("welcome.quick_actions.employees_desc"),
        icon: User,
        path: "/employees",
        color: "from-blue-500 to-indigo-600",
      },
      {
        permission: "shipment_view",
        title: t("welcome.quick_actions.shipments"),
        description: t("welcome.quick_actions.shipments_desc"),
        icon: Sparkles,
        path: "/shipments",
        color: "from-orange-500 to-orange-600",
      },
    ],
    [t]
  );

  // Filter by permission + limit to 2
  const quickActions = useMemo(() => {
    return allActions
      .filter((action) => permissions.has(action.permission))
      .slice(0, 2);
  }, [permissions, allActions]);

  return (
    <div
      className="flex bg-gray-50 min-h-screen"
      dir={currentLang === "ar" ? "rtl" : "ltr"}
    >
      <Sidebar />
      <Navbar />

      <div
        className={`flex-1 transition-all duration-300 ${getSidebarMargin()}`}
      >
        <div className="pt-28 px-6 pb-10 max-w-6xl mx-auto">
          {/* ===== Welcome Header ===== */}
          <div className="mb-12 text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <CheckCircle className="w-10 h-10 text-orange-600" />
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              {t("welcome.greeting")}
              <span className="block bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                {fullName}
              </span>
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("welcome.message")}
            </p>
          </div>

          {/* ===== Quick Actions ===== */}
          {quickActions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              {quickActions.map((action, index) => {
                const Icon = action.icon;

                return (
                  <button
                    key={index}
                    onClick={() => navigate(action.path)}
                    className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-10 transition duration-300`}
                    />

                    <div className="relative flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center text-white shadow-md`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100 mb-12">
              <p className="text-gray-500">
                {t("welcome.no_permissions")}
              </p>
            </div>
          )}

          {/* ===== Footer ===== */}
          <div className="mt-10 text-center">
            <p className="text-gray-500 text-sm">
              {t("welcome.footer")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;