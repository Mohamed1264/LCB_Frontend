import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocations, useDeleteLocation } from "../../hooks/useLocations";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { PageLoader } from "../../components/common/Loading";
import { Plus, Search, Edit, Trash2, Circle } from "lucide-react";
import LocationFormModal from "../../components/forms/LocationFormModal";
import Modal from "../../components/common/Modal";
import PermissionGate from "../../routes/PermissionGate";
import { useLayout } from "../../hooks/useLayout";

const Locations = () => {
  const { t } = useTranslation();
  const { data: locations, isLoading } = useLocations();
  const deleteMutation = useDeleteLocation();
  const { currentLang, getSidebarMargin } = useLayout();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const filteredLocations = useMemo(() => {
    if (!locations) return [];
    return locations.filter(
      (loc) =>
        loc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (loc.address || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [locations, searchTerm]);

  const handleDelete = () => {
    if (!selectedLocation) return;
    deleteMutation.mutate(selectedLocation.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedLocation(null);
      },
    });
  };

  if (isLoading) return <PageLoader />;

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
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-black text-gray-800">
            {t("locations.title")} ({filteredLocations?.length || 0})
          </h1>

          <PermissionGate permission="location_add">
            <button
              onClick={() => {
                setSelectedLocation(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
            >
              <Plus size={16} /> {t("locations.actions.add")}
            </button>
          </PermissionGate>
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
            placeholder={t("locations.search_placeholder")}
            className={`w-full ${
              currentLang === "ar" ? "pr-10 pl-4" : "pl-10 pr-4"
            } py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none shadow-sm`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm table-auto">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-center">{t("locations.table.name")}</th>
                <th className="px-4 py-3 text-center">{t("locations.table.address")}</th>
                <th className="px-4 py-3 text-center">{t("locations.table.status")}</th>
                <th className="px-4 py-3 text-center">{t("locations.table.actions")}</th>
              </tr>
            </thead>

            <tbody>
              {filteredLocations?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
                    {t("locations.empty")}
                  </td>
                </tr>
              ) : (
                filteredLocations.map((loc) => (
                  <tr key={loc.id} className="border-t hover:bg-orange-50/40 transition">
                    <td className="px-4 py-3 font-bold text-center text-gray-800">{loc.name}</td>

                    <td className="px-4 py-3 text-center text-gray-500 max-w-xs truncate">
                      {loc.address || t("locations.no_address")}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center gap-2 text-center justify-center">
                        <Circle
                          size={8}
                          className={
                            loc.status === "active"
                              ? "fill-green-500 text-green-500"
                              : "fill-gray-400 text-gray-400"
                          }
                        />
                        <span className="text-xs font-bold">
                          {loc.status === "active"
                            ? t("locations.status.active")
                            : t("locations.status.inactive")}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <PermissionGate permission="location_edit">
                          <button
                            onClick={() => {
                              setSelectedLocation(loc);
                              setIsFormOpen(true);
                            }}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit size={16} />
                          </button>
                        </PermissionGate>

                        <PermissionGate permission="location_delete">
                          <button
                            onClick={() => {
                              setSelectedLocation(loc);
                              setIsDeleteOpen(true);
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={16} />
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
      </main>

      {/* Form Modal */}
      <LocationFormModal
        key={selectedLocation?.id || "new"}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        location={selectedLocation}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedLocation(null);
        }}
        onConfirm={handleDelete}
        title={t("locations.delete.title")}
        confirmText={t("locations.delete.confirm")}
        isLoading={deleteMutation.isPending}
      >
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {t("locations.delete.message")}{" "}
            <span className="font-bold text-red-600">
              {selectedLocation?.name}
            </span>
            ?
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {t("locations.delete.warning")}
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Locations;