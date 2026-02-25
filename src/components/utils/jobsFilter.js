/**
 * دالة لفلترة الأدوار الوظيفية بناءً على نص البحث
 * @param {Array} roles - مصفوفة الأدوار القادمة من السيرفر
 * @param {string} searchTerm - كلمة البحث
 * @returns {Array} - المصفوفة المفلترة
 */
export const filterJobs = (roles, searchTerm) => {
  if (!searchTerm) return roles;
  
  const term = searchTerm.toLowerCase();
  
  return roles?.filter((role) => {
    return (
      role.name?.toLowerCase().includes(term) ||
      role.description?.toLowerCase().includes(term) ||
      role.company?.email?.toLowerCase().includes(term) ||
      role.company?.phone?.includes(term)
    );
  });
};