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
import { OutletContext } from '../../../layouts/dashboard/OutletProvider';
import { CategoryRecuder, INITIAL_STATE } from './CategoryReducer';

const CreateSupplier = ({ style2 , openModal , handleCloseModal })=>{
    
    const {load} = useContext(OutletContext)
    const [state,dispatch] = useReducer(CategoryRecuder,INITIAL_STATE)
    const cookies = new Cookies
    const handleChange = e =>{
        dispatch(
          {type:"CHANGE_INPUT" , payload:{name:e.target.name , value:e.target.value}},
        )
    }
    const handleImage=(data)=>{
      dispatch({type:"IMAGE_INPUT",payload: data})
    }
    const cookie = cookies.get("Authorization")
    const handleCreate= async() =>{
      load(true)
      const formData = new FormData()
      formData.append("itemType",state.itemType)
      axios.post("http://localhost:8000/api/categories",formData,{
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
      console.log(state);
    return(
        <>
         <Dialog open={openModal} onClose={handleCloseModal} scroll='body'>
        <DialogTitle align='center'>Create Category Form</DialogTitle>
        <DialogContent>
        <TextField
            id="outlined-disabled"
            label="Item Type"
            sx={
              style2
            }
            fullWidth
            name='itemType'
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>
        </>
    )
}
export default CreateSupplier