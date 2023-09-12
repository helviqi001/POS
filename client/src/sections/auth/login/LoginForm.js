import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Link, Stack, IconButton, InputAdornment, TextField, Checkbox } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../../../components/iconify';
import AuthContext from '../../../Auth';

// ----------------------------------------------------------------------

export default function LoginForm() {
  const navigate = useNavigate();
  const {login} = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [valueEmail, setEmail] = useState("");
  const [valuePassword, setPassword] = useState("");

  const handleClick = async() => {
    try{
      await login({
        username: valueEmail,
        password: valuePassword,
      })
    }
    catch(err){
      alert(err)
    }
  }

  return (
    <>
      <Stack spacing={3}>
        <TextField name="email" label="Username" onChange={(e)=>setEmail(e.target.value)}/>

        <TextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          onChange={(e)=>setPassword(e.target.value)}
        />
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        <Checkbox name="remember" label="Remember me" />
        <Link variant="subtitle2" underline="hover">
          Forgot password?
        </Link>
      </Stack>

      <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={()=>handleClick()}>
        Login
      </LoadingButton>
    </>
  );
}
