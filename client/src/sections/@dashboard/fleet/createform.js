import axios from 'axios';
// @mui
import {
  Button,
  TextField,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Autocomplete,
  Box,
  Snackbar,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { forwardRef, useContext, useEffect, useReducer, useState } from 'react';
import Cookies from 'universal-cookie';
import { OutletContext } from '../../../layouts/dashboard/OutletProvider';
import { INITIAL_STATE, StaffReducer } from './StaffReducer';



const Alert = forwardRef((props, ref) =>{
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const CreateStaff = ({ style2 , openModal , handleCloseModal })=>{
  const [position , setPosition] = useState([])
  const [staff , setStaff] = useState([])
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
    const handleChangeValidation=(formData)=>{
      const errors = {};
      if(formData.name === 'informations') {
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
    const handleCreate= async() =>{
      const formdata = { ...state.formData }; // Clone the formData to avoid modifying the original state
  
      const errors = handleValidation(formdata);
  
      if (Object.keys(errors).length > 0) {
        return;
      }
      const formData = new FormData()
      formData.append("staff_id",state.formData.staff_id)
      formData.append("plateNumber",state.formData.plateNumber)
      formData.append("informations",state.formData.informations)
      try {
        await axios.post(`${apiEndpoint}api/fleets`,formData,{
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
          axios.get(`${apiEndpoint}api/positions`,{
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
      const handlePosition = async(e)=>{
        const positionId = e.target.value
        await axios.get(`${apiEndpoint}api/positions/${positionId}?relations=staff`,{
        headers:{
          "Content-Type":"aplication/json",
          Authorization: `Bearer ${cookie}`
        }
      }).then(response=>{
        console.log(response);
        setStaff(response.data.staff)
      })
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
        <DialogTitle align='center'>Create Fleet Form</DialogTitle>
        <DialogContent>
          <Autocomplete
            id="country-select-demo"
            name="position_id"
            sx={style2}
            disableClearable
            options={position}
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
                handlePosition({ target: {value: newValue.id } });
              }
            }}
          />
          <Autocomplete
            id="country-select-demo"
            sx={style2}
            disableClearable
            options={staff}
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
                label="Choose a Staff"
                inputProps={{
                  ...params.inputProps,
                }}
                error={!!state.validationErrors.staff_id}
                helperText={state.validationErrors.staff_id || ' '}
              />
            )}
            onChange={(event, newValue) => {
              if (newValue) {
                handleChange({ target: {name:"staff_id" ,value: newValue.id } });
              }
            }}
          />
        <TextField
            id="outlined-disabled"
            label="Plate Number"
            sx={
              style2
            }
            fullWidth
            name='plateNumber'
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            error={!!state.validationErrors.plateNumber}
            helperText={state.validationErrors.plateNumber || ' '}
          />
          
          <TextField
            id="outlined-disabled"
            label="Information"
            sx={
              style2
            }
            fullWidth
            multiline
            name='informations'
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            error={!!state.validationErrors.informations}
            helperText={state.validationErrors.informations || `Number of characters: ${state.formData.informations.length}/600`}
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