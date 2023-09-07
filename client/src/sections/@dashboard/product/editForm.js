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
  FormHelperText,
  Box,
  Autocomplete,
  Snackbar,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { forwardRef, useContext, useEffect, useReducer, useState } from 'react';
import Cookies from 'universal-cookie';
import Loading2 from '../../../Loading/loading2';
import { INITIAL_STATE, ProductRecuder } from './productReducer';
import { OutletContext } from '../../../layouts/dashboard/OutletProvider';


const Alert = forwardRef((props, ref) =>{
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
const EditForm = ({ id,style2 , openModal , handleCloseModal , loader })=>{
    
    const [supplier,setSupplier] = useState("")
    const [category,setCategory] = useState("")
    const [unit,setUnit] = useState("")

    const [loading, setLoading] = useState(true);
    const {load} = useContext(OutletContext)
    const [state,dispatch] = useReducer(ProductRecuder,INITIAL_STATE)
    const cookies = new Cookies
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

    const handleChangeValidation=(formData)=>{
      const errors = {};
        if(formData.name === "netPrice" || formData.name === "discount" || formData.name === "tax"){
          if (!/^[0-9]*$/.test(formData.value)) {
            errors[formData.name] = "Only numbers from 0 to 9 are allowed,negative number or alphabet isnt allowed";
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
    
    console.log(state);
    const handleValidation = (formData) => {
      const errors = {};
    
      // Perform validation here
      Object.keys(formData).forEach((field) => {
        if (field !== "stock" && field !== "coli" && field !== "discount") {
          if (formData[field] === '' || formData[field] === 0) {
            errors[field] = `${field} is required`;
          }
        }
        if (field === "netPrice" || field === "discount" || field === "tax") {
          if (!/^[0-9]+$/.test(formData[field])) {
            errors[field] = "Only numbers from 0 to 9 are allowed, negative number or alphabet isn't allowed";
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
    };
    

    const calculateTotalCost = () => {
      return (Number(state.formData.netPrice) * (100 + Number(state.formData.margin))) / 100
    };
    
    // Reset totalState when coli changes
    useEffect(() => {
      const newSellingPrice = calculateTotalCost();
      dispatch({
        type: 'SET_SELLING_PRICE',
        payload: newSellingPrice,
      });
    }, [state.formData.netPrice, state.formData.margin]);

    const handleChange = e =>{
      dispatch(
        {type:"CHANGE_INPUT" , payload:{name:e.target.name , value:e.target.value}},
        {type:"IMAGE_INPUT",   payload: e}
      )
      const formdata = { name:e.target.name , value:e.target.value }; // Clone the formData to avoid modifying the original state

      handleChangeValidation(formdata);

    }
    const handleImage=(data)=>{
      dispatch({type:"IMAGE_INPUT",payload: data})
    }
    const cookie = cookies.get("Authorization")
    const handleCreate= async() =>{
      const formdata = {...state.formData}; // Clone the formData to avoid modifying the original state

      const errors = handleValidation(formdata);

      if (Object.keys(errors).length > 0) {
        return;
      }
      const formData = new FormData()
      formData.append("name",state.formData.name)
      formData.append("urlImage",state.formData.urlImage)
      formData.append("netPrice",state.formData.netPrice)
      formData.append("discount",state.formData.discount)
      formData.append("sellingPrice",state.formData.sellingPrice)
      formData.append("tax",state.formData.tax)
      formData.append("costOfGoodsSold",state.formData.costOfGoodsSold)
      formData.append("supplier_id",state.formData.supplier_id)
      formData.append("category_id",state.formData.category_id)
      formData.append("unit_id",state.formData.unit_id)
      formData.append("stock",state.formData.stock)
      formData.append("coli",state.formData.coli)
      formData.append("information",state.formData.information)
      formData.append("id",id)
      try {
        await axios.post("http://localhost:8000/api/update/products",formData,{
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
            defaultValue={state.formData.name}
            key={state.formData.id}
            error={!!state.validationErrors.name}
            helperText={state.validationErrors.name || ' '}
          />
          <TextField
            disabled
            id="outlined-disabled"
            label="Stock"
            defaultValue={state.formData.stock}
            sx={
              style2
            }
            fullWidth
          />
        <Box sx={{ display:"flex" , justifyContent:"space-evenly"}}>
        <FormControl fullWidth sx={style2}>
          <InputLabel htmlFor="outlined-adornment-amount">Net Price</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            startAdornment={<InputAdornment position="start">IDR</InputAdornment>}
            label="Net Price"
            onChange={handleChange}
            name='netPrice'
            defaultValue={state.formData.netPrice}
            error={!!state.validationErrors.netPrice}
          />
          <FormHelperText sx={{ color:"#f44336" }}>{state.validationErrors.netPrice || ' '}</FormHelperText>
        </FormControl>

        <FormControl sx={style2}>
          <InputLabel htmlFor="outlined-adornment-amount">Margin</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            startAdornment={<InputAdornment position="start">%</InputAdornment>}
            label="Margin"
            onChange={handleChange}
            defaultValue={state.formData.margin}
            name='margin'
            error={!!state.validationErrors.margin}
          />
          <FormHelperText sx={{ color:"#f44336" }}>{state.validationErrors.margin || ' '}</FormHelperText>
        </FormControl>
        </Box>
  
          <FormControl fullWidth sx={style2}>
            <InputLabel htmlFor="outlined-adornment-amount">Discount</InputLabel>
            <OutlinedInput
              id="outlined-adornment-amount"
              startAdornment={<InputAdornment position="start">IDR</InputAdornment>}
              label="Discount"
              onChange={handleChange}
              name='discount'
              value={state.formData.discount}
              error={!!state.validationErrors.discount}
            />
             <FormHelperText sx={{ color:"#f44336" }}>{state.validationErrors.discount || ' '}</FormHelperText>
          </FormControl>
  
          <FormControl fullWidth sx={style2}>
            <InputLabel htmlFor="outlined-adornment-amount">Sell Price</InputLabel>
            <OutlinedInput
              disabled
              id="outlined-adornment-amount"
              startAdornment={<InputAdornment position="start">IDR</InputAdornment>}
              label="Sell Price"
              name='sellingPrice'
              value={state.formData.sellingPrice}
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
              value={state.formData.tax}
              error={!!state.validationErrors.tax}
            />
             <FormHelperText sx={{ color:"#f44336" }}>{state.validationErrors.tax || ' '}</FormHelperText>
          </FormControl>
  
          <MuiFileInput sx={style2} label="Input Image"  fullWidth value={state.formData.urlImage} onChange={handleImage} helperText={"Kosongkan kolom Input Image jika tidak ingin update*"}/>
  
          <Autocomplete
            id="country-select-demo"
            name="supplier_id"
            sx={style2}
            disableClearable
            options={supplier}
            autoHighlight
            getOptionLabel={(option) => option.name}
            defaultValue={state.formData && state.formData.supplier}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(props, option) => (
              <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                {option.name}
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Choose a Supplier"
                inputProps={{
                  ...params.inputProps,
                }}
                error={!!state.validationErrors.supplier_id}
                helperText={state.validationErrors.supplier_id || ' '}
              />
            )}
            onChange={(event, newValue) => {
              if (newValue) {
                handleChange({ target: { name: 'supplier_id', value: newValue.id } });
              }
            }}
          />

        <Autocomplete
            id="country-select-demo"
            name="category_id"
            sx={style2}
            disableClearable
            options={category}
            autoHighlight
            defaultValue={state.formData && state.formData.category}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(option) => option.itemType}
            renderOption={(props, option) => (
              <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                {option.itemType}
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Choose a Category"
                inputProps={{
                  ...params.inputProps,
                }}
                error={!!state.validationErrors.category_id}
                helperText={state.validationErrors.category_id || ' '}
              />
            )}
            onChange={(event, newValue) => {
              if (newValue) {
                handleChange({ target: { name: 'category_id', value: newValue.id } });
              }
            }}
            
          />
        <Autocomplete
            id="country-select-demo"
            name="unit_id"
            sx={style2}
            disableClearable
            options={unit}
            getOptionLabel={(option) => option.shortname}
            defaultValue={state.formData && state.formData.unit}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(props, option) => (
              <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                {option.shortname}
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Choose a Unit"
                inputProps={{
                  ...params.inputProps,
                }}
                error={!!state.validationErrors.unit_id}
                helperText={state.validationErrors.unit_id || ' '}
              />
            )}
            onChange={(event,newValue) => {
              if (newValue) {
                handleChange({ target: { name: 'unit_id', value: newValue.id } });
              }
            }}
            
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
            defaultValue={state.formData.information}
            key={state.formData.id}
            error={state.validationErrors.information}
            helperText={state.validationErrors.information || ' '}
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