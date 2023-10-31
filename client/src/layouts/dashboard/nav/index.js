import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Cookies from 'universal-cookie';
// @mui
import { styled, alpha } from '@mui/material/styles';
import { Box, Link, Button, Drawer, Typography, Avatar, Stack, Menu, MenuItem } from '@mui/material';
import axios from 'axios';
// mock
import account from '../../../_mock/account';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// components
import Logo from '../../../components/logo';
import Scrollbar from '../../../components/scrollbar';
import NavSection from '../../../components/nav-section';
//
import navConfig from './config';

// ----------------------------------------------------------------------

const NAV_WIDTH = 280;

const StyledAccount = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(theme.palette.grey[500], 0.12),
}));

// ----------------------------------------------------------------------

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

export default function Nav({ openNav, onCloseNav, load}) {
  
  const Profile = JSON.parse(localStorage.getItem('userProfile'))
  const [profile, setProfile] = useState(null);
  const setting = JSON.parse(localStorage.getItem('setting'))
  const [loading,setLoading] = useState(true)
  const { pathname } = useLocation();
  const isDesktop = useResponsive('up', 'lg');
  const cookies = new Cookies()
  const cookie = cookies.get("Authorization");
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
  }, [pathname]);
  useEffect(()=>{
    setLoading(true)
    const getData=async()=>{
      await axios.get(`${apiEndpoint}api/staffs/${Profile.staff_id}?relations=position`,{
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${cookie}`
        }
      }).then(response=>{
        setProfile(response.data)
        setLoading(false)
      })
    }
    getData()
  },[])

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
      }}
      >
          <Box sx={{ px: 2.5, py: 3, display: 'inline-flex' }}>
        {loading ? (
          <img src={`${apiEndpoint}storage/`} alt='' style={{ height:"100%",width:"125px" }}/> 
        ):(
          <img src={`${apiEndpoint}storage/${setting[0].urlImage}`} alt='' style={{ height:"100%",width:"125px" }}/>   
        )}
          </Box>

          <Box sx={{ mb: 5, mx: 2.5 }}>
            <Link underline="none">
              <StyledAccount>
                <>
                {loading === false && (
                  <>
                <Avatar src={`${apiEndpoint}storage/${profile.urlImage}`} alt="photoURL"  sx={{ width: 50, height: 50  }}/>

                <Box sx={{ ml: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                    {profile.name}
                  </Typography>

                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {Profile.username}
                  </Typography>
                </Box>
                  </>
                )}
                </>
              </StyledAccount>
            </Link>
          </Box>

      <NavSection data={navConfig}
      onClick={handleClick} load={load}
      />
      <Box sx={{ flexGrow: 1 }} />
    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV_WIDTH },
      }}
    >
      {isDesktop ? (
        <Drawer
          open
          variant="permanent"
          PaperProps={{
            sx: {
              width: NAV_WIDTH,
              bgcolor: 'background.default',
              borderRightStyle: 'dashed',
            },
          }}
        >
          {renderContent}
        </Drawer>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: { width: NAV_WIDTH },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
