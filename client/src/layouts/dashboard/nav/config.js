// component
import Cookies from 'universal-cookie';
import axios from 'axios';
import { useEffect, useState } from 'react';
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const NavConfig = () => {
  const [navConfig, setNavConfig] = useState([]);
  const cookies = new Cookies()
  const cookie = cookies.get("Authorization")

  useEffect(() => {
    const getdata=async()=>{
      await axios.get("http://localhost:8000/api/menugroups?relations=menuitem",{
        headers:{
          "Content-Type" : "aplication/json",
          "Authorization" : `Bearer ${cookie}`
        }
      }).then(response=>{
        setNavConfig(response.data.data)
      })
    }
    getdata();
  }, []);
  
  // Kembalikan navConfig yang telah diambil dari API dan dihasilkan
  return navConfig;
};

// const navConfig = [
//   {
//     title: 'dashboard',
//     path: '/dashboard/app',
//     icon: icon('ic_analytics'),
//   },
//   {
//     title: 'products',
//     path: '/dashboard/products',
//     icon: icon('product-svgrepo-com'),
//   },
//   {
//     title: 'supplier',
//     path: '/dashboard/supplier',
//     icon: icon('supplier-icon'),
//   },
//   {
//     title: 'category',
//     path: '/dashboard/category',
//     icon: icon('layer-icon'),
//   },
//   {
//     title: 'unit',
//     path: '/dashboard/unit',
//     icon: icon('ruler-measurement-icon'),
//   },
//   {
//     title: 'restock',
//     path: '/dashboard/restock',
//     icon: icon('package-send-delivery-svgrepo-com'),
//   },
//   {
//     title: 'return',
//     path: '/dashboard/return',
//     icon: icon('package-return-logistic-svgrepo-com'),
//   },
//   {
//     title: 'staff',
//     path: '/dashboard/staff',
//     icon: icon('manager-consultant-manager-svgrepo-com'),
//   },
//   {
//     title: 'position',
//     path: '/dashboard/position',
//     icon: icon('network-role-solid-svgrepo-com'),
//   },
//   {
//     title: 'Customer',
//     path: '/dashboard/user',
//     icon: icon('ic_user'),
//     // menuItems:
//     // [
//     //   {
//     //     title:'create',
//     //     path: '/dashboard/createuser',
//     //   },
//     // ]
//   },
//   // {
//   //   title: 'sales',
//   //   path: '/dashboard/sales',
//   //   icon: icon('ic_cart'),
//   // },
//   {
//     title: 'Debit',
//     path: '/dashboard/debit',
//     icon: icon('credit-card-svgrepo-com'),
//   },
//   {
//     title: 'Fleet',
//     path: '/dashboard/fleet',
//     icon: icon('vehicle-truck-svgrepo-com'),
//   },
//   {
//     title: 'Deposit',
//     path: '/dashboard/deposit',
//     icon: icon('deposit-svgrepo-com'),
//   },
//   {
//     title: 'Delivery',
//     path: '/dashboard/delivery',
//     icon: icon('delivery-svgrepo-com'),
//   },
//   {
//     title: 'History Delivery',
//     path: '/dashboard/historyDelivery',
//     icon: icon('history-svgrepo-com'),
//   },
//   {
//     title: 'sales',
//     path: '/dashboard/pos',
//     icon: icon('ic_cart'),
//   },
//   {
//     title: 'History Transaction',
//     path: '/dashboard/historyTransaction',
//     icon: icon('history-svgrepo-com'),
//   },
//   {
//     title: 'blog',
//     path: '/dashboard/blog',
//     icon: icon('ic_blog'),
//   },
//   {
//     title: 'login',
//     path: '/login',
//     icon: icon('ic_lock'),
//   },
//   {
//     title: 'Not found',
//     path: '/404',
//     icon: icon('ic_disabled'),
//   },
// ];

export default NavConfig;
