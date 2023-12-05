import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import SimpleLayout from './layouts/simple';
//
import BlogPage from './pages/BlogPage';
import LoginPage from './pages/LoginPage';
import Page404 from './pages/Page404';
import DashboardAppPage from './pages/DashboardAppPage';
import ProductPage from './pages/ProductsPage';
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
import PositionPage from './pages/PositionPage';
import PosPage from './pages/PosPage';
import DebitPage from './pages/DebitPage';
import StaffPage from './pages/staffPage';
import FleetPage from './pages/fleetPage';
import DeliveryPage from './pages/deliveryPage';
import HistoryDeliveryPage from './pages/historyDeliveryPage';
import InvoicePage from './pages/invoicePage';
import TransactionPage from './pages/transactionPage';
import DepositPage from './pages/depositPage';
import CreatePosition from './sections/@dashboard/position/createPage';
import EditPosition from './sections/@dashboard/position/editPage';
import UserPage from './pages/UserPage';
import SettingPage from './pages/Setting';
import ProfilePage from './pages/ProfilePage';


// ----------------------------------------------------------------------

export default function Router() {
  const baseUrl = process.env.PUBLIC_URL
  const routes = useRoutes([
    {
      path: `${baseUrl}/dashboard`,
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to={`dashboard/app`} />},
        { path: 'app/:menu/:item', element: <DashboardAppPage /> },
        { path: 'app/', element: <DashboardAppPage /> },
        { path: 'customer/:menu/:item', element: <CustomerPage /> },
        { path: 'sales/:menu/:item', element: <PosPage/>},
        { path: 'user/:menu/:item', element: <UserPage/>},
        { path: 'staff/:menu/:item', element: <StaffPage />},
        { path: 'position/:menu/:item', element: <PositionPage />},
        { path: 'profile', element: <ProfilePage/>},
        { path: 'blog', element: <BlogPage /> },
        { path: 'setting/:menu/:item', element: <SettingPage   /> },
        { path: 'products/:menu/:item', element: <ProductPage /> },
        { path: 'supplier/:menu/:item', element: <SupplierPage /> },
        { path: 'category/:menu/:item', element: <CategoryPage /> },
        { path: 'unit/:menu/:item', element: <UnitPage /> },
        { path: 'restock/:menu/:item', element: <RestockPage />},
        { path: 'return/:menu/:item', element: <ReturnPage />},
        { path: 'credit/:menu/:item', element: <DebitPage />},
        { path: 'fleet/:menu/:item', element: <FleetPage />},
        { path: 'delivery/:menu/:item', element: <DeliveryPage />},
        { path: 'deposit/:menu/:item', element: <DepositPage/>},
        { path: 'historyDelivery/:menu/:item', element: <HistoryDeliveryPage />},
        { path:'restock/create/:menu/:item', element:<CreateRestock/>},
        { path:'restock/edit/:menu/:item', element:<EditRestock/>},
        { path:'returns/create/:menu/:item', element:<CreateReturn/>},
        { path:'returns/edit/:menu/:item', element:<EditReturn/>},
        { path: 'historyTransaction/:menu/:item', element: <TransactionPage />},
        { path:'position/create/:menu/:item', element:<CreatePosition/>},
        { path:'position/update/:menu/:item', element:<EditPosition/>},
      ],
    },
    { path: `${baseUrl}/invoice`, element: <InvoicePage />},
    {
      path: `${baseUrl}/`,
      element: <LoginPage />,
    },
    {
      element: <SimpleLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" />},
        { path: `${baseUrl}/404`, element: <Page404 /> },
        { path: '*', element: <Navigate to={`${baseUrl}/404`} /> },
      ],
    },
    {
      path: '*',
      element: <Navigate to={`${baseUrl}/404`} replace />,
    },
  ]);

  return routes;
}
