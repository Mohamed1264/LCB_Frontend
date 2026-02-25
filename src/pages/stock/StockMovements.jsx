import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMe } from "../../hooks/useAuth";
import {
  useStockMovements,
  useDeleteStockMovement,
} from "../../hooks/useStockMovements";
import { useLayout } from "../../hooks/useLayout";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import Modal from "../../components/common/Modal";
import { PageLoader } from "../../components/common/Loading";
import {
  Trash2,
  Edit,
  Package,
  Search,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Truck,
  Table,
  List,
  Calendar,
  User,
  MapPin,
} from "lucide-react";

const StockMovements = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: meData, isLoading: isLoadingMe } = useMe();
  const companyId = meData?.user?.company?.id;

  const { data: stockMovements, isLoading: isLoadingMovements } =
    useStockMovements(companyId);

  const deleteMutation = useDeleteStockMovement();
  const { currentLang, getSidebarMargin } = useLayout();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState(
    localStorage.getItem("stockMovementsView") || "table"
  );

  useEffect(() => {
    localStorage.setItem("stockMovementsView", viewMode);
  }, [viewMode]);

  const filteredMovements = useMemo(() => {
    if (!stockMovements) return [];

    return stockMovements.filter((movement) => {
      const searchLower = searchTerm.toLowerCase();

      return (
        movement.product?.name?.toLowerCase()?.includes(searchLower) ||
        movement.reference?.toLowerCase()?.includes(searchLower) ||
        movement.type?.toLowerCase()?.includes(searchLower) ||
        movement.location?.name?.toLowerCase()?.includes(searchLower) ||
        movement.createdBy?.user?.full_name
          ?.toLowerCase()
          ?.includes(searchLower)
      );
    });
  }, [stockMovements, searchTerm]);

  const handleDelete = () => {
    if (!selectedId) return;

    deleteMutation.mutate(
      { companyId, id: selectedId },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setSelectedId(null);
        },
      }
    );
  };

  const getMovementTypeIcon = (type) => {
    switch (type) {
      case "in":
        return <ArrowUp className="text-green-500" size={16} />;
      case "out_sale":
        return <ArrowDown className="text-red-500" size={16} />;
      case "out_rental":
        return <Truck className="text-blue-500" size={16} />;
      case "in_return":
        return <RotateCcw className="text-purple-500" size={16} />;
      default:
        return <Package className="text-gray-500" size={16} />;
    }
  };

  const getMovementTypeLabel = (type) => {
    return t(`stock_movements.types.${type}`) || type;
  };

  const getMovementTypeColor = (type) => {
    switch (type) {
      case "in":
        return "bg-green-50 text-green-600";
      case "out_sale":
        return "bg-red-50 text-red-600";
      case "out_rental":
        return "bg-blue-50 text-blue-600";
      case "in_return":
        return "bg-purple-50 text-purple-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  console.log(filteredMovements);
  
  if (isLoadingMe || isLoadingMovements) return <PageLoader />;

  return (
    <div
      className="flex bg-gray-50 min-h-screen font-sans"
      dir={currentLang === "ar" ? "rtl" : "ltr"}
    >
      <Sidebar />
      <Navbar />

      <main
        className={`flex-1 p-6 pt-24 transition-all duration-300 ${getSidebarMargin()}`}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-black text-gray-800">
            {t("stock_movements.title")} ({filteredMovements.length})
          </h1>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search
            className={`absolute ${
              currentLang === "ar" ? "right-3" : "left-3"
            } top-1/2 -translate-y-1/2 text-gray-400`}
            size={16}
          />
          <input
            type="text"
            placeholder={t("stock_movements.search_placeholder")}
            className={`w-full ${
              currentLang === "ar" ? "pr-10 pl-4" : "pl-10 pr-4"
            } py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all shadow-sm`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* TABLE VIEW */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-start" >
              <tr>
                <th className={`p-3 font-bold ${
    currentLang === "ar" ? "text-right" : "text-left"
  }`}>{t("stock_movements.table.product")}</th>
                <th className={`p-3 font-bold ${
                 currentLang === "ar" ? "text-right" : "text-left"
               }`}>{t("stock_movements.table.type")}</th>
                <th className={`p-3 font-bold ${
                 currentLang === "ar" ? "text-right" : "text-left"
               }`}>{t("stock_movements.table.quantity")}</th>
                <th className={`p-3 font-bold ${
                 currentLang === "ar" ? "text-right" : "text-left"
               }`}>{t("stock_movements.table.location")}</th>
                <th className={`p-3 font-bold ${
                 currentLang === "ar" ? "text-right" : "text-left"
               }`}>{t("stock_movements.table.employee")}</th>
                <th className={`p-3 font-bold ${
                 currentLang === "ar" ? "text-right" : "text-left"
               }`}>{t("stock_movements.table.date")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400">
                    {t("stock_movements.empty")}
                  </td>
                </tr>
              ) : (
                filteredMovements.map((movement) => (
                  <tr
                    key={movement.id}
                    className="border-t border-gray-100 hover:bg-orange-50 transition"
                  >
                    <td className="p-3">
                      <div className="font-bold text-gray-800">
                        {movement.product?.name || "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        #{movement.product?.reference || "-"}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getMovementTypeIcon(movement.type)}
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-md ${getMovementTypeColor(
                            movement.type
                          )}`}
                        >
                          {getMovementTypeLabel(movement.type)}
                        </span>
                      </div>
                    </td>

                    <td className="p-3 font-semibold text-gray-700">
                      {movement.quantity}
                    </td>

                    <td className="p-3 text-gray-500">
                      {movement.location?.name || "-"}
                    </td>

                    <td className="p-3 text-gray-500">
                      {movement.created_by?.user?.full_name || "-"}
                    </td>

                    <td className="p-3 text-gray-500">
                      {movement.created_at
                        ? new Date(movement.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedId(null);
        }}
        onConfirm={handleDelete}
        title={t("stock_movements.delete.title")}
        confirmText={t("stock_movements.delete.confirm")}
        isLoading={deleteMutation.isPending}
      >
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {t("stock_movements.delete.message")}{" "}
            <span className="font-bold text-red-600">
              "
              {
                stockMovements?.find((m) => m.id === selectedId)?.product?.name
              }
              "
            </span>
            {t("stock_movements.delete.question")}
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default StockMovements;