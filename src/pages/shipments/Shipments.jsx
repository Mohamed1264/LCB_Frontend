import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMe } from "../../hooks/useAuth";
import { useShipments, useDeleteShipment } from "../../hooks/useShipments";
import { useLayout } from "../../hooks/useLayout";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import Modal from "../../components/common/Modal";
import { PageLoader } from "../../components/common/Loading";
import PermissionGate from "../../routes/PermissionGate";
import {
  Trash2,
  Edit,
  Plus,
  Package,
  Search,
  DollarSign,
  LayoutGrid,
  Table,
  Calendar,
  User,
  Truck,
} from "lucide-react";

const IMAGE_BASE_URL = "http://127.0.0.1:8000/images/shipments/";

const Shipments = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: meData, isLoading: isLoadingMe } = useMe();
  const companyId = meData?.user?.company?.id;

  const { data: shipments, isLoading: isLoadingShipments } =
    useShipments(companyId);

  const deleteMutation = useDeleteShipment();
  const { currentLang, getSidebarMargin } = useLayout();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [viewMode, setViewMode] = useState(
    localStorage.getItem("shipmentsView") || "grid"
  );

  useEffect(() => {
    localStorage.setItem("shipmentsView", viewMode);
  }, [viewMode]);

  const filteredShipments = useMemo(() => {
    if (!shipments) return [];
    return shipments.filter((shipment) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        shipment.reference?.toLowerCase().includes(searchLower) ||
        shipment.supplier?.name?.toLowerCase().includes(searchLower) ||
        shipment.createdBy?.user?.full_name?.toLowerCase().includes(searchLower)
      );
    });
  }, [shipments, searchTerm]);

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

  if (isLoadingMe || isLoadingShipments) return <PageLoader />;

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans" dir={currentLang === "ar" ? "rtl" : "ltr"}>
      <Sidebar />
      <Navbar />

      <main className={`flex-1 p-6 pt-24 transition-all duration-300 ${getSidebarMargin()}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-black text-gray-800">
            {t("shipments.title")} ({filteredShipments?.length || 0})
          </h1>

          <div className="flex items-center gap-3">
            <PermissionGate permission="shipment_add">
              <button 
                onClick={() => navigate("/shipments/create")}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
              >
                <Plus size={18} /> {t("shipments.add")}
              </button>
            </PermissionGate>
            <button
              onClick={() => navigate("/suppliers")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all shadow-sm"
            >
              <User size={18} /> {t("suppliers.title") || "الموردون"}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search
            className={`absolute ${currentLang === "ar" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 text-gray-400`}
            size={16}
          />
          <input
            type="text"
            placeholder={t("shipments.search_placeholder")}
            className={`w-full ${currentLang === "ar" ? "pr-10 pl-4" : "pl-10 pr-4"} py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all shadow-sm`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 justify-end mb-6">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1 ${
              viewMode === "grid"
                ? "bg-orange-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <LayoutGrid size={14} />
            {t("shipments.view_grid")}
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1 ${
              viewMode === "table"
                ? "bg-orange-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Table size={14} />
            {t("shipments.view_table")}
          </button>
        </div>

        {/* GRID VIEW */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredShipments.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Package className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500 font-medium">
                  {t("shipments.empty")}
                </p>
              </div>
            ) : (
              filteredShipments.map((shipment) => {
                const imageUrl = shipment.bon_image
                  ? IMAGE_BASE_URL + shipment.bon_image
                  : "/default_image.png";

                return (
                  <div
                    key={shipment.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
                  >
                    {/* IMAGE */}
                    <div className="relative h-48 bg-gray-100">
                      {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={shipment.reference}
                        className="w-full h-full object-cover"
                      />) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Package size={24} className="text-gray-400" />
                        </div>
                      )}

                      <span className="absolute top-3 right-3 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full">
                        #{shipment.reference}
                      </span>
                    </div>

                    {/* CONTENT */}
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-black text-gray-800 text-sm mb-1">
                            {shipment.reference}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                            <Truck size={12} />
                            <span>{shipment.supplier?.name || "-"}</span>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <PermissionGate permission="shipment_edit">
                            <button 
                              onClick={() => navigate(`/shipments/edit/${shipment.id}`)}
                              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md"
                            >
                              <Edit size={14} />
                            </button>
                          </PermissionGate>
                          <PermissionGate permission="shipment_delete">
                            <button
                              onClick={() => {
                                setSelectedId(shipment.id);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"
                            >
                              <Trash2 size={14} />
                            </button>
                          </PermissionGate>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-orange-600 font-bold text-sm mb-3">
                        <DollarSign size={14} />
                        {shipment.total_cost} {t("shipments.currency")}
                      </div>

                      <div className="text-xs text-gray-600 space-y-1 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-gray-400" />
                          <span>
                            {new Date(shipment.date).toLocaleDateString(
                              currentLang === "ar" ? "ar-EG" : "fr-FR",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User size={12} className="text-gray-400" />
                          <span>
                            {t("shipments.created_by")}:{" "}
                            {shipment.createdBy?.user?.full_name || "-"}
                          </span>
                        </div>
                        {shipment.products && shipment.products.length > 0 && (
                          <div>
                            <span className="font-semibold">
                              {t("shipments.products_count")}:
                            </span>{" "}
                            {shipment.products.length}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr className={`text-${currentLang === "ar" ? "right" : "left"}`}>
                  <th className="p-3 justify-start font-bold">{t("shipments.table.reference")}</th>
                  <th className="p-3 font-bold">{t("shipments.table.date")}</th>
                  <th className="p-3 font-bold">{t("shipments.table.supplier")}</th>
                  <th className="p-3 font-bold">{t("shipments.table.total_cost")}</th>
                  <th className="p-3 font-bold">{t("shipments.table.created_by")}</th>
                  <th className="p-3 font-bold">{t("shipments.table.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-400">
                      {t("shipments.empty")}
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map((shipment) => (
                    <tr
                      key={shipment.id}
                      className="border-t border-gray-100 hover:bg-orange-50 transition"
                    >
                      <td className="p-3 font-bold text-gray-800">
                        {shipment.reference}
                      </td>
                      <td className="p-3 text-gray-500">
                        {new Date(shipment.date).toLocaleDateString(
                          currentLang === "ar" ? "ar-EG" : "fr-FR",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </td>
                      <td className="p-3 text-gray-500">
                        {shipment.supplier?.name || "-"}
                      </td>
                      <td className="p-3 font-semibold text-gray-700">
                        {shipment.total_cost} {t("shipments.currency")}
                      </td>
                      <td className="p-3 text-gray-500">
                        {shipment.createdBy?.user?.full_name || "-"}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <PermissionGate permission="shipment_edit">
                            <button 
                              onClick={() => navigate(`/shipments/edit/${shipment.id}`)}
                              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md"
                            >
                              <Edit size={14} />
                            </button>
                          </PermissionGate>
                          <PermissionGate permission="shipment_delete">
                            <button
                              onClick={() => {
                                setSelectedId(shipment.id);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"
                            >
                              <Trash2 size={14} />
                            </button>
                          </PermissionGate>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedId(null);
        }}
        onConfirm={handleDelete}
        title={t("shipments.delete.title")}
        confirmText={t("shipments.delete.confirm")}
        isLoading={deleteMutation.isPending}
      >
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {t("shipments.delete.message")}{" "}
            <span className="font-bold text-red-600">
              "{shipments?.find((s) => s.id === selectedId)?.reference}"
            </span>
            {t("shipments.delete.question")}
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Shipments;
