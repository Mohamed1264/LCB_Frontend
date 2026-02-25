import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMe } from "../../hooks/useAuth";
import { useDashboard } from "../../hooks/useDashboard";
import { useLayout } from "../../hooks/useLayout";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { PageLoader } from "../../components/common/Loading";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Package, Users, Truck, AlertCircle, Plus, Eye, Download, RefreshCw,
  User, Mail, Phone, MapPin, Briefcase, TrendingUp, Settings,
  Bell, Calendar, Clock, CheckCircle, XCircle, FileText
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Constants
const PERMISSION_ROUTES = {
  job_view: "/jobs",
  product_view: "/products",
  job_task_view: "/job-tasks",
  employee_view: "/employees",
  shipment_view: "/shipments",
  stock_movement_view: "/stock",
};

// Color mappings
const COLOR_CLASSES = {
  blue: {
    border: "border-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-600",
    hover: "hover:bg-blue-100"
  },
  orange: {
    border: "border-orange-500",
    bg: "bg-orange-50",
    text: "text-orange-600",
    hover: "hover:bg-orange-100"
  },
  green: {
    border: "border-green-500",
    bg: "bg-green-50",
    text: "text-green-600",
    hover: "hover:bg-green-100"
  },
  purple: {
    border: "border-purple-500",
    bg: "bg-purple-50",
    text: "text-purple-600",
    hover: "hover:bg-purple-100"
  },
  red: {
    border: "border-red-500",
    bg: "bg-red-50",
    text: "text-red-600",
    hover: "hover:bg-red-100"
  }
};

// Skeleton Component
const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex justify-between items-center mb-8">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-gray-200 rounded"></div>
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
      </div>
      <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 w-32 bg-gray-300 rounded"></div>
        </div>
      ))}
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-2xl h-80"></div>
      <div className="bg-white p-6 rounded-2xl h-80"></div>
    </div>
  </div>
);

// Error Fallback Component
const ErrorFallback = ({ error, refetch }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center p-8 bg-red-50 rounded-2xl border border-red-200">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <p className="text-red-600 font-medium mb-2">خطأ في تحميل البيانات</p>
      <p className="text-red-500 text-sm mb-4">{error?.message}</p>
      <button
        onClick={() => refetch()}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        إعادة المحاولة
      </button>
    </div>
  </div>
);

