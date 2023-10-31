import axios from 'axios';
// @mui
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Autocomplete,
  Box,
  FormHelperText,
  Snackbar,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { forwardRef, useContext, useEffect, useReducer, useState } from 'react';
import Cookies from 'universal-cookie';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { OutletContext } from '../../../layouts/dashboard/OutletProvider';
import { INITIAL_STATE, StaffReducer } from './StaffReducer';



const Alert = forwardRef((props, ref) =>(
   <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const CreateStaff = ({ style2 , openModal , handleCloseModal })=>{
  const [customer , setCustomer] = useState([])
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

  const handleClose = () => {
    setState({ ...state2, open: false });
  };
    const handleChangeValidation=(formData)=>{
      const errors = {};
      
      if(formData.name === 'ammount') {
          if (!/^[0-9]{1,13}$/.test(formData.value)) {
            errors[formData.name] = 'field should be fill by 0-9';
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
      formData.append("customer_id",state.formData.customer_id)
      formData.append("depositDate",state.formData.depositDate)
      formData.append("ammount",state.formData.ammount)
      formData.append("status",state.formData.status)
      formData.append("information",state.formData.information)
      try {
        await axios.post(`${apiEndpoint}api/deposits`,formData,{
          headers:{
            Authorization: `Bearer ${cookie}`
          }
        }).then(response=>{
          console.log(response);
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
          axios.get(`${apiEndpoint}api/customers`,{
        headers:{
              "Content-Type" : "aplication/json",
              "Authorization" : `Bearer ${cookie}`
            }
          }).then(response=>{
            setCustomer(response.data.data)
          })
        }
        getData()
      },[cookie])

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
        <DialogTitle align='center'>Create Deposit Form</DialogTitle>
        <DialogContent>
        <Autocomplete
          id="country-select-demo"
          name="customer_id"
          sx={style2}
          disableClearable
          options={customer}
          autoHighlight
          onKeyDown={handleKeyDown}
          getOptionLabel={(option) => option.name}
          renderOption={(props, option) => (
            <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
              {option.name}
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Choose a customer"
              inputProps={{
                ...params.inputProps,
              }}
              error={!!state.validationErrors.customer_id}
              helperText={state.validationErrors.customer_id || ' '}
            />
          )}
          onChange={(event, newValue) => {
            if (newValue) {
              handleChange({ target: { name: 'customer_id', value: newValue.id } });
            }
          }}
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
                <DatePicker label="Deposit Date" 
                onChange={handleDate} 
                sx={{ borderColor:"red" }} 
                disableFuture
                slotProps={{ textField: { helperText:state.validationErrors.depositDate , error:!!state.validationErrors.depositDate} }}/>
            </DemoContainer>
          </LocalizationProvider>
          <FormControl fullWidth sx={{ marginTop:3, marginBottom:1 }}  error={!!state.validationErrors.ammount}>
              <InputLabel htmlFor="outlined-adornment-amount">Ammount</InputLabel>
              <OutlinedInput
                id="outlined-adornment-amount"
                startAdornment={<InputAdornment position="start">IDR</InputAdornment>}
                label="Ammount"
                onChange={handleChange}
                name='ammount'
                onKeyDown={handleKeyDown}
                />
              <FormHelperText>{state.validationErrors.ammount || ' '}</FormHelperText>
        </FormControl>
          <TextField
            id="outlined-disabled"
            label="Information"
            fullWidth
            name='information'
            onChange={handleChange}
            error={!!state.validationErrors.information}
            helperText={state.validationErrors.information || ' '}
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
export default CreateStaff