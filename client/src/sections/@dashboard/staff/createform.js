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
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { OutletContext } from '../../../layouts/dashboard/OutletProvider';
import { INITIAL_STATE, StaffReducer } from './StaffReducer';



const Alert = forwardRef((props, ref) =>{
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
const CreateStaff = ({ style2 , openModal , handleCloseModal })=>{
  const [position , setPosition] = useState([])
  const {load} = useContext(OutletContext)
  const [state,dispatch] = useReducer(StaffReducer,INITIAL_STATE)
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
  const handleImage=(data)=>{
    dispatch({type:"IMAGE_INPUT",payload: data})
  }
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
      const errors = {};
      
      // Perform validation here
      Object.keys(formData).forEach((field) => {
        if (formData[field] === '' || formData[field] === 0 ) {
          errors[field] = `${field} is required`;
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
    const handleDate=(data)=>{
      const date = new Date(data.$y, data.$M , data.$D)
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const formattedDate = `${year}-${month}-${day}`;
      dispatch({type:"DATE_INPUT",payload: formattedDate})
    }
    const handleCreate= async() =>{
      const formdata = { ...state.formData }; // Clone the formData to avoid modifying the original state
  
      const errors = handleValidation(formdata);
  
      if (Object.keys(errors).length > 0) {
        return;
      }
      const formData = new FormData()
      formData.append("name",state.formData.name)
      formData.append("registerDate",state.formData.registerDate)
      formData.append("address",state.formData.address)
      formData.append("phone",state.formData.phone)
      formData.append("position_id",state.formData.position_id)
      formData.append("information",state.formData.information)
      formData.append("urlImage",state.formData.urlImage)
      try {
        await axios.post("http://localhost:8000/api/staffs",formData,{
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
        const getData= () =>{
          axios.get("http://localhost:8000/api/positions",{
        headers:{
              "Content-Type" : "aplication/json",
              "Authorization" : `Bearer ${cookie}`
            }
          }).then(response=>{
            setPosition(response.data.data)
          })
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
        <DialogTitle align='center'>Create Staff Form</DialogTitle>
        <DialogContent>
        <TextField
            id="outlined-disabled"
            label="Name"
            sx={
              style2
            }
            fullWidth
            name='name'
            onChange={handleChange}
            error={!!state.validationErrors.name}
            helperText={state.validationErrors.name || ' '}
            onKeyDown={handleKeyDown}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer
              components={[
                'DatePicker',
                'MobileDatePicker',
                'DesktopDatePicker',
                'StaticDatePicker',
              ]}
            >
                <DatePicker label="Register Date" 
                onChange={handleDate} 
                sx={{ borderColor:"red" }} 
                disableFuture
                slotProps={{ textField: { helperText:state.validationErrors.registerDate , error:!!state.validationErrors.registerDate} }}/>
            </DemoContainer>
          </LocalizationProvider>
            
        <FormControl fullWidth>
          <MuiFileInput sx={style2} label="Input Image"  fullWidth value={state.formData.urlImage} onChange={handleImage} 
            error={!!state.validationErrors.urlImage} onKeyDown={handleKeyDown}
            />
         <FormHelperText sx={{ color:"#f44336" }}>{state.validationErrors.urlImage || ' '}</FormHelperText>
        </FormControl>

          <TextField
            id="outlined-disabled"
            label="Address"
            sx={
              style2
            }
            fullWidth
            name='address'
            onChange={handleChange}
            error={!!state.validationErrors.address}
            helperText={state.validationErrors.address || ' '}
            onKeyDown={handleKeyDown}
          />
          <TextField
            id="outlined-disabled"
            label="Phone"
            sx={
              style2
            }
            fullWidth
            name='phone'
            onChange={handleChange}
            error={!!state.validationErrors.phone}
            helperText={state.validationErrors.phone || ' '}
            onKeyDown={handleKeyDown}
            />

          <TextField
            id="outlined-disabled"
            label="Information"
            sx={
              style2
            }
            fullWidth
            name='information'
            onChange={handleChange}
            error={!!state.validationErrors.information}
            helperText={state.validationErrors.information || ' '}
            onKeyDown={handleKeyDown}
            />
          <Autocomplete
            id="country-select-demo"
            name="position_id"
            sx={style2}
            disableClearable
            options={position}
            autoHighlight
            getOptionLabel={(option) => option.name}
            onKeyDown={handleKeyDown}
            renderOption={(props, option) => (
              <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                {option.name}
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Choose a Position"
                inputProps={{
                  ...params.inputProps,
                }}
                error={!!state.validationErrors.position_id}
                helperText={state.validationErrors.position_id || ' '}
              />
            )}
            onChange={(event, newValue) => {
              if (newValue) {
                handleChange({ target: { name: 'position_id', value: newValue.id } });
              }
            }}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleCreate}>Create</Button>
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
export default CreateStaff