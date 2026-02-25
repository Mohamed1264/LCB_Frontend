import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

// Pages (نفترض أنك أنشأتها)
import Welcome from '../pages/Welcome';
import Login from '../pages/auth/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import JobRoles from '../pages/jobs/JobRoles';
import NotFound from '../pages/NotFound';
import Products from '../pages/products/product';
import ProductStart from '../pages/products/ProductStart';
import CreateProduct from '../pages/products/CreateProduct';
import UpdateProduct from '../pages/products/UpdateProduct';
import Shipments from '../pages/shipments/Shipments';
import CreateShipment from '../pages/shipments/CreateShipment';
import UpdateShipment from '../pages/shipments/UpdateShipment';
import Employees from '../pages/employees/Employees';
import CreateEmployee from '../pages/employees/CreateEmployee';
import UpdateEmployee from '../pages/employees/UpdateEmployee';
// import ProductList from '../pages/inventory/ProductList';
// import EmployeeList from '../pages/employees/EmployeeList';
// import ShipmentManager from '../pages/inventory/ShipmentManager';

import Suppliers from '../pages/suppliers/Suppliers';
import CreateSupplier from '../pages/suppliers/CreateSupplier';
import EditSupplier from '../pages/suppliers/EditSupplier';
import SupplierProfile from '../pages/suppliers/SupplierProfile';
import Categories from '../pages/categories/Categories';
import CreateCategory from '../pages/categories/CreateCategory';
import EditCategory from '../pages/categories/EditCategory';
import StockMovements from '../pages/stock/StockMovements';

import JobTasks from '../pages/jobTasks/JobTasks';
import Locations from '../pages/locations/Locations';
import MissionRepairs from '../pages/missionRepairs/MissionRepairs';
import TechnicalMissions from '../pages/technicalMissions/TechnicalMissions';
const AppRoutes = () => {
  return (
    <Routes>
      {/* المسارات العامة */}
      <Route path="/" element={<Welcome />}  />
      <Route path="/login" element={<Login />} />

      {/* المسارات المحمية - تحتاج تسجيل دخول فقط */}
      <Route element={<PrivateRoute />}>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      <Route element={<PrivateRoute permission="job_view" />}>
        <Route path="/jobs" element={<JobRoles />} />
      </Route>
      <Route element={<PrivateRoute permission="product_view" />}>
        <Route path="/products" element={<Products />} />
      </Route>
      
      <Route element={<PrivateRoute permission="product_add" />}>
        <Route path="/products/start" element={<ProductStart />} />
        <Route path="/products/create" element={<CreateProduct />} />
      </Route>
      
      <Route element={<PrivateRoute permission="product_view" />}>
        <Route path="/products/edit/:id" element={<UpdateProduct />} />
      </Route>
      
      <Route element={<PrivateRoute permission="shipment_view" />}>
        <Route path="/shipments" element={<Shipments />} />
      </Route>
      
      <Route element={<PrivateRoute permission="shipment_add" />}>
        <Route path="/shipments/create" element={<CreateShipment />} />
      </Route>
      
      <Route element={<PrivateRoute permission="shipment_view" />}>
        <Route path="/shipments/edit/:id" element={<UpdateShipment />} />
      </Route>

      <Route element={<PrivateRoute permission="job_task_view" />}>
        <Route path="/job-tasks" element={<JobTasks />} />
      </Route>

      <Route element={<PrivateRoute permission="suplier_view" />}>
        <Route path="/suppliers" element={<Suppliers />} />
      </Route>

      <Route element={<PrivateRoute permission="category_view" />}>
        <Route path="/categories" element={<Categories />} />
      </Route>

      <Route element={<PrivateRoute permission="category_add" />}>
        <Route path="/categories/create" element={<CreateCategory />} />
      </Route>

      <Route element={<PrivateRoute permission="category_edit" />}>
        <Route path="/categories/edit/:id" element={<EditCategory />} />
      </Route>

      <Route element={<PrivateRoute permission="suplier_add" />}>
        <Route path="/suppliers/create" element={<CreateSupplier />} />
      </Route>

      <Route element={<PrivateRoute permission="suplier_edit" />}>
        <Route path="/suppliers/edit/:id" element={<EditSupplier />} />
      </Route>
      <Route element={<PrivateRoute permission="suplier_view" />}>
        <Route path="/suppliers/profile/:id" element={<SupplierProfile />} />
      </Route>
      <Route element={<PrivateRoute permission="employee_view" />}>
        <Route path="/employees" element={<Employees />} />
      </Route>
      
      <Route element={<PrivateRoute permission="employee_add" />}>
        <Route path="/employees/create" element={<CreateEmployee />} />
      </Route>
      
      <Route element={<PrivateRoute permission="employee_view" />}>
        <Route path="/employees/:id/edit" element={<UpdateEmployee />} />
      </Route>

      <Route element={<PrivateRoute permission="stock_movement_view" />}>
        <Route path="/stock" element={<StockMovements />} />
      </Route>

<Route element={<PrivateRoute permission="location_view" />}>
        <Route path="/locations" element={<Locations />} />
      </Route>
      <Route element={<PrivateRoute permission="job_task_view" />}>
        <Route path="/job-tasks" element={<JobTasks />} />
      </Route>
      <Route element={<PrivateRoute permission="technical_mission_view" />}>
        <Route path="/technical-missions" element={<TechnicalMissions />} />
      </Route>

      <Route element={<PrivateRoute permission="mission_repair_view" />}>
        <Route path="/mission-repairs" element={<MissionRepairs />} />
      </Route>
      

      {/* التوجيه التلقائي */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;