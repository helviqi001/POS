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
  FormHelperText,
  Box,
  Autocomplete,
  Snackbar,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { forwardRef, useContext, useEffect, useReducer, useState } from 'react';
import Cookies from 'universal-cookie';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { OutletContext } from '../../../layouts/dashboard/OutletProvider';
import Loading2 from '../../../Loading/loading2';
import { INITIAL_STATE, ProductRecuder } from './productReducer';


const Alert = forwardRef((props, ref) =>{
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
const EditForm = ({ id,style2 , openModal , handleCloseModal , loader })=>{
    
    const [supplier,setSupplier] = useState("")
    const [category,setCategory] = useState("")
    const [unit,setUnit] = useState("")

    const [loading, setLoading] = useState(true);
    const {load} = useContext(OutletContext)
    const [state,dispatch] = useReducer(ProductRecuder,INITIAL_STATE)
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
        if(formData.name === "netPrice" || formData.name === "discount" || formData.name === "tax"){
          if (!/^[0-9]*$/.test(formData.value)) {
            errors[formData.name] = "Only numbers from 0 to 9 are allowed,negative number or alphabet isnt allowed";
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
    
    console.log(state);
    const handleValidation = (formData) => {
      const errors = {};
    
      // Perform validation here
      Object.keys(formData).forEach((field) => {
        if (field !== "stock" && field !== "coli" && field !== "discount") {
          if (formData[field] === '' || formData[field] === 0) {
            errors[field] = `${field} is required`;
          }
        }
        if (field === "netPrice" || field === "discount" || field === "tax") {
          if (!/^[0-9]+$/.test(formData[field])) {
            errors[field] = "Only numbers from 0 to 9 are allowed, negative number or alphabet isn't allowed";
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
    };
    const handleChange = e =>{
      dispatch(
        {type:"CHANGE_INPUT" , payload:{name:e.target.name , value:e.target.value}},
        {type:"IMAGE_INPUT",   payload: e}
      )
      const formdata = { name:e.target.name , value:e.target.value }; // Clone the formData to avoid modifying the original state

      handleChangeValidation(formdata);

    }
    const cookie = cookies.get("Authorization")
    const handleCreate= async() =>{
      const formdata = {...state.formData}; // Clone the formData to avoid modifying the original state

      const errors = handleValidation(formdata);

      if (Object.keys(errors).length > 0) {
        return;
      }
      const formData = new FormData()
      formData.append("idTransaction",state.formData.transaction.idTransaction)
      formData.append("customer_id",state.formData.customer_id)
      formData.append("nominal",state.formData.nominal)
      formData.append("information",state.formData.information)
      formData.append("dueDate",state.formData.dueDate)
      formData.append("status",state.formData.status)
      formData.append("id",id)
      try {
        await axios.post("http://localhost:8000/api/update/debits",formData,{
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

         await axios.get(`http://localhost:8000/api/debits/${id}?relations=customer,transaction`,{
            headers:{
              "Content-Type":"aplication/json",
              Authorization: `Bearer ${cookie}`
            }}).then(response=>{
              dispatch(
                {type:"UPDATE" , payload: response.data}
              )
            })
            setLoading(false)
          }

          getData()
      },[])
    return(
      <> 
          <Dialog open={openModal} onClose={handleCloseModal} scroll='body'>
          <DialogTitle align='center'>Update Product Form</DialogTitle>
          <DialogContent>
      
          {loading ? <div style={{ height:500 , width:400 }}>
            <Loading2/>
           </div>
           :

           (
            <>
            <TextField
            id="outlined-disabled"
            label="Id Transaction"
            sx={
              {marginTop:3}
            }
            fullWidth
            disabled
            defaultValue={state.formData.transaction.idTransaction}
            key={state.formData.transaction.idTransaction}
          />
          <TextField
            disabled
            id="outlined-disabled"
            label="Customer Name"
            defaultValue={state.formData.customer.name}
            key={state.formData.customer.name}
            sx={
              {marginTop:3}
            }
            fullWidth
          />
            <FormControl fullWidth 
            sx={
              {marginTop:3}
            }>
          <InputLabel htmlFor="outlined-adornment-amount">Nominal</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            startAdornment={<InputAdornment position="start">IDR</InputAdornment>}
            label="Nominal"
            name='netPrice'
            disabled
            defaultValue={state.formData.nominal}
            key={state.formData.nominal}
          />
        </FormControl>
          
          <TextField
            disabled
            id="outlined-disabled"
            label="Information"
            sx={
              {marginTop:3}
            }
            fullWidth
            onChange={handleChange}
            defaultValue={state.formData.information}
            key={state.formData.information}
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
                <DatePicker  label="Register Date"
                defaultValue={dayjs(state.formData.dueDate)} 
                key={state.formData.id} 
                sx={
                  {marginTop:2}
                } 
                disabled/>
            </DemoContainer>
          </LocalizationProvider>
          <FormControl  
          sx={
            {marginTop:3}
            } 
          fullWidth
          >
          <InputLabel id="demo-simple-select-label">Status</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={state.formData.status}
            defaultValue={state.formData.status}
            label="Status"
            onChange={handleChange}
            name='status'
          >
            <MenuItem value={"Paid Off"}>Paid Off</MenuItem>
            <MenuItem value={"Not Paid Off"}>Not Paid Off</MenuItem>
          </Select>
        </FormControl>
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