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
  Snackbar,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { forwardRef, useContext, useEffect, useReducer, useState } from 'react';
import Cookies from 'universal-cookie';
import { OutletContext } from '../../../layouts/dashboard/OutletProvider';
import { INITIAL_STATE, PositionReducer } from './PositionReducer';


const Alert = forwardRef((props, ref) =>{
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
const CreatePosition = ({ style2 , openModal , handleCloseModal })=>{
    
    const {load} = useContext(OutletContext)
    const [state,dispatch] = useReducer(PositionReducer,INITIAL_STATE)
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
    const handleChange = e =>{
        dispatch(
          {type:"CHANGE_INPUT" , payload:{name:e.target.name , value:e.target.value}},
        )
    }
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
    const handleCreate= async() =>{
      const formdata = {...state.formData}; // Clone the formData to avoid modifying the original state

      const errors = handleValidation(formdata);

      if (Object.keys(errors).length > 0) {
        return;
      }
      const formData = new FormData()
      formData.append("name",state.formData.name)
      try {
        await axios.post("http://localhost:8000/api/positions",formData,{
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
    return(
        <>
         <Dialog open={openModal} onClose={handleCloseModal} scroll='body'>
        <DialogTitle align='center'>Create Category Form</DialogTitle>
        <DialogContent>
        <TextField
            id="outlined-disabled"
            label="Position"
            sx={
              style2
            }
            fullWidth
            name='name'
            onChange={handleChange}
            error={!!state.validationErrors.name}
            helperText={state.validationErrors.name || ' '}
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
export default CreatePosition