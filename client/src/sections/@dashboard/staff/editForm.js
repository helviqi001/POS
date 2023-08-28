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
  Autocomplete,
  Box,
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
import Loading2 from '../../../Loading/loading2';
import { INITIAL_STATE, StaffReducer } from './StaffReducer';
import { OutletContext } from '../../../layouts/dashboard/OutletProvider';

const EditForm = ({ id,style2 , openModal , handleCloseModal})=>{

    const [loading, setLoading] = useState(true);
    const {load} = useContext(OutletContext)
    const [state,dispatch] = useReducer(StaffReducer,INITIAL_STATE)
    const [position , setPosition] = useState([])
    const cookies = new Cookies
    const handleChange = e =>{
        dispatch(
          {type:"CHANGE_INPUT" , payload:{name:e.target.name , value:e.target.value}},
        )
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
      formData.append("registerDate",state.registerDate)
      formData.append("address",state.address)
      formData.append("phone",state.phone)
      formData.append("position_id",state.position_id)
      formData.append("information",state.information)
      formData.append("id",id)
      axios.post("http://localhost:8000/api/update/staffs",formData,{
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
          await axios.get(`http://localhost:8000/api/staffs/${id}`,{
            headers:{
              "Content-Type":"aplication/json",
              Authorization: `Bearer ${cookie}`
            }}).then(response=>{
              dispatch(
                {type:"UPDATE" , payload: response.data}
                )
              })
          await axios.get("http://localhost:8000/api/positions",{
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
          console.log(state);
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
            <TextField
            id="outlined-disabled"
            label="Name"
            sx={
              style2
            }
            fullWidth
            name='name'
            onChange={handleChange}
            defaultValue={state.name}
            key={state.id}
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
                <DatePicker  label="Register Date" onChange={handleDate} defaultValue={dayjs(state.registerDate)} key={state.id}/>
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
            defaultValue={state.address}
            key={state.id}
          />
          <TextField
            id="outlined-disabled"
            label="Phone"
            sx={
              style2
            }
            fullWidth
            name='phone'
            defaultValue={state.phone}
            key={state.id}
          />
  
          <TextField
            id="outlined-disabled"
            label="Information"
            sx={
              style2
            }
            fullWidth
            name='information'
            onChange={handleChange}
            defaultValue={state.information}
            key={state.id}
            />
          <Autocomplete
            id="country-select-demo"
            name="position_id"
            sx={style2}
            options={position}
            autoHighlight
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
              />
            )}
            onChange={(event, newValue) => {
              if (newValue) {
                handleChange({ target: { name: 'position_id', value: newValue.id } });
              }
            }}
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