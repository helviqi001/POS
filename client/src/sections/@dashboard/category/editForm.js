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
} from '@mui/material';
import { useContext, useEffect, useReducer, useState } from 'react';
import Cookies from 'universal-cookie';
import dayjs from 'dayjs';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Loading2 from '../../../Loading/loading2';
import { CategoryRecuder, INITIAL_STATE } from './CategoryReducer';
import { OutletContext } from '../../../layouts/dashboard/OutletProvider';

const EditForm = ({ id,style2 , openModal , handleCloseModal})=>{

    const [loading, setLoading] = useState(true);
    const {load} = useContext(OutletContext)
    const [state,dispatch] = useReducer(CategoryRecuder,INITIAL_STATE)
    const cookies = new Cookies
    const handleChange = e =>{
        dispatch(
          {type:"CHANGE_INPUT" , payload:{name:e.target.name , value:e.target.value}},
          {type:"IMAGE_INPUT",   payload: e}
        )
    }

    const cookie = cookies.get("Authorization")

    const handleCreate= async() =>{
      load(true)
      const formData = new FormData()
      formData.append("itemType",state.itemType)
      formData.append("id",id)
      axios.post("http://localhost:8000/api/update/categories",formData,{
        headers:{
          Authorization: `Bearer ${cookie}`
        }
      }).then(response=>{
        console.log(response);
      })
      setTimeout(()=>{
        load(false)
      },1000)
      handleCloseModal()
      }

      useEffect(()=>{
        setLoading(true)
        const getData= async()=>{
          await axios.get(`http://localhost:8000/api/categories/${id}`,{
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
          },[])
          console.log(state);
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
            defaultValue={state.itemType}
            key={state.id}
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
        
        </>
    )
}
export default EditForm