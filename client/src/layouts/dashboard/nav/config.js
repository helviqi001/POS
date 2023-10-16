// component
import Cookies from 'universal-cookie';
import axios from 'axios';
import { useEffect, useState } from 'react';
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const NavConfig = () => {
  const [navConfig, setNavConfig] = useState([]);
  useEffect(() => {
    setNavConfig(JSON.parse(localStorage.getItem('privilage')))
  }, []);
  
  // Kembalikan navConfig yang telah diambil dari API dan dihasilkan
  return navConfig;
};

export default NavConfig;
