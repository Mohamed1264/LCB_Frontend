import { Navigate, Outlet } from 'react-router-dom';
import { useMe } from '../hooks/useAuth';
// Permission check will use `useMe()` user tasks
import { PageLoader } from "../components/common/Loading";

const PrivateRoute = ({ permission }) => {
  const { data: user, isLoading } = useMe();

  // derive permission checker from authenticated user's tasks
  const hasPermission = (code) => {
    const codes = user?.tasks?.map((t) => t.code) || [];
    return codes.includes(code);
  };

  if (isLoading) return <PageLoader />;

  // 1. التأكد من أن المستخدم مسجل الدخول
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. التأكد من الصلاحية (اختياري: إذا مررنا permission للـ Route)
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/dashboard" replace />; // تحويله لوجهة آمنة إذا لم يملك الصلاحية
  }

  return <Outlet />;
};

export default PrivateRoute;