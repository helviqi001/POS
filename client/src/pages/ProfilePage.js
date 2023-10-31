import { Button, Card, CardActions, CardContent, CardHeader, Grid, Snackbar, TextField, Tooltip, Typography } from '@mui/material';
import { Box, styled } from '@mui/system';
import MuiAlert from '@mui/material/Alert';
import axios from 'axios';
import { useState,useEffect, useContext, forwardRef, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import Cookies from "universal-cookie"
import { INITIAL_STATE2,StaffReducer } from '../sections/@dashboard/staff/StaffReducer';
import { OutletContext } from '../layouts/dashboard/OutletProvider';

const Alert = forwardRef((props, ref) =>(
    <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

export default function ProfilePage(){
  const [state,dispatch] = useReducer(StaffReducer,INITIAL_STATE2)
    const Profile = JSON.parse(localStorage.getItem('userProfile'))
    const {load} = useContext(OutletContext)
    const cookies = new Cookies()
    const cookie = cookies.get("Authorization")
    const setting = JSON.parse(localStorage.getItem('setting'))
    const [loading,setLoading] = useState(true)
    const [imagePreview, setImagePreview] = useState(null);
    const [state2, setState] = useState({
      open: false,
      vertical: 'top',
      horizontal: 'center',
      message:"",
      variant:""
    });
    const { vertical, horizontal, open } = state2;
  
    const handleClick = (message,variant) => {
      setState({ ...state2, open: true , message,variant });
    };
  
    const handleClose = () => {
      setState({ ...state2, open: false });
    };

    const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      dispatch({type:"IMAGE_INPUT",payload: selectedFile})
      if (selectedFile) {
        // Tampilkan pratinjau gambar yang akan diunggah
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(selectedFile);
      }
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
            dispatch(
              {type:"UPDATE" , payload: response.data}
              )
            setLoading(false)
          })
        }
        getData()
      },[])

      const StyledImage = styled('img')({
        width:200,
        height: 200,
        borderRadius:'50%',
        objectFit:'cover',
        backgroundColor:'gray'
      });
      const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
      });
      const handleChangeValidation=(formData)=>{
        const errors = {};
        
        if(formData.name === 'phone') {
            if (!/^(0|8)\d{9,12}$/.test(formData.value)) {
              errors[formData.name] = 'Invalid phone number format.it cant be more than 13 digits and should start with 0 or 8';
            }
        }
            // Update validationErrors state
        Object.keys(errors).forEach((field) => {
         dispatch({
            type: 'SET_VALIDATION_ERROR',
            payload: { field, error: errors[field] },
          });
        });
        
        return errors;
      }
      
      const handleValidation=(formData)=>{
        const errors = {};
        
        // Perform validation here
        Object.keys(formData).forEach((field) => {
          if(field !== 'oldPassword' && field !== 'newPassword'){
            if (formData[field] === '') {
              errors[field] = `${field} is required`;
            }
          }
        });
  
            // Update validationErrors state
        Object.keys(errors).forEach((field) => {
         dispatch({
            type: 'SET_VALIDATION_ERROR',
            payload: { field, error: errors[field] },
          });
        });
        
        return errors;
      }
  
      const handleChange = e =>{
          dispatch(
            {type:"CHANGE_INPUT" , payload:{name:e.target.name , value:e.target.value}},
          )
          const formdata = { name:e.target.name , value:e.target.value }; // Clone the formData to avoid modifying the original state
  
        handleChangeValidation(formdata);
      }

      const handleEdit= async() =>{
        const formdata = { ...state.formData }; // Clone the formData to avoid modifying the original state

      const errors = handleValidation(formdata);

      if (Object.keys(errors).length > 0) {
        return;
      }

        const formData1 = new FormData()
        formData1.append("name",state.formData.name)
        formData1.append("registerDate",state.formData.registerDate)
        formData1.append("address",state.formData.address)
        formData1.append("phone",state.formData.phone)
        formData1.append("position_id",state.formData.position_id)
        formData1.append("information",state.formData.information)
        formData1.append("urlImage",state.formData.urlImage)
        formData1.append("id",Profile.staff_id)
        const formData2 = new FormData()
        formData2.append("username",Profile.username)
        formData2.append("staff_id",Profile.staff_id)
        formData2.append("oldPassword",state.formData.oldPassword)
        formData2.append("newPassword",state.formData.newPassword)
        formData2.append("id",Profile.id)
        try {
          if(state.formData.oldPassword !== ""){
            await axios.post(`${apiEndpoint}api/update/users`,formData2,{
              headers:{
                Authorization: `Bearer ${cookie}`
              }
            })
          }
          await axios.post(`${apiEndpoint}api/update/staffs`,formData1,{
            headers:{
              Authorization: `Bearer ${cookie}`
            }
          }).then(response=>{
            handleClick(response.data.message,'success')
            setTimeout(()=>{
              load(true)
              setTimeout(()=>{
                load(false)
              },1000)
            },1500)
          })
        } catch (error) {
            if (error.response.status === 500 ) {
              handleClick(error.response.data.error,'error')
            }
            console.log(error);
          }
        }
        const handleKeyDown = (e) => {
          if (e.key === 'Enter') {
            // Tombol Enter ditekan, panggil handleClick
            handleEdit();
          }
        }

        console.log(state);
    return(
        <>
          <Helmet
                title="Profile Page"
                link={[
                    {"rel": "icon", 
                    "type": "image/png", 
                    "sizes": '32x32',
                    "href": `${apiEndpoint}storage/${setting[1].urlIcon}`
                    }
                    ]}
            />
            {loading === false && (
              <>
                <Card sx={{ padding:5 }}>
                    <Typography variant='h3'>
                        PROFILE
                    </Typography>
                  <Grid container justifyContent={'space-evenly'} alignItems={'center'}>
                    <Grid item >
                    <Tooltip title='Profile Image' arrow>
                        <Button component="label" sx={{borderRadius:"50%", border:1 ,borderColor:"gray"}}>
                        {imagePreview ? (
                          <StyledImage src={imagePreview} alt='' />
                        ) : (
                          <StyledImage src={`${apiEndpoint}storage/${state.formData.urlImage}`} alt='' />
                        )}
                            <VisuallyHiddenInput type="file"  accept="image/*" onChange={handleFileChange}/>
                        </Button>
                    </Tooltip>
                    </Grid>
                    <Grid item sm={12} md={6} lg={4}>
                        <TextField
                            id="outlined-disabled"
                            label="Name"
                            fullWidth
                            name='name'
                            sx={{ marginBottom:1 }}
                            onChange={handleChange}
                            defaultValue={state.formData.name}
                            key={1}
                            error={!!state.validationErrors.name}
                            helperText={state.validationErrors.name || ' '}
                            onKeyDown={handleKeyDown}
                          />
                        <TextField
                            id="outlined-disabled"
                            label="Phone"
                            fullWidth
                            name='phone'
                            sx={{ marginBottom:1 }}
                            onChange={handleChange}
                            defaultValue={state.formData.phone}
                            key={2}
                            error={!!state.validationErrors.phone}
                            helperText={state.validationErrors.phone || ' '}
                            onKeyDown={handleKeyDown}
                          />
                        <TextField
                            id="outlined-disabled"
                            label="Address"
                            fullWidth
                            name='address'
                            sx={{ marginBottom:1 }}
                            onChange={handleChange}
                            defaultValue={state.formData.address}
                            key={3}
                            error={!!state.validationErrors.address}
                            helperText={state.validationErrors.address || ' '}
                            onKeyDown={handleKeyDown}
                          />
                        <TextField
                            id="outlined-disabled"
                            label="Username"
                            fullWidth
                            name='username'
                            sx={{ marginBottom:1 }}
                            onChange={handleChange}
                            defaultValue={Profile.username}
                            key={4}
                            error={!!state.validationErrors.username}
                            helperText={state.validationErrors.username || ' '}
                            onKeyDown={handleKeyDown}
                          />
                        <TextField
                            id="outlined-disabled"
                            label="Old Password"
                            fullWidth
                            name='oldPassword'
                            sx={{ marginBottom:3 }}
                            onChange={handleChange}
                            key={5}
                            // error={!!validationErrors.name}
                            // helperText={validationErrors.name || ' '}
                            onKeyDown={handleKeyDown}
                          />
                        <TextField
                            id="outlined-disabled"
                            label="New Password"
                            fullWidth
                            name='newPassword'
                            sx={{ marginBottom:3 }}
                            onChange={handleChange}
                            key={6}
                            // error={!!validationErrors.name}
                            // helperText={validationErrors.name || ' '}
                            onKeyDown={handleKeyDown}
                          />
                    </Grid>
                  </Grid>
                    <CardActions>
                        <>
                          <Button variant='contained' onClick={()=>handleEdit()}>
                              Done
                          </Button>
                        </>
                    </CardActions>
                </Card>
              </>
            )}
             <Snackbar open={open} autoHideDuration={1500} onClose={handleClose} anchorOrigin={{ vertical , horizontal }}>
              <Alert onClose={handleClose} severity={state2.variant} sx={{ width: '100%' }}>
              {state2.message}
              </Alert>
            </Snackbar>
        </>
    )
}