import api from "./api";

// جلب كل المنتجات للشركة
export const getProductsByCompany = async () => {
  const { data } = await api.get(`/products`);
  return data;
};

// إضافة منتج جديد
export const createProduct = async (productData) => {
  const formData = new FormData();
  formData.append("name", productData.name);
  formData.append("reference", productData.reference);
  formData.append("category_id", productData.category_id);
  formData.append("location_id", productData.location_id);
  // Always append shipment_id, even if null or empty (Laravel will handle null)
  if (productData.shipment_id !== null && productData.shipment_id !== undefined && productData.shipment_id !== "") {
    formData.append("shipment_id", productData.shipment_id);
  }
  formData.append("purchase_price", productData.purchase_price);
  formData.append("price_min", productData.price_min);
  formData.append("price_max", productData.price_max);
  formData.append("currency", productData.currency);
  formData.append("quantity", productData.quantity);
  formData.append("is_local_product", productData.is_local_product ? "1" : "0");
  formData.append("is_rentable", productData.is_rentable ? "1" : "0");
  if (productData.image) {
    formData.append("image", productData.image);
  }
  
  // Append lifecycles as FormData array notation (not JSON string)
  if (productData.lifecycles && productData.lifecycles.length > 0) {
    productData.lifecycles.forEach((lifecycle, index) => {
      if (lifecycle.performed_by) formData.append(`lifecycles[${index}][performed_by]`, lifecycle.performed_by);
      if (lifecycle.stage) formData.append(`lifecycles[${index}][stage]`, lifecycle.stage);
      if (lifecycle.description) formData.append(`lifecycles[${index}][description]`, lifecycle.description);
      if (lifecycle.date) formData.append(`lifecycles[${index}][date]`, lifecycle.date);
    });
  }

  const { data } = await api.post(`/product`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

// تحديث منتج
export const updateProduct = async ( id, productData) => {
  const formData = new FormData();
  formData.append("_method", "PUT"); // Laravel spoofing for PUT
  if (productData.name) formData.append("name", productData.name);
  if (productData.reference) formData.append("reference", productData.reference);
  if (productData.category_id) formData.append("category_id", productData.category_id);
  if (productData.location_id) formData.append("location_id", productData.location_id);
  if (productData.shipment_id !== null && productData.shipment_id !== undefined && productData.shipment_id !== "") {
    formData.append("shipment_id", productData.shipment_id);
  }
  if (productData.purchase_price !== undefined) formData.append("purchase_price", productData.purchase_price);
  if (productData.price_min !== undefined) formData.append("price_min", productData.price_min);
  if (productData.price_max !== undefined) formData.append("price_max", productData.price_max);
  if (productData.currency !== undefined) formData.append("currency", productData.currency);
  if (productData.quantity !== undefined) formData.append("quantity", productData.quantity);
  if (productData.is_local_product !== undefined) formData.append("is_local_product", productData.is_local_product ? "1" : "0");
  if (productData.is_rentable !== undefined) formData.append("is_rentable", productData.is_rentable ? "1" : "0");
  if (productData.image) {
    formData.append("image", productData.image);
  }
  
  // Append lifecycles as FormData array notation
  if (productData.lifecycles && productData.lifecycles.length > 0) {
    productData.lifecycles.forEach((lifecycle, index) => {
      if (lifecycle.performed_by) formData.append(`lifecycles[${index}][performed_by]`, lifecycle.performed_by);
      if (lifecycle.stage) formData.append(`lifecycles[${index}][stage]`, lifecycle.stage);
      if (lifecycle.description) formData.append(`lifecycles[${index}][description]`, lifecycle.description);
      if (lifecycle.date) formData.append(`lifecycles[${index}][date]`, lifecycle.date);
    });
  }

  const { data } = await api.post(`/product/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

// حذف منتج
export const deleteProduct = async ( id) => {
  const { data } = await api.delete(`/product/${id}`);
  return data;
};
