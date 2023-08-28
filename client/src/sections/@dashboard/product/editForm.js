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
import { INITIAL_STATE, ProductRecuder } from './productReducer';
import { OutletContext } from '../../../layouts/dashboard/OutletProvider';

const EditForm = ({ id,style2 , openModal , handleCloseModal , loader })=>{
    
    const [supplier,setSupplier] = useState("")
    const [category,setCategory] = useState("")
    const [unit,setUnit] = useState("")

    const [loading, setLoading] = useState(true);
    const {load} = useContext(OutletContext)
    const [state,dispatch] = useReducer(ProductRecuder,INITIAL_STATE)
    const cookies = new Cookies
    const handleChange = e =>{
        dispatch(
          {type:"CHANGE_INPUT" , payload:{name:e.target.name , value:e.target.value}},
          {type:"IMAGE_INPUT",   payload: e}
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
      formData.append("id",id)
      axios.post("http://localhost:8000/api/update/products",formData,{
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
      useEffect(()=>{
        setLoading(true)
        const getData= async()=>{
          await axios.get("http://localhost:8000/api/suppliers",{
            headers:{
              "Content-Type":"aplication/json",
              Authorization: `Bearer ${cookie}`
            }
          }).then(response=>{
            setSupplier(response.data)
          })

         await axios.get("http://localhost:8000/api/units",{
            headers:{
              "Content-Type":"aplication/json",
              Authorization: `Bearer ${cookie}`
            }
          }).then(response=>{
            setUnit(response.data)
          })

          await axios.get("http://localhost:8000/api/categories",{
            headers:{
              "Content-Type":"aplication/json",
              Authorization: `Bearer ${cookie}`
            }
          }).then(response=>{
            setCategory(response.data)
          })

         await axios.get(`http://localhost:8000/api/products/${id}?relations=category,unit,supplier,restocks`,{
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
    return(
      <> 
          <Dialog open={openModal} onClose={handleCloseModal} scroll='body'>
          <DialogTitle align='center'>Update Product Form</DialogTitle>
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
          <FormControl fullWidth sx={style2}>
            <InputLabel htmlFor="outlined-adornment-amount">Net Price</InputLabel>
            <OutlinedInput
              id="outlined-adornment-amount"
              startAdornment={<InputAdornment position="start">IDR</InputAdornment>}
              label="Net Price"
              onChange={handleChange}
              name='netPrice'
              value={state.netPrice}
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
              value={state.discount}
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
              value={state.sellingPrice}
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
              value={state.tax}
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
              value={state.costOfGoodsSold}
            />
          </FormControl>
  
          <MuiFileInput sx={style2} label="Input Image"  fullWidth value={state.urlImage} onChange={handleImage} helperText={"Kosongkan kolom Input Image jika tidak ingin update*"}/>
  
          <FormControl fullWidth sx={style2}>
          <InputLabel id="demo-simple-select-label">Supplier</InputLabel>
            <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label="Supplier"
            value={state.supplier_id}
            onChange={handleChange}
            name='supplier'
            >
            {supplier && supplier.map((s,i)=>(
              <MenuItem key={i} value={s.id}>{s.name}</MenuItem>
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
            name='category'
            >
            {category && category.map((s,i)=>(
              <MenuItem key={i} value={s.id}>{s.itemType}</MenuItem>
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
            name='unit'
            >
            {unit && unit.map((s,i)=>(
              <MenuItem key={i} value={s.id}>{s.shortname}</MenuItem>
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
            defaultValue={state.information}
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