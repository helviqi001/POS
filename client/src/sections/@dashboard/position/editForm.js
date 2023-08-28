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
import Loading2 from '../../../Loading/loading2';
import { PositionReducer, INITIAL_STATE } from './PositionReducer';
import { OutletContext } from '../../../layouts/dashboard/OutletProvider';

const EditPosition = ({ id,style2 , openModal , handleCloseModal})=>{

    const [loading, setLoading] = useState(true);
    const {load} = useContext(OutletContext)
    const [state,dispatch] = useReducer(PositionReducer,INITIAL_STATE)
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
      formData.append("name",state.name)
      formData.append("id",id)
      axios.post("http://localhost:8000/api/update/positions",formData,{
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
          await axios.get(`http://localhost:8000/api/positions/${id}`,{
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
            label="Position"
            sx={
              style2
            }
            fullWidth
            name='name'
            onChange={handleChange}
            defaultValue={state.name}
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
export default EditPosition