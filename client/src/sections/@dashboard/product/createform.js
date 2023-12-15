import { MuiFileInput } from 'mui-file-input';
import axios from 'axios';
// @mui
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  FormHelperText,
  Box,
  Autocomplete,
  Snackbar,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { forwardRef, useContext, useEffect, useReducer, useState } from 'react';
import Cookies from 'universal-cookie';
import { OutletContext } from '../../../layouts/dashboard/OutletProvider';
import { INITIAL_STATE, ProductRecuder } from './productReducer';

const Alert = forwardRef((props, ref) =>{
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

export default function CreateProduct({ style2 , openModal , handleCloseModal }){
  
  const [supplier,setSupplier] = useState("")
  const [category,setCategory] = useState("")
  const [unit,setUnit] = useState([])
  const {load} = useContext(OutletContext)
  const [state,dispatch] = useReducer(ProductRecuder,INITIAL_STATE)
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
  
  const handleChangeValidation=(formData)=>{
      const errors = {};

        if(formData.name === "netPrice" || formData.name === "discount" || formData.name === "sellingPrice" || formData.name === "tax"){
          if (!/^[0-9]*$/.test(formData.value)) {
            errors[formData.name] = "Only numbers from 0 to 9 are allowed,negative number or alphabet isnt allowed";
          }
        }
        if(formData.name === 'information') {
          if (formData.value.length > 600) {
            errors[formData.name] = 'Information cannot exceed 600 characters.';
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
    
    const handleValidation=(formData)=>{
      const errors = {};
      
      // Perform validation here
      Object.keys(formData).forEach((field) => {
      if (field !== "stock" && field !== "coli" && field !== "discount") {
        if (formData[field] === '' || formData[field] === 0) {
          errors[field] = `${field} is required`;
        }
      }
        if(field === "netPrice" || field === "discount"|| field === "tax"){
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
        {type:"CHANGE_INPUT" , payload:{name:e.target.name , value:e.target.value}}
      )
      const formdata = { name:e.target.name , value:e.target.value }; // Clone the formData to avoid modifying the original state

      handleChangeValidation(formdata);
    }

    const calculateTotalCost = () => {
      const netPrice = Number(state.formData.netPrice);
      const margin = Number(state.formData.margin);
      const tax = Number(state.formData.tax);
      
      const sellingPrice = netPrice + (netPrice * (margin / 100))  + (netPrice*(tax/100));
      
      return sellingPrice
    };
    
    // Reset totalState when coli changes
    useEffect(() => {
      const newSellingPrice = calculateTotalCost();
      dispatch({
        type: 'SET_SELLING_PRICE',
        payload: newSellingPrice,
      });
    }, [state.formData.netPrice, state.formData.margin,state.formData.tax]);

    const handleImage=(data)=>{
      dispatch({type:"IMAGE_INPUT",payload: data})
    }
    const handleCreate= async() =>{
      const formdata = { ...state.formData }; // Clone the formData to avoid modifying the original state

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
      formData.append("margin",state.formData.margin)
      formData.append("supplier_id",state.formData.supplier_id)
      formData.append("category_id",state.formData.category_id)
      formData.append("unit_id",state.formData.unit_id)
      formData.append("stock",0)
      formData.append("coli",0)
      formData.append("information",state.formData.information)
      try {
        await axios.post(`${apiEndpoint}api/products`,formData,{
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
        const getSupplier= async()=>{
          axios.get(`${apiEndpoint}api/suppliers`,{
            headers:{
              "Content-Type":"aplication/json",
              Authorization: `Bearer ${cookie}`
            }
          }).then(response=>{
            setSupplier(response.data)
          })

          axios.get(`${apiEndpoint}api/units`,{
            headers:{
              "Content-Type":"aplication/json",
              Authorization: `Bearer ${cookie}`
            }
          }).then(response=>{
            setUnit(response.data)
          })

          axios.get(`${apiEndpoint}api/categories`,{
            headers:{
              "Content-Type":"aplication/json",
              Authorization: `Bearer ${cookie}`
            }
          }).then(response=>{
            setCategory(response.data)
          })
        }
        getSupplier()
      },[cookie])

      const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
          // Tombol Enter ditekan, panggil handleClick
          handleCreate();
        }
      }
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
          error={!!state.validationErrors.name}
          helperText={state.validationErrors.name || ' '}
          onKeyDown={handleKeyDown}
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
          onKeyDown={handleKeyDown}
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
          onKeyDown={handleKeyDown}
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
            error={!!state.validationErrors.netPrice}
            onKeyDown={handleKeyDown}
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
            name='margin'
            error={!!state.validationErrors.margin}
            onKeyDown={handleKeyDown}
            />
          <FormHelperText sx={{ color:"#f44336" }}>{state.validationErrors.margin || ' '}</FormHelperText>
        </FormControl>

        </Box>

        <FormControl fullWidth sx={style2}>
          <InputLabel htmlFor="outlined-adornment-amount">Discount</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            startAdornment={<InputAdornment position="start">%</InputAdornment>}
            label="Discount"
            onChange={handleChange}
            name='discount'
            error={!!state.validationErrors.discount}
            onKeyDown={handleKeyDown}
            />
          <FormHelperText sx={{ color:"#f44336" }}>{state.validationErrors.discount || ' '}</FormHelperText>
        </FormControl>

        <FormControl fullWidth sx={style2}>
          <InputLabel htmlFor="outlined-adornment-amount">Tax</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            startAdornment={<InputAdornment position="start">%</InputAdornment>}
            label="Tax"
            onChange={handleChange}
            name='tax'
            error={!!state.validationErrors.tax}
            onKeyDown={handleKeyDown}
            />
          <FormHelperText sx={{ color:"#f44336" }}>{state.validationErrors.tax || ' '}</FormHelperText>

        </FormControl>
        <FormControl fullWidth sx={style2}>
          <InputLabel htmlFor="outlined-adornment-amount">Sell Price</InputLabel>
          <OutlinedInput
            disabled
            id="outlined-adornment-amount"
            startAdornment={<InputAdornment position="start">IDR</InputAdornment>}
            label="Sell Price"
            value={state.formData.sellingPrice}
            name='sellingPrice'
            onKeyDown={handleKeyDown}
            />
        </FormControl>

        
        <FormControl fullWidth>
        <MuiFileInput sx={style2} label="Input Image"  fullWidth value={state.formData.urlImage} onChange={handleImage} 
          error={!!state.validationErrors.urlImage} onKeyDown={handleKeyDown}
          />
         <FormHelperText sx={{ color:"#f44336" }}>{state.validationErrors.urlImage || ' '}</FormHelperText>
        </FormControl>
          

        <Autocomplete
            id="country-select-demo"
            name="supplier_id"
            sx={style2}
            disableClearable
            options={supplier}
            autoHighlight
            getOptionLabel={(option) => option.name}
            renderOption={(props, option) => (
              <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                {option.name}
              </Box>
            )}
            onKeyDown={handleKeyDown}
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
            getOptionLabel={(option) => option.itemType}
            renderOption={(props, option) => (
              <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                {option.itemType}
              </Box>
            )}
            onKeyDown={handleKeyDown}
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
            renderOption={(props, option) => (
              <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                {option.shortname}
              </Box>
            )}
            onKeyDown={handleKeyDown}
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
          multiline
          name='information'
          onChange={handleChange}
          error={!!state.validationErrors.information}
          helperText={state.validationErrors.information || `Number of characters: ${state.formData.information.length}/600`}

          onKeyDown={handleKeyDown}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleCreate}>Create</Button>
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