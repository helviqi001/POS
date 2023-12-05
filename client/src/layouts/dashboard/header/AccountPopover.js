import { useContext, useEffect, useState } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import { Box, Divider, Typography, Stack, MenuItem, Avatar, IconButton, Popover } from '@mui/material';
// mocks_
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import axios from 'axios';
import AuthContext from '../../../Auth';
import account from '../../../_mock/account';
import { OutletContext } from '../OutletProvider';

// ----------------------------------------------------------------------
const baseUrl = process.env.PUBLIC_URL
const MENU_OPTIONS = [
  {
    label: 'Home',
    icon: 'eva:home-fill',
    path: `${baseUrl}/dashboard/app`,
  },
  {
    label: 'Profile',
    icon: 'eva:person-fill',
    path: `${baseUrl}/dashboard/profile`,
  },
];

// ----------------------------------------------------------------------
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

export default function AccountPopover() {
  const navigate = useNavigate()
  const Profile = JSON.parse(localStorage.getItem('userProfile'))
  const cookies = new Cookies()
  const cookie = cookies.get("Authorization");
  const [open, setOpen] = useState(null);
  const [profile, setProfile] = useState(null);
  const {Logout} = useContext(AuthContext)
  const [loading,setLoading] = useState(true)

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = (path) => {
    setOpen(null);
    navigate(path)
    console.log(path);
  };
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
  return (
    <>
      <>
      <IconButton
        onClick={handleOpen}
        sx={{
          p: 0,
          ...(open && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
            },
          }),
        }}
      >
        {loading === true ? (
          <Avatar src={`${apiEndpoint}storage/`} alt="photoURL" />
        ):(
          <Avatar src={`${apiEndpoint}storage/${profile.urlImage}`} alt="photoURL" />
        )}
      </IconButton>
      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 0,
            mt: 1.5,
            ml: 0.75,
            width: 180,
            '& .MuiMenuItem-root': {
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        {loading === false && (
          <Box sx={{ my: 1.5, px: 2.5 }}>
            <Typography variant="subtitle2" noWrap>
              {profile.name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
              {Profile.username}
            </Typography>
          </Box>
        )}

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {MENU_OPTIONS.map((option) => (
            <MenuItem key={option.label} onClick={()=>handleClose(option.path)}>
              {option.label}
            </MenuItem>
          ))}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem onClick={Logout} sx={{ m: 1 }}>
          Logout
        </MenuItem>
      </Popover>
      </>
    </>
  );
}