// StatCard Component
const StatCard = ({ title, value, icon: Icon, color, trend }) => {
  const colors = COLOR_CLASSES[color];
  
  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border-r-4 ${colors.border} hover:shadow-md transition-all duration-300`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {trend !== undefined && (
            <p className={`text-xs mt-2 flex items-center ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% 
              <span className="text-gray-400 mr-1">مقارنة بالشهر الماضي</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${colors.bg}`}>
            <Icon className={`w-6 h-6 ${colors.text}`} />
          </div>
        )}
      </div>
    </div>
  );
};

// Quick Action Button
const QuickActionButton = ({ onClick, icon: Icon, label, color = "orange" }) => {
  const colors = COLOR_CLASSES[color];
  
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 ${colors.bg} ${colors.text} rounded-lg 
                  ${colors.hover} hover:shadow-sm transition-all duration-200 border ${colors.border}`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

// Permission Badge
const PermissionBadge = ({ task, onClick, hasRoute }) => (
  <button
    onClick={() => hasRoute && onClick(task)}
    disabled={!hasRoute}
    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all 
                ${hasRoute 
                  ? "bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-100 hover:border-orange-300 hover:shadow-sm cursor-pointer transform hover:scale-105" 
                  : "bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed"
                }`}
    title={hasRoute ? `الانتقال إلى ${task.name.replace(/_/g, " ")}` : "غير متاح"}
  >
    {task.name.replace(/_/g, " ")}
  </button>
);

// InfoRow Component
const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
    <span className="text-gray-500 text-sm flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </span>
    <span className="text-gray-800 font-semibold bg-gray-50 px-3 py-1 rounded-lg">
      {value ?? "غير متوفر"}
    </span>
  </div>
);

// Admin Dashboard Overview
const AdminDashboardOverview = ({ companyStats }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard 
        title="إجمالي الموظفين" 
        value={companyStats?.totalEmployees || 0}
        icon={Users}
        color="blue"
        trend={5.2}
      />
      <StatCard 
        title="إجمالي المنتجات" 
        value={companyStats?.totalProducts || 0}
        icon={Package}
        color="green"
        trend={-2.1}
      />
      <StatCard 
        title="إجمالي المواقع" 
        value={companyStats?.totalLocations || 0}
        icon={MapPin}
        color="purple"
        trend={8.3}
      />
      <StatCard 
        title="الأدوار الوظيفية" 
        value={companyStats?.totalJobRoles || 0}
        icon={Briefcase}
        color="orange"
        trend={3.1}
      />
    </div>

    {companyStats?.lowStock > 0 && (
      <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">
            هناك {companyStats.lowStock} منتج على وشك النفاد من المخزون
          </p>
          <button className="mr-auto text-red-600 hover:text-red-700 font-medium text-sm">
            عرض التفاصيل
          </button>
        </div>
      </div>
    )}
  </div>
);

// Main Dashboard Component
const Dashboard = () => {
  const { data, isLoading, isError, error, refetch } = useMe();
  const { getSidebarMargin, isRTL } = useLayout();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [chartData, setChartData] = useState([]);
  const { data: dashboardStats, isLoading: statsLoading } = useDashboard();

  // Safe data access
  const user = data?.user ?? {};
  const employee = data?.employee ?? {};
  const location = data?.location ?? {};
  const tasks = data?.tasks ?? [];

  const isAdmin = user?.role === "admin" || user?.is_superuser;

  // Memoized stats
  const stats = useMemo(() => [
    {
      id: "salary",
      title: "الراتب الشهري",
      value: employee?.salary ? `${employee.salary.toLocaleString()} درهم` : "غير محدد",
      icon: Package,
      color: "blue"
    },
    {
      id: "role",
      title: "الدور الوظيفي",
      value: employee?.job_role?.name || "موظف",
      icon: Users,
      color: "orange"
    },
    {
      id: "permissions",
      title: "الصلاحيات النشطة",
      value: tasks.length,
      icon: Eye,
      color: "green",
      trend: tasks.length > 5 ? 20 : 0
    },
    {
      id: "location",
      title: "الموقع",
      value: location?.name || "المقر الرئيسي",
      icon: MapPin,
      color: "purple"
    }
  ], [employee, tasks, location]);

  // Company stats with proper mapping
  const companyStats = useMemo(() => ({
    totalEmployees: dashboardStats?.employees?.total ?? 0,
    totalProducts: dashboardStats?.products?.total ?? 0,
    activeShipments: dashboardStats?.shipments?.active ?? 0,
    lowStock: dashboardStats?.products?.low_stock ?? 0,
    totalLocations: dashboardStats?.locations?.total ?? 0,
    totalJobRoles: dashboardStats?.job_roles?.total ?? 0,
    activeJobs: dashboardStats?.jobs?.active ?? 0,
    recentActivities: dashboardStats?.recent_activities ?? [
      { id: 1, action: "تم إضافة منتج جديد", time: "منذ 5 دقائق", user: "أحمد" },
      { id: 2, action: "تم تحديث مخزون", time: "منذ 15 دقائق", user: "محمد" },
      { id: 3, action: "شحنة جديدة", time: "منذ 30 دقائق", user: "سارة" }
    ]
  }), [dashboardStats]);

  // Load chart data
  useEffect(() => {
    setChartData([
      { name: 'يناير', value: 400 },
      { name: 'فبراير', value: 300 },
      { name: 'مارس', value: 600 },
      { name: 'إبريل', value: 800 },
      { name: 'مايو', value: 700 },
      { name: 'يونيو', value: 900 },
    ]);
  }, []);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
      toast.success('تم تحديث البيانات بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء التحديث');
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Export handler
  const handleExport = useCallback(() => {
    try {
      const report = {
        user: user?.name,
        company: user?.company?.name,
        date: new Date().toISOString(),
        stats,
        companyStats
      };
      
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('تم تصدير التقرير بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء التصدير');
      console.error('Export error:', error);
    }
  }, [user, stats, companyStats]);

  // Permission check
  const hasPermission = useCallback((code) => 
    tasks.some(t => t.code === code), [tasks]);

  // Navigation handler
  const handlePermissionClick = useCallback((task) => {
    const route = PERMISSION_ROUTES[task.code];
    if (route) {
      navigate(route);
    }
  }, [navigate]);

  // Loading state
  if (isLoading) return <DashboardSkeleton />;
  
  // Error state
  if (isError || !data) {
    return <ErrorFallback error={error} refetch={refetch} />;
  }

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans" dir="rtl">
      <Toaster 
        position={isRTL ? "top-left" : "top-right"}
        toastOptions={{
          style: {
            fontFamily: 'inherit',
          },
        }}
      />
      
      <Sidebar />
      <Navbar />

      <main className={`flex-1 p-8 pt-24 transition-all duration-300 ${getSidebarMargin()}`}>
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              أهلاً بك، {user?.name} 👋
            </h1>
            <p className="text-gray-500 mt-1">
              {isAdmin ? 'نظرة عامة على الشركة' : 'آخر التحديثات'} في {user?.company?.name}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`p-2 bg-white rounded-lg shadow-sm border border-gray-200 
                         hover:bg-gray-50 transition-all ${refreshing ? 'animate-spin' : ''}`}
              aria-label="تحديث"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
            
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg 
                         shadow-sm border border-gray-200 hover:bg-gray-50 transition-all"
              aria-label="تصدير التقرير"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">تصدير التقرير</span>
            </button>
            
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-gray-700">
                {location?.name || "المقر الرئيسي"}
              </span>
            </div>
          </div>
        </header>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {hasPermission("product_add") && (
            <QuickActionButton
              onClick={() => navigate("/products/create")}
              icon={Plus}
              label="إضافة منتج"
              color="green"
            />
          )}
          {hasPermission("employee_view") && (
            <QuickActionButton
              onClick={() => navigate("/employees")}
              icon={Users}
              label="عرض الموظفين"
              color="blue"
            />
          )}
          {hasPermission("shipment_view") && (
            <QuickActionButton
              onClick={() => navigate("/shipments")}
              icon={Truck}
              label="الشحنات"
              color="orange"
            />
          )}
        </div>

        {/* Dashboard Content */}
        {isAdmin ? (
          statsLoading ? (
            <DashboardSkeleton />
          ) : (
            <AdminDashboardOverview companyStats={companyStats} />
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <StatCard key={stat.id} {...stat} />
            ))}
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
              تحليل النشاط الشهري
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    dot={{ fill: '#f97316' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
              تفاصيل الملف الشخصي
            </h3>
            
            <div className="space-y-4">
              <InfoRow label="البريد الإلكتروني" value={user?.email} icon={Mail} />
              <InfoRow label="رقم الهاتف" value={user?.phone} icon={Phone} />
              <InfoRow label="رقم الموظف" value={`#EMP-${employee?.id || '000'}`} icon={User} />
              <InfoRow label="تاريخ الانضمام" value="12 فبراير 2026" icon={Calendar} />
              
              {employee?.department && (
                <InfoRow label="القسم" value={employee.department} icon={Briefcase} />
              )}
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">اكتمال الملف الشخصي</span>
                <span className="text-sm font-semibold text-orange-600">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </section>
        </div>

        {/* Recent Activities */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
            آخر النشاطات
          </h3>
          
          <div className="space-y-4">
            {companyStats.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
                <span className="text-sm text-gray-400">{activity.user}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Permissions Section */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
            الصلاحيات النشطة
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {tasks.slice(0, 20).map((task) => (
              <PermissionBadge
                key={task.id}
                task={task}
                onClick={handlePermissionClick}
                hasRoute={!!PERMISSION_ROUTES[task.code]}
              />
            ))}
            {tasks.length > 20 && (
              <span className="text-gray-400 text-xs self-center">
                +{tasks.length - 20} صلاحية أخرى
              </span>
            )}
          </div>
        </section>

        {/* Debug Section */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-10">
            <summary className="cursor-pointer text-gray-400 text-sm hover:text-gray-600">
              عرض البيانات الخام (JSON)
            </summary>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg mt-2 text-xs text-left overflow-auto max-h-96">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        )}
      </main>
    </div>
  );
};

export default Dashboard;