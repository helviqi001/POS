import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import SimpleLayout from './layouts/simple';
//
import BlogPage from './pages/BlogPage';
import LoginPage from './pages/LoginPage';
import Page404 from './pages/Page404';
import SalesPage from './pages/salePage';
import DashboardAppPage from './pages/DashboardAppPage';
import Createuser from './sections/@dashboard/user/createform';
import ProductPage from './pages/ProductsPage';
import CreateProduct from './sections/@dashboard/product/createform';
import SupplierPage from './pages/SupplierPage';
import CategoryPage from './pages/CategoryPage';
import UnitPage from './pages/UnitPage';
import RestockPage from './pages/RestockPage';
import CreateRestock from './sections/@dashboard/restock/createform';
import EditRestock from './sections/@dashboard/restock/editForm';
import ReturnPage from './pages/ReturnPage';
import CreateReturn from './sections/@dashboard/return/createform';
import EditReturn from './sections/@dashboard/return/editForm';
import CustomerPage from './pages/CutomerPage';
import StaffPage from './pages/staffPage';
import PositionPage from './pages/PositionPage';
import PosPage from './pages/PosPage';


// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      path: '/dashboard',
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" />},
        { path: 'app', element: <DashboardAppPage /> },
        { path: 'user', element: <CustomerPage /> },
        { path: 'sales', element: <SalesPage />},
        { path: 'pos', element: <PosPage/>},
        { path: 'staff', element: <StaffPage />},
        { path: 'position', element: <PositionPage />},
        {path: 'createuser' , element:<Createuser/>},
        {path: 'createProduct' , element:<CreateProduct/>},
        { path: 'blog', element: <BlogPage /> },
        { path: 'products', element: <ProductPage /> },
        { path: 'supplier', element: <SupplierPage /> },
        { path: 'category', element: <CategoryPage /> },
        { path: 'unit', element: <UnitPage /> },
        { path: 'restock', element: <RestockPage />},
        { path: 'return', element: <ReturnPage />},
        {path:'restock/create', element:<CreateRestock/>},
        {path:'restock/edit', element:<EditRestock/>},
        {path:'returns/create', element:<CreateReturn/>},
        {path:'returns/edit', element:<EditReturn/>},
      ],
    },
    {
      path: '/',
      element: <LoginPage />,
    },
    {
      element: <SimpleLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" />},
        { path: '404', element: <Page404 /> },
        { path: '*', element: <Navigate to="/404" /> },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
