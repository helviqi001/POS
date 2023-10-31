import { LoadingButton } from "@mui/lab";
import { IconButton, InputAdornment, Stack, TextField } from "@mui/material";
import { useContext, useState } from "react";
import Iconify from "../../../components/iconify";
import AuthContext from "../../../Auth";

export default function ForgetForm(){
    const [showPassword, setShowPassword] = useState(false);
    const [valueEmail, setEmail] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const {Reset} = useContext(AuthContext)

    const handleClick = async() => {
        await Reset({
          username: valueEmail,
          newPassword,
          confirmPassword:oldPassword
        })
      }
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
          handleClick();
        }
      }
    return(
        <>
             <Stack spacing={3}>
                <TextField name="email" label="Username" onChange={(e)=>setEmail(e.target.value)}  onKeyDown={handleKeyDown}/>

                <TextField
                name="password"
                label="New Password"
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
                onChange={(e)=>setNewPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                />
                <TextField
                name="password"
                label="confirm Password"
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
                onChange={(e)=>setOldPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                />
            </Stack>

            <LoadingButton fullWidth size="large" type="submit" variant="contained"  onClick={()=>handleClick()} sx={{ marginTop:4 }}>
                Reset
            </LoadingButton>
        </>
    )
}