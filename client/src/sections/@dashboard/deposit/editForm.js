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
import dayjs from 'dayjs';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import Loading2 from '../../../Loading/loading2';
import { INITIAL_STATE, StaffReducer } from './StaffReducer';
import { OutletContext } from '../../../layouts/dashboard/OutletProvider';

const Alert = forwardRef((props, ref) =>{
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const EditForm = ({ id,style2 , openModal , handleCloseModal})=>{

    const [loading, setLoading] = useState(true);
    const {load} = useContext(OutletContext)
    const [state,dispatch] = useReducer(StaffReducer,INITIAL_STATE)
    const [customer , setCustomer] = useState([])
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

    const handleDate=(data)=>{
      const date = new Date(data.$y, data.$M , data.$D)

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const formattedDate = `${year}-${month}-${day}`;
      dispatch({type:"DATE_INPUT",payload: formattedDate})
    }

    const cookie = cookies.get("Authorization")

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
      formData.append("id",id)
      try {
        await axios.post(`${apiEndpoint}api/update/deposits`,formData,{
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
      }
      }

      useEffect(()=>{
        setLoading(true)
        const getData= async()=>{
          await axios.get(`${apiEndpoint}api/deposits/${id}?relations=customer`,{
            headers:{
              "Content-Type":"aplication/json",
              Authorization: `Bearer ${cookie}`
            }}).then(response=>{
              dispatch(
                {type:"UPDATE" , payload: response.data}
                )
              })
          await axios.get(`${apiEndpoint}api/customers`,{
                headers:{
                      "Content-Type" : "aplication/json",
                      "Authorization" : `Bearer ${cookie}`
                    }
                  }).then(response=>{
                    setCustomer(response.data.data)
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
          <DialogTitle align='center'>Update Deposit Form</DialogTitle>
          <DialogContent>
      
          {loading ? <div style={{ height:500 , width:400 }}>
            <Loading2/>
           </div>
           :

           (
            <>
             <Autocomplete
          id="country-select-demo"
          name="customer_id"
          sx={style2}
          disableClearable
          options={customer}
          autoHighlight
          onKeyDown={handleKeyDown}
          getOptionLabel={(option) => option.name}
          defaultValue={state.formData && state.formData.customer}
          isOptionEqualToValue={(option, value) => option.id === value.id}
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
                defaultValue={dayjs(state.formData.depositDate)}
                disableFuture
                slotProps={{ textField: { helperText:state.validationErrors.depositDate , error:!!state.validationErrors.depositDate} }}/>
            </DemoContainer>
          </LocalizationProvider>
          <FormControl fullWidth sx={{ marginTop:2 }}  error={!!state.validationErrors.ammount}>
              <InputLabel htmlFor="outlined-adornment-amount">Ammount</InputLabel>
              <OutlinedInput
                id="outlined-adornment-amount"
                startAdornment={<InputAdornment position="start">IDR</InputAdornment>}
                label="Ammount"
                onChange={handleChange}
                name='ammount'
                defaultValue={state.formData.ammount}
                key={state.formData.id}
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
            defaultValue={state.formData.information}
            key={state.formData.id}
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
export default EditForm