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
  const [position , setPosition] = useState([])
  const [staff , setStaff] = useState([])
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
      formData.append("idFleet",state.formData.idFleet)
      formData.append("staff_id",state.formData.staff_id)
      formData.append("plateNumber",state.formData.plateNumber)
      formData.append("informations",state.formData.informations)
      formData.append("id",id)
      try {
        await axios.post(`${apiEndpoint}api/update/fleets`,formData,{
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
        setLoading(true)
        const getData= async()=>{
          await axios.get(`${apiEndpoint}api/fleets/${id}?relations=staff.position,staff`,{
            headers:{
              "Content-Type":"aplication/json",
              Authorization: `Bearer ${cookie}`
            }}).then(response=>{
              dispatch(
                {type:"UPDATE" , payload: response.data}
                )
              })
              axios.get(`${apiEndpoint}api/positions`,{
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
          <DialogTitle align='center'>Update Staff Form</DialogTitle>
          <DialogContent>
      
          {loading ? <div style={{ height:500 , width:400 }}>
            <Loading2/>
           </div>
           :

           (
            <>
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
            defaultValue={state.formData.plateNumber}
            onChange={handleChange}
            error={!!state.validationErrors.plateNumber}
            helperText={state.validationErrors.plateNumber || ' '}
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
            name='informations'
            defaultValue={state.formData.informations}
            onChange={handleChange}
            error={!!state.validationErrors.informations}
            helperText={state.validationErrors.informations || `Number of characters: ${state.formData.informations.length}/600`}
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