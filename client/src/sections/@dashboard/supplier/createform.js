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
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { OutletContext } from '../../../layouts/dashboard/OutletProvider';
import { INITIAL_STATE, SupplierRecuder } from './SupplierReducer';

const CreateSupplier = ({ style2 , openModal , handleCloseModal })=>{
    
    const {load} = useContext(OutletContext)
    const [state,dispatch] = useReducer(SupplierRecuder,INITIAL_STATE)
    const cookies = new Cookies
    const handleChange = e =>{
        dispatch(
          {type:"CHANGE_INPUT" , payload:{name:e.target.name , value:e.target.value}},
        )
    }
    const handleImage=(data)=>{
      dispatch({type:"IMAGE_INPUT",payload: data})
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
      load(true)
      const formData = new FormData()
      formData.append("name",state.name)
      formData.append("RegisterDate",state.RegisterDate)
      formData.append("address",state.address)
      formData.append("phone",state.phone)
      formData.append("urlImage",state.urlImage)
      formData.append("information",state.information)
      axios.post("http://localhost:8000/api/suppliers",formData,{
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
      console.log(state.RegisterDate);
    return(
        <>
         <Dialog open={openModal} onClose={handleCloseModal} scroll='body'>
        <DialogTitle align='center'>Create Supplier Form</DialogTitle>
        <DialogContent>
        <TextField
            id="outlined-disabled"
            label="Name"
            sx={
              style2
            }
            fullWidth
            name='name'
            onChange={handleChange}
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
                <DatePicker  label="Register Date" onChange={handleDate}/>
            </DemoContainer>
          </LocalizationProvider>
          <TextField
            id="outlined-disabled"
            label="Address"
            sx={
              style2
            }
            fullWidth
            name='address'
            onChange={handleChange}
          />
          <TextField
            id="outlined-disabled"
            label="Phone"
            sx={
              style2
            }
            fullWidth
            name='phone'
            onChange={handleChange}
          />
  
          <MuiFileInput sx={style2} label="Input Image"  fullWidth value={state.urlImage} onChange={handleImage}/>

          <TextField
            id="outlined-disabled"
            label="Information"
            sx={
              style2
            }
            fullWidth
            name='information'
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