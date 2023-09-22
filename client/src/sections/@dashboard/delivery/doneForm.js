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
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { forwardRef, useContext, useEffect, useReducer, useState } from 'react';
import Cookies from 'universal-cookie';
import dayjs from 'dayjs';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers';
import Loading2 from '../../../Loading/loading2';
import { INITIAL_STATE, StaffReducer } from './StaffReducer';
import { OutletContext } from '../../../layouts/dashboard/OutletProvider';
import 'dayjs/locale/en-gb';

const Alert = forwardRef((props, ref) =>{
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
const DoneForm = ({ id,style2 , openModal , handleCloseModal})=>{
    const {load} = useContext(OutletContext)
    const [state,dispatch] = useReducer(StaffReducer,INITIAL_STATE)
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
    
    const handleValidation=(formData)=>{
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


    const cookie = cookies.get("Authorization")

    const handleCreate= async() =>{
      const formdata = { ...state.formData }; // Clone the formData to avoid modifying the original state

      const errors = handleValidation(formdata);

      if (Object.keys(errors).length > 0) {
        return;
      }
      const formData = new FormData()
      formData.append("idDelivery",state.formData.idDelivery)
      formData.append("fleet_id",state.formData.fleet_id)
      formData.append("transaction_id",state.formData.transaction_id)
      formData.append("deliveryDate",state.formData.deliveryDate)
      formData.append("deliveredDate",state.formData.deliveredDate)
      formData.append("status","Done")
      formData.append("information",state.formData.information)
      try {
        await axios.post("http://localhost:8000/api/historydeliveries",formData,{
          headers:{
            Authorization: `Bearer ${cookie}`
          }
        }).then(response=>{
          axios.delete(`http://localhost:8000/api/deliveries/${id}`,{
          headers:{
            "Content-Type" : "aplication/json",
            "Authorization" : `Bearer ${cookie}`
          }
          }).then(response=>{
            console.log(response);
          })
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
        const getData= async()=>{
          await axios.get(`http://localhost:8000/api/deliveries/${id}?relations=fleet,fleet.staff,transaction,transaction.customer`,{
            headers:{
              "Content-Type":"aplication/json",
              Authorization: `Bearer ${cookie}`
            }}).then(response=>{
              dispatch(
                {type:"UPDATE" , payload: response.data}
                )
              })
            }

            getData()
          },[])

        const handleDate=(fieldname,data)=>{
          const date = new Date(data.$y, data.$M , data.$D,data.$H,data.$m,)
    
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          const hour = String(date.getHours()).padStart(2, '0');
          const minute = String(date.getMinutes()).padStart(2, '0');
          const formattedDate = `${year}-${month}-${day} ${hour}:${minute}`;
          dispatch({type:"DATE_INPUT",payload: {name:fieldname , value:formattedDate}})
        }
          console.log(state);
    return(
      <> 
          <Dialog open={openModal} onClose={handleCloseModal} scroll='body'>
          <DialogContent>
            <>
               <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='en-gb'>
                  <DemoContainer
                    components={[
                      'DatePicker',
                      'MobileDatePicker',
                      'DesktopDatePicker',
                      'StaticDatePicker',
                    ]}
                  >
                      <DateTimePicker  label="Delivered Date" 
                      onChange={(data)=>handleDate('deliveredDate',data)} 
                      defaultValue={dayjs(state.formData.deliveredDate)} 
                      key={state.formData.id} 
                      maxDateTime={dayjs().add(1, "day")}
                      slotProps={{ textField: { helperText:state.validationErrors.deliveredDate , error:!!state.validationErrors.deliveredDate} }}/>
                  </DemoContainer>
                </LocalizationProvider>
            </>
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
export default DoneForm