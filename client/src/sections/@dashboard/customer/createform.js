import axios from 'axios';
// @mui
import {
  Button,
  TextField,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Snackbar,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { forwardRef, useContext, useReducer, useState } from 'react';
import Cookies from 'universal-cookie';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { OutletContext } from '../../../layouts/dashboard/OutletProvider';
import { INITIAL_STATE, CustomerReducer } from './CustomerReducer';

const Alert = forwardRef((props, ref) =>(
  <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const CreateCustomer = ({ style2 , openModal , handleCloseModal} )=>{
  
  const {load} = useContext(OutletContext)
  const [state,dispatch] = useReducer(CustomerReducer,INITIAL_STATE)
  const cookies = new Cookies
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
  const cookie = cookies.get("Authorization")

    const handleChangeValidation=(formData)=>{
      const errors = {};
      
      if(formData.name === 'phone') {
          if (!/^(0|8)\d{9,12}$/.test(formData.value)) {
            errors[formData.name] = 'Invalid phone number format.it cant be more than 13 digits and should start with 0 or 8';
          }
      }
      if(formData.name === 'information') {
        if (formData.value.length > 600) {
          errors[formData.name] = 'Information cannot exceed 600 characters.';
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
        if (formData[field] === '') {
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
    const handleDate=(data,fieldname)=>{
      const date = new Date(data.$y, data.$M , data.$D)
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const formattedDate = `${year}-${month}-${day}`;
      dispatch({type:"DATE_INPUT",payload:{name:fieldname ,value:formattedDate}})
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
      formData.append("birthDate",state.formData.birthDate)
      formData.append("information",state.formData.information)
      try {
        await axios.post(`${apiEndpoint}api/customers`,formData,{
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
      const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
          // Tombol Enter ditekan, panggil handleClick
          handleCreate();
        }
      }
    return(
        <>
         <Dialog open={openModal} onClose={handleCloseModal} scroll='body'>
        <DialogTitle align='center'>Create Supplier Form</DialogTitle>
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
            helperText={state.validationErrors.name}
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
                  <DatePicker  label="Birth Date"
                  onChange={(data)=>handleDate(data,"birthDate")}
                  disableFuture
                  slotProps={{ textField: { helperText:state.validationErrors.birthDate , error:!!state.validationErrors.birthDate} }}/>
              </DemoContainer>
            </LocalizationProvider>
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
            helperText={state.validationErrors.address}
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
                  <DatePicker  label="Register Date" onChange={(data)=>handleDate(data,"registerDate")}  disableFuture slotProps={{ textField: { helperText:state.validationErrors.registerDate , error:!!state.validationErrors.registerDate} }}/>
              </DemoContainer>
            </LocalizationProvider>
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
            helperText={state.validationErrors.phone}
            onKeyDown={handleKeyDown}
          />

          <TextField
            id="outlined-disabled"
            label="Information"
            sx={
              style2
            }
            fullWidth
            multiline
            name='information'
            onChange={handleChange}
            error={!!state.validationErrors.information}
            helperText={state.validationErrors.information || `Number of characters: ${state.formData.information.length}/600`}
            onKeyDown={handleKeyDown}
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
export default CreateCustomer