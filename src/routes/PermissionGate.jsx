import React from 'react';
import { PageLoader } from "../components/common/Loading";
import { useMe } from '../hooks/useAuth';


// ✅ تصدير المكون (Export) ضروري باش نخدموا بيه فبلايص خرين
const PermissionGate = ({ children, permission, fallback = null }) => {
  const { data: user, isLoading } = useMe();

  if (isLoading) return <PageLoader />;

  const hasPermission = (code) => {
    const codes = user?.tasks?.map((t) => t.code) || [];
    return codes.includes(code);
  };

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return fallback;
};

export default PermissionGate;