import { MuiFileInput } from 'mui-file-input';
import axios from 'axios';
// @mui
import {
  Button,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Dialog,
  DialogContent,
  DialogActions,
  Select,
  DialogTitle,
  Autocomplete,
  Box,
  FormHelperText,
  Snackbar,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { forwardRef, useContext, useEffect, useReducer, useState } from 'react';
import Cookies from 'universal-cookie';
import Loading2 from '../../../Loading/loading2';
import { INITIAL_STATE, StaffReducer } from './StaffReducer';
import { OutletContext } from '../../../layouts/dashboard/OutletProvider';

const Alert = forwardRef((props, ref) =>{
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
const EditForm = ({ id,style2 , openModal , handleCloseModal})=>{

    const [loading, setLoading] = useState(true);
    const {load} = useContext(OutletContext)
    const [state,dispatch] = useReducer(StaffReducer,INITIAL_STATE)
    const [position , setPosition] = useState([])
    const cookies = new Cookies
    const cookie = cookies.get("Authorization")
    
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
      console.log(formData);
      const errors = {};
      
      // Perform validation here
      Object.keys(formData).forEach((field) => {
        if(field!=='password'){
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


    const handleCreate= async() =>{
      const formdata = { ...state.formData }; // Clone the formData to avoid modifying the original state

      const errors = handleValidation(formdata);

      if (Object.keys(errors).length > 0) {
        return;
      }
      const formData = new FormData()
      formData.append("username",state.formData.username)
      formData.append("staff_id",state.formData.staff_id)
      formData.append("password",state.formData.password)
      formData.append("id",id)
      try {
        await axios.post("http://localhost:8000/api/update/users",formData,{
          headers:{
            Authorization: `Bearer ${cookie}`
          }
        }).then(response=>{
          handleClick(response.data.message,'success')
          setTimeout(()=>{
            load(true)
            setTimeout(()=>{
              load(false)
              handleCloseModal()
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

      useEffect(()=>{
        setLoading(true)
        const getData= async()=>{
          await axios.get(`http://localhost:8000/api/users/${id}?relations=staff`,{
            headers:{
              "Content-Type":"aplication/json",
              Authorization: `Bearer ${cookie}`
            }}).then(response=>{
              dispatch(
                {type:"UPDATE" , payload: response.data}
                )
              })
          await axios.get("http://localhost:8000/api/staffs",{
                headers:{
                      "Content-Type" : "aplication/json",
                      "Authorization" : `Bearer ${cookie}`
                    }
                  }).then(response=>{
                    setPosition(response.data.data)
                  })
              await setLoading(false)
            }

            getData()
          },[])
          const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
              // Tombol Enter ditekan, panggil handleClick
              handleCreate();
            }
          }
          console.log(state);
    return(
      <> 
          <Dialog open={openModal} onClose={handleCloseModal} scroll='body'>
          <DialogTitle align='center'>Update User Form</DialogTitle>
          <DialogContent>
      
          {loading ? <div style={{ height:500 , width:400 }}>
            <Loading2/>
           </div>
           :

           (
            <>
               <Autocomplete
            id="country-select-demo"
            name="staff_id"
            sx={style2}
            disableClearable
            options={position}
            autoHighlight
            getOptionLabel={(option) => option.name}
            onKeyDown={handleKeyDown}
            defaultValue={state.formData && state.formData.staff}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(props, option) => (
              <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                {option.name}
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Choose a Supplier"
                inputProps={{
                  ...params.inputProps,
                }}
                error={!!state.validationErrors.position_id}
                helperText={state.validationErrors.position_id || ' '}
              />
            )}
            onChange={(event, newValue) => {
              if (newValue) {
                handleChange({ target: { name: 'staff_id', value: newValue.id } });
              }
            }}
          />
            <TextField
            id="outlined-disabled"
            label="Username"
            sx={
              style2
            }
            fullWidth
            name='username'
            onChange={handleChange}
            defaultValue={state.formData.username}
            key={state.formData.id}
            onKeyDown={handleKeyDown}
            error={!!state.validationErrors.username}
            helperText={state.validationErrors.username || ' '}
          />

          <TextField
            id="outlined-disabled"
            label="New Password"
            sx={
              style2
            }
            fullWidth
            name='password'
            // disabled
            key={state.formData.id}
            error={!!state.validationErrors.password}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            helperText={state.validationErrors.password || 'Kosongkan jika tidak ingin update password'}
          />
            </>
           )
          }
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button onClick={handleCreate}>Update</Button>
          </DialogActions>
        </Dialog>
        <Snackbar open={open} autoHideDuration={1500} onClose={handleClose} anchorOrigin={{ vertical , horizontal }}>
        <Alert onClose={handleClose} severity={state2.variant} sx={{ width: '100%' }}>
        {state2.message}
        </Alert>
      </Snackbar>
        </>
    )
}
export default EditForm