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
import { forwardRef, useContext, useEffect, useReducer, useState } from 'react';
import Cookies from 'universal-cookie';
import Loading2 from '../../../Loading/loading2';
import { CategoryRecuder, INITIAL_STATE } from './CategoryReducer';
import { OutletContext } from '../../../layouts/dashboard/OutletProvider';


const Alert = forwardRef((props, ref) =>(
  <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const EditForm = ({ id,style2 , openModal , handleCloseModal})=>{

    const [loading, setLoading] = useState(true);
    const {load} = useContext(OutletContext)
    const [state,dispatch] = useReducer(CategoryRecuder,INITIAL_STATE)
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
        if(field !== "stock" && field !== "coli"){
          if (formData[field] === '' || formData[field] === 0) {
            errors[field] = `${field} is required`;
          }
        }
        if(field === "netPrice" || field === "discount" || field === "sellingPrice" || field === "tax"){
          if (!/^[0-9]+$/.test(formData[field])) {
            errors[field] = "Only numbers from 0 to 9 are allowed,negative number or alphabet isnt allowed";
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
    }


    const handleChange = e =>{
        dispatch(
          {type:"CHANGE_INPUT" , payload:{name:e.target.name , value:e.target.value}},
          {type:"IMAGE_INPUT",   payload: e}
        )
    }
    const handleCreate= async() =>{
      const formdata = { ...state.formData }; // Clone the formData to avoid modifying the original state

      const errors = handleValidation(formdata);

      if (Object.keys(errors).length > 0) {
        return;
      }
      const formData = new FormData()
      formData.append("itemType",state.formData.itemType)
      formData.append("id",id)
      try {
        await axios.post(`${apiEndpoint}api/update/categories`,formData,{
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
          await axios.get(`${apiEndpoint}api/categories/${id}`,{
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
          <DialogTitle align='center'>Update Category Form</DialogTitle>
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
            name='itemType'
            onChange={handleChange}
            defaultValue={state.formData.itemType}
            key={state.formData.id}
            error={!!state.validationErrors.itemType}
            helperText={state.validationErrors.itemType || ' '}
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