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
import { INITIAL_STATE, ProductRecuder } from './productReducer';

const CreateProduct = ({ style2 , openModal , handleCloseModal })=>{
    
    const [supplier,setSupplier] = useState("")
    const [category,setCategory] = useState("")
    const [unit,setUnit] = useState("")
    const {load} = useContext(OutletContext)
    const [state,dispatch] = useReducer(ProductRecuder,INITIAL_STATE)
    const cookies = new Cookies
    const handleChange = e =>{
        dispatch(
          {type:"CHANGE_INPUT" , payload:{name:e.target.name , value:e.target.value}}
        )
    }
    const handleImage=(data)=>{
      dispatch({type:"IMAGE_INPUT",payload: data})
    }
    const cookie = cookies.get("Authorization")
    const handleCreate= async() =>{
      load(true)
      const formData = new FormData()
      formData.append("name",state.name)
      formData.append("urlImage",state.urlImage)
      formData.append("netPrice",state.netPrice)
      formData.append("discount",state.discount)
      formData.append("sellingPrice",state.sellingPrice)
      formData.append("tax",state.tax)
      formData.append("costOfGoodsSold",state.costOfGoodsSold)
      formData.append("supplier_id",state.supplier_id)
      formData.append("category_id",state.category_id)
      formData.append("unit_id",state.unit_id)
      formData.append("stock",state.stock)
      formData.append("coli",state.coli)
      formData.append("information",state.information)
      axios.post("http://localhost:8000/api/products",formData,{
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
        const getSupplier= async()=>{
          axios.get("http://localhost:8000/api/suppliers",{
            headers:{
              "Content-Type":"aplication/json",
              Authorization: `Bearer ${cookie}`
            }
          }).then(response=>{
            setSupplier(response.data)
          })

          axios.get("http://localhost:8000/api/units",{
            headers:{
              "Content-Type":"aplication/json",
              Authorization: `Bearer ${cookie}`
            }
          }).then(response=>{
            setUnit(response.data)
          })

          axios.get("http://localhost:8000/api/categories",{
            headers:{
              "Content-Type":"aplication/json",
              Authorization: `Bearer ${cookie}`
            }
          }).then(response=>{
            setCategory(response.data)
          })
        }
        getSupplier()
      },[])
    return(
        <>
         <Dialog open={openModal} onClose={handleCloseModal} scroll='body'>
        <DialogTitle align='center'>Create Product Form</DialogTitle>
        <DialogContent>
        <TextField
          required
          id="outlined-required"
          label="Name"
          defaultValue=""
          sx={
            style2
          }
          fullWidth
          onChange={handleChange}
          name='name'
        />
        <TextField
          disabled
          id="outlined-disabled"
          label="Stock"
          defaultValue="0"
          sx={
            style2
          }
          fullWidth
        />
        <TextField
          disabled
          id="outlined-disabled"
          label="Coli"
          defaultValue="0"
          sx={
            style2
          }
          fullWidth
        />
        <FormControl fullWidth sx={style2}>
          <InputLabel htmlFor="outlined-adornment-amount">Net Price</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            startAdornment={<InputAdornment position="start">IDR</InputAdornment>}
            label="Net Price"
            onChange={handleChange}
            name='netPrice'
          />
        </FormControl>

        <FormControl fullWidth sx={style2}>
          <InputLabel htmlFor="outlined-adornment-amount">Discount</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            startAdornment={<InputAdornment position="start">IDR</InputAdornment>}
            label="Discount"
            onChange={handleChange}
            name='discount'
          />
        </FormControl>

        <FormControl fullWidth sx={style2}>
          <InputLabel htmlFor="outlined-adornment-amount">Sell Price</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            startAdornment={<InputAdornment position="start">IDR</InputAdornment>}
            label="Sell Price"
            onChange={handleChange}
            name='sellingPrice'
          />
        </FormControl>

        <FormControl fullWidth sx={style2}>
          <InputLabel htmlFor="outlined-adornment-amount">Tax</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            startAdornment={<InputAdornment position="start">IDR</InputAdornment>}
            label="Tax"
            onChange={handleChange}
            name='tax'
          />
        </FormControl>

        <FormControl fullWidth sx={style2}>
          <InputLabel htmlFor="outlined-adornment-amount">COGS</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            startAdornment={<InputAdornment position="start">IDR</InputAdornment>}
            label="COGS"
            onChange={handleChange}
            name='costOfGoodsSold'
          />
        </FormControl>

        <MuiFileInput sx={style2} label="Input Image"  fullWidth value={state.urlImage} onChange={handleImage}/>

        <FormControl fullWidth sx={style2}>
        <InputLabel id="demo-simple-select-label">Supplier</InputLabel>
          <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          label="Supplier"
          value={state.supplier_id}
          onChange={handleChange}
          name='supplier_id'
          >
          {supplier && supplier.map(s=>(
            <MenuItem value={s.id}>{s.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={style2}>
        <InputLabel id="demo-simple-select-label">Category</InputLabel>
          <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          label="Supplier"
          value={state.category_id}
          onChange={handleChange}
          name='category_id'
          >
          {category && category.map(s=>(
            <MenuItem value={s.id}>{s.itemType}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={style2}>
        <InputLabel id="demo-simple-select-label">Unit Type</InputLabel>
          <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          label="Unit Type"
          value={state.unit_id}
          onChange={handleChange}
          name='unit_id'
          >
          {unit && unit.map(s=>(
            <MenuItem value={s.id}>{s.shortname}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
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
export default CreateProduct