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
import { OutletContext } from '../../../layouts/dashboard/OutletProvider';
import { INITIAL_STATE, PositionReducer } from './PositionReducer';

const CreatePosition = ({ style2 , openModal , handleCloseModal })=>{
    
    const {load} = useContext(OutletContext)
    const [state,dispatch] = useReducer(PositionReducer,INITIAL_STATE)
    const cookies = new Cookies
    const handleChange = e =>{
        dispatch(
          {type:"CHANGE_INPUT" , payload:{name:e.target.name , value:e.target.value}},
        )
    }
    const cookie = cookies.get("Authorization")
    const handleCreate= async() =>{
      load(true)
      const formData = new FormData()
      formData.append("name",state.name)
      axios.post("http://localhost:8000/api/positions",formData,{
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
export default CreatePosition