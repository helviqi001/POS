import axios from 'axios';
// @mui
import {
  Button,
  TextField,
  FormControl,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  FormHelperText,
  Snackbar,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { forwardRef, useContext, useEffect, useReducer, useState } from 'react';
import Cookies from 'universal-cookie';
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Loading2 from '../../../Loading/loading2';
import { INITIAL_STATE, CustomerReducer } from './CustomerReducer';
import { OutletContext } from '../../../layouts/dashboard/OutletProvider';

const Alert = forwardRef((props, ref) =>(
  <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const EditCustomer = ({ id,style2 , openModal , handleCloseModal})=>{
  
  const [loading, setLoading] = useState(true);
  const {load} = useContext(OutletContext)
  const [state,dispatch] = useReducer(CustomerReducer,INITIAL_STATE)
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
        if(field === 'phone') {
          if (!/^(0|8)\d{9,13}$/.test(formData[field])) {
            errors[field] = 'Invalid phone number format.it cant be more than 13 digits and should start with 0 or 8';
          }
      }
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
    const handleDate=(data , fieldname)=>{
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
      formData.append("id",id)
      try {
        await axios.post(`${apiEndpoint}api/update/customers`,formData,{
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
          await axios.get(`${apiEndpoint}api/customers/${id}`,{
            headers:{
              "Content-Type":"aplication/json",
              Authorization: `Bearer ${cookie}`
            }}).then(response=>{
              dispatch(
                {type:"UPDATE" , payload: response.data}
                )
              })
              await setLoading(false)
            }

            getData()
          },[id,cookie])

          const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
              // Tombol Enter ditekan, panggil handleClick
              handleCreate();
            }
          } 
    return(
      <> 
          <Dialog open={openModal} onClose={handleCloseModal} scroll='body'>
          <DialogTitle align='center'>Update Customer Form</DialogTitle>
          <DialogContent>
      
          {loading ? <div style={{ height:500 , width:400 }}>
            <Loading2/>
           </div>
           :

           (
            <>
            <TextField
            id="outlined-disabled"
            label="Name"
            sx={
              style2
            }
            fullWidth
            name='name'
            onChange={handleChange}
            defaultValue={state.formData.name}
            key={state.formData.id}
            error={!!state.validationErrors.name}
            helperText={state.validationErrors.name || ''}
            onKeyDown={handleKeyDown}
          />
          <FormControl sx={style2} fullWidth error={!!state.validationErrors.registerDate}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer
              components={[
                'DatePicker',
                'MobileDatePicker',
                'DesktopDatePicker',
                'StaticDatePicker',
              ]}
            >
                <DatePicker  label="Register Date" 
                onChange={(data)=>handleDate(data,"registerDate")} 
                disableFuture
                defaultValue={dayjs(state.formData.registerDate)} key={state.formData.id}/>
            </DemoContainer>
          </LocalizationProvider>
          <FormHelperText>{state.validationErrors.registerDate}</FormHelperText>
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
            defaultValue={state.formData.address}
            key={state.formData.id}
            error={!!state.validationErrors.address}
            helperText={state.validationErrors.address || ''}
            onKeyDown={handleKeyDown}
          />
          <FormControl sx={style2} fullWidth error={!!state.validationErrors.birthDate}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer
              components={[
                'DatePicker',
                'MobileDatePicker',
                'DesktopDatePicker',
                'StaticDatePicker',
              ]}
            >
                <DatePicker  label="Birth Date" onChange={(data)=>handleDate(data,"birthDate")} disabled defaultValue={dayjs(state.formData.birthDate)} key={state.formData.id}/>
            </DemoContainer>
          </LocalizationProvider>
          <FormHelperText>{state.validationErrors.birthDate}</FormHelperText>
          </FormControl>
          <TextField
            id="outlined-disabled"
            label="Phone"
            sx={
              style2
            }
            fullWidth
            name='phone'
            onChange={handleChange}
            defaultValue={state.formData.phone}
            key={state.formData.id}
            error={!!state.validationErrors.phone}
            helperText={state.validationErrors.phone || ''}
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
            multiline
            onChange={handleChange}
            defaultValue={state.formData.information}
            key={state.formData.id}
            error={!!state.validationErrors.information}
            helperText={state.validationErrors.information || `Number of characters: ${state.formData.information.length}/600`}
            onKeyDown={handleKeyDown}
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
export default EditCustomer