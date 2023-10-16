import { Helmet } from 'react-helmet-async';
import { forwardRef, useContext, useState } from 'react';
// @mui
import { styled } from '@mui/material/styles';
import { Link, Container, Typography, Divider, Stack, Button, Snackbar, Fab } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
// hooks
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import useResponsive from '../hooks/useResponsive';
// components
import Logo from '../components/logo';
import Iconify from '../components/iconify';
// sections
import { LoginForm } from '../sections/auth/login';
import AuthContext from '../Auth';
import ForgetForm from '../sections/auth/login/ForgetForm';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const StyledSection = styled('div')(({ theme }) => ({
  width: '100%',
  maxWidth: 480,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  boxShadow: theme.customShadows.card,
  backgroundColor: theme.palette.background.default,
}));

const StyledContent = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------
const Alert = forwardRef((props, ref) =>{
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
export default function LoginPage() {
  const mdUp = useResponsive('up', 'md');
  const setting = JSON.parse(localStorage.getItem('setting'))
  const { vertical, horizontal, open , message ,variant,handleClose,forget,setForget} = useContext(AuthContext) 
  return (
    <>
     <Helmet
        title="Login Page"
        link={[
              {"rel": "icon", 
               "type": "image/png", 
               "sizes": '32x32',
               "href": `http://localhost:8000/storage/${setting[1].urlIcon}`
              }
             ]}
      />

      <StyledRoot>
        <Logo
          sx={{
            position: 'fixed',
            top: { xs: 16, sm: 24, md: 40 },
            left: { xs: 16, sm: 24, md: 40 },
          }}
        />

        {mdUp && (
          <StyledSection>
            <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 5 }}>
              Please Login
            </Typography>
            <img src="/assets/illustrations/illustration_login.png" alt="login" />
          </StyledSection>
        )}

        <Container maxWidth="sm">
          <StyledContent>
            {forget === false? (
              <>
              <Typography variant="h4" gutterBottom>
                Sign in to the Dashboard
              </Typography>
              {/* <Stack direction="row" spacing={2}>
                <Button fullWidth size="large" color="inherit" variant="outlined">
                  <Iconify icon="eva:google-fill" color="#DF3E30" width={22} height={22} />
                </Button>
  
                <Button fullWidth size="large" color="inherit" variant="outlined">
                  <Iconify icon="eva:facebook-fill" color="#1877F2" width={22} height={22} />
                </Button>
  
                <Button fullWidth size="large" color="inherit" variant="outlined">
                  <Iconify icon="eva:twitter-fill" color="#1C9CEA" width={22} height={22} />
                </Button>
              </Stack>
  
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  OR
                </Typography>
              </Divider> */}
                <LoginForm setForget={setForget}/>
              </>
            ):(
              <>
              <Fab sx={{ top:100,position:'absolute' }} onClick={()=>setForget(false)}>
                <ArrowBackIcon/>
              </Fab>
              <Typography variant="h4" gutterBottom>
                Reset Password
              </Typography>
              <ForgetForm/>
              
              </>
            )}
          </StyledContent>
        </Container>
      </StyledRoot>
      <Snackbar open={open} autoHideDuration={1500} onClose={handleClose} anchorOrigin={{vertical , horizontal}}>
        <Alert onClose={handleClose} severity={variant} sx={{ width: '100%' }}>
        {message}
        </Alert>
      </Snackbar>
    </>
  );
}
