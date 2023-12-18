// @mui
import { styled } from '@mui/material/styles';
import { Autocomplete, Badge, Box, Button, Card, CardContent, Drawer, FormControl, FormControlLabel, FormHelperText, FormLabel, IconButton, InputAdornment, Paper, Radio, RadioGroup, Stack, Step, StepLabel, Stepper, TextField, Typography } from '@mui/material';
// component
import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import {  DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {usePos } from './posReducer';
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';


// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  zIndex: 999,
  right: 0,
  display: 'flex',
  cursor: 'pointer',
  position: 'fixed',
  alignItems: 'center',
  top: theme.spacing(16),
  height: theme.spacing(5),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(1.25),
  boxShadow: theme.customShadows.z20,
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.paper,
  borderTopLeftRadius: Number(theme.shape.borderRadius) * 2,
  borderBottomLeftRadius: Number(theme.shape.borderRadius) * 2,
  transition: theme.transitions.create('opacity'),
  '&:hover': { opacity: 0.72 },
}));

// ----------------------------------------------------------------------
const steps = [
  'My Cart',
  'Checkout',
  'Finish',
];
const StyledProductImg = styled('img')({
  top: 0,
  width: 250,
  height: 250,
  objectFit: 'cover',
});

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

export default function CartWidget({openModal,handleCloseModal,handleOpenModal}) {
  const {state,dispatch} = usePos()
  const [activeStep, setActiveStep] = useState(0);
  const [staff,setStaff] = useState([])
  const [fleet,setFleet] = useState([])
  const [deposit,setDeposit] = useState({})
  const cookies = new Cookies
  const cookie = cookies.get("Authorization")
  const [customer,setCustomer] = useState([])
  
  const formatedTotal = state.formData.total.toLocaleString('id-ID',{
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
})

  useEffect(()=>{
    const mapping=async()=> {
    axios.get(`${apiEndpoint}api/customers`,{
            headers:{
              "Content-Type":"aplication/json",
              Authorization: `Bearer ${cookie}`
            }
          }).then(response=>{
            setCustomer(response.data.data)
          })
    axios.get(`${apiEndpoint}api/staffs`,{
            headers:{
              "Content-Type":"aplication/json",
              Authorization: `Bearer ${cookie}`
            }
          }).then(response=>{
            setStaff(response.data.data)
          })
    axios.get(`${apiEndpoint}api/fleets?relations=staff`,{
            headers:{
              "Content-Type":"aplication/json",
              Authorization: `Bearer ${cookie}`
            }
          }).then(response=>{
            setFleet(response.data.data)
          })
  } 
    mapping()
  },[])

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "itemsAdded") {
        // Local storage has changed, update your cart here
        const updatedLocalStorageProductList = JSON.parse(e.newValue) || [];
        dispatch({ type: "UPDATE", payload: updatedLocalStorageProductList });
      }
    };
  
    // Add the event listener
    window.addEventListener("storage", handleStorageChange);
  
    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch]);

  const handleValidation=(formData)=>{ 
    const errors = {};
      // Check if paymentMethod is not 'debit'
        if (state.formData.paymentMethod !== 'debit') {
          delete formData.installment;
        }
        if (state.formData.deliveryMethod !== 'delivery') {
          delete formData.fleet_id;
          delete formData.informationDelivery;
        }
    // Perform validation here
    Object.keys(formData).forEach((field) => {
          if (formData[field] === '' || formData[field] === 0 ) {
            errors[field] = `${field} is required`;
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

  const handleValidationQuantity=(formData)=>{ 
    const errors = {};
        formData.forEach((p) => {
          if (p.stock < p.quantity) {
            errors[`quantity-${p.id}`] = `Quantity can't be more than ${p.stock}`;
          }
          dispatch({ type: 'SET_VALIDATION_ERROR', payload: { field: [`quantity-${p.id}`], error: null } });
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
  
  const handleDate=(data)=>{
    const date = new Date(data.$y, data.$M , data.$D,data.$H,data.$m,)

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day} ${hour}:${minute}`;
    dispatch({type:"DATE",payload:formattedDate})
  }

  const handleNext = () => {
    if (activeStep === 0) {
      const errors = handleValidationQuantity(state.product);
      console.log(errors);
      if (Object.keys(errors).length === 0) {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
      }
  else if (activeStep === 1) {
      const errors = handleValidation(state.formData);

    if (Object.keys(errors).length === 0) {
      handleCreate()
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  } 
  if (activeStep === 2){
    handleCloseModal()
    setActiveStep(0);
    dispatch({type:"RESET_STATE"})
  }
  };
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };


  const handleChange=(e,id,stock)=>{
    const newquantity = parseInt(e.target.value,10);

    const updateProduct = state.product.map((p)=>{
      if(p.id === id){
        return {...p, quantity:newquantity}
      }
      return p
    })
    dispatch({type:"UPDATE" , payload:updateProduct})
    const formdata = { name:`quantity-${id}`, value:newquantity,stock,id};
    handleChangeValidation(formdata);
  }

  const handleChangeForm = e =>{
    dispatch(
      {type:"CHANGE_INPUT" , payload:{name:e.target.name , value:e.target.value}},
    )
    const formdata = { name:e.target.name , value:e.target.value };
    handleChangeValidation(formdata);
}
  const handleRadioButton = (name,value) =>{
    dispatch(
      {type:"CHANGE_INPUT" , payload:{name , value}},
    )
}
const handleChangeValidation=(formData)=>{
    const errors = {};
    if(formData.name === `quantity-${formData.id}`) {
      if (formData.value > formData.stock) {
        errors[formData.name] =  `Quantity can't be more than ${formData.stock}`
      }
      dispatch({ type: 'SET_VALIDATION_ERROR', payload: { field: [`quantity-${formData.id}`], error: null } });
    }
    if(formData.name === 'information' || formData.name === "informationDelivery") {
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
  const calculateTotalCost = () => {
    return state.product.reduce((total, item) => {
      return total + item.quantity * Number(item.sellingPrice)
    }, 0);
  };

  // Reset totalState when coli changes
  useEffect(() => {
    state.formData.total = calculateTotalCost()
  }, [state, state.formData.total]);

  const handleCreate= async() =>{
   const staff = JSON.parse(localStorage.getItem('userProfile'))
    try {
      await axios.post(`${apiEndpoint}api/transactions`,{
        staff_id:staff.staff_id,
        fleet_id:state.formData.fleet_id,
        customer_id:state.formData.customer_id,
        transactionDate:state.formData.transactionDate,
        paymentStatus:state.formData.paymentMethod,
        itemStatus:state.formData.deliveryMethod,
        information:state.formData.information,
        informationDelivery:state.formData.informationDelivery,
        total:state.formData.total,
        installment:Number(state.formData.installment),
        product_id:state.product.map(p=>({
          id:p.id,
          quantity:p.quantity
        }))
      },{
        headers:{
          Authorization: `Bearer ${cookie}`
        }
      })
    } catch (error) {
      console.log(error);
    }
    }
      const dataDepositCustomer=async(id)=>{
        await axios.post(`${apiEndpoint}api/getLatest/deposits?relations=customer`,{id},{
          headers:{
            "Content-Type" : "aplication/json",
            "Authorization" : `Bearer ${cookie}`
          }
        }).then(response=>{
          setDeposit([response.data])
        })
      }
  return (
    <>
      <StyledRoot>
        <IconButton onClick={handleOpenModal}>
        <Badge showZero badgeContent={state.product.length} color="error" max={99} >
          <Iconify icon="eva:shopping-cart-fill" width={24} height={24} />
        </Badge>
        </IconButton>
      </StyledRoot>

      <Drawer
        anchor="right"
        open={openModal}
        onClose={handleCloseModal}
        PaperProps={{
          sx: { width: "50%", border: 'none', overflow: 'hidden', padding:3},
        }}
      >
          <Stepper activeStep={activeStep} sx={{ marginBottom:10 }}>
            {steps.map((label, index) => {
              return (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
            <>
            <Scrollbar>
              <Stack>

            {activeStep === 0 && (
              state.product.length > 0 ? (
              state.product.map((p)=>{
              const {name,urlImage,sellingPrice,idProduk,id,quantity,stock} = p
              const formattedAfterDisc = sellingPrice.toLocaleString('id-ID',{
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            })
              return (
                <>
                <Card sx={{ display:"flex" , marginBottom:5 }}>
                <StyledProductImg alt={name} src={`${apiEndpoint}storage/${urlImage}`}/>
                <CardContent sx={{ width:"100%" , display:'flex' , justifyContent:'space-between' , flexDirection:'column'}}>
                  <Box  sx={{ flex: '1 0 auto', display:'flex' , justifyContent:'space-between'}}>
                  <Box>
                  <Typography component="div" variant="h5">
                    {name}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" component="div">
                    IDR {formattedAfterDisc}
                  </Typography>
                  </Box>
                  <Typography variant="subtitle2" color="text.secondary" component="div">
                    Kode: {idProduk}
                  </Typography>
                  </Box>
                  <Box>
                  <TextField
                      id="outlined-start-adornment"
                      sx={{ m: 1, width: '25ch' }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">Qty</InputAdornment>,
                      }}
                      defaultValue={quantity}
                      onChange={(e)=>handleChange(e,id,stock)}
                      error={!!state.validationErrors[`quantity-${id}`]}
                      helperText={state.validationErrors[`quantity-${id}`] || ' '}
                    />
                  </Box>
                </CardContent>
                </Card>
                </>
              )
            })) :
            (
              <>
                <Typography variant="subtitle1" color="text.secondary" component="div" sx={{ textAlign:'center'}}>
                  no items in the cart
                </Typography>
              </>
            )
            )}
            {activeStep === 1 && (
               state.product.length > 0 ? (
                <>
                <Paper elevation={8} sx={{ padding: 5 , marginBottom:5,marginTop:2,width:"90%",marginLeft:"auto",marginRight:"auto" }}>
                    <Typography variant='h6' textAlign={'center'}>Form Checkout</Typography>

                    <Autocomplete
                      id="country-select-demo"
                      name="customer_id"
                      sx={{ marginTop:5 }}
                      disableClearable
                      options={customer}
                      getOptionLabel={(option) => option.name}
                      renderOption={(props, option) => (
                        <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                          {option.name}
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                        {...params}
                        label="Choose a Customer"
                        inputProps={{
                          ...params.inputProps,
                        }}
                        error={!!state.validationErrors.customer_id}
                        helperText={state.validationErrors.customer_id || ' '}
                        />
                        )}
                        onChange={(event,newValue) => {
                          if (newValue) {
                            handleChangeForm({ target: { name: 'customer_id', value: newValue.id } });
                            dataDepositCustomer( newValue.id);
                          }
                      }}
            />
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='en-gb'>
                      <DemoContainer
                        components={[
                          'DatePicker',
                          'MobileDatePicker',
                          'DesktopDatePicker',
                          'StaticDatePicker',
                        ]}
                        sx={{ marginTop:2 }}
                      >
                          <DateTimePicker label="Trasaction Date" onChange={(data)=>handleDate(data)} value={state.formData.transactionDate} slotProps={{ textField: { helperText:state.validationErrors.transactionDate , error:!!state.validationErrors.transactionDate} }}/>
                      </DemoContainer>
                    </LocalizationProvider>
                    
                    <Box sx={{ display:'flex',flexDirection:'column' }}>
                    <FormControl sx={{ marginTop:2 }} error={!!state.validationErrors.paymentMethod}>
                    <FormLabel id="demo-row-radio-buttons-group-label">Payment Method</FormLabel>
                    <RadioGroup
                      aria-labelledby="demo-row-radio-buttons-group-label"
                      name="row-radio-buttons-group"
                      value={state.formData.paymentMethod}
                      onChange={(e)=>handleRadioButton("paymentMethod",e.target.value)}
                    >
                      <FormControlLabel value="cash" control={<Radio />} label="Cash" />
                      {deposit.length > 0 && (
                        deposit.map(d=>(
                          <>
                          {state.formData.total > d.total && (
                            <Box display={'flex'} alignItems={'center'}>
                              <FormControlLabel value="deposit" disabled control={<Radio />} label="Deposit"/>
                              <Typography variant='overline'  color="textSecondary">
                                Balance Deposit: Rp {d.total.toLocaleString('id-ID')}
                              </Typography>
                            </Box>
                             
                           )}
                          {state.formData.total <= d.total && (
                            <Box display={'flex'} alignItems={'center'}>
                             <FormControlLabel value="deposit" control={<Radio />} label="Deposit"/>
                             <Typography variant='overline'>
                                Balance Deposit: Rp {d.total.toLocaleString('id-ID')}
                              </Typography>
                            </Box>
                           )}
                          </>
                        ))
                      )}
                      {state.formData.total > 30000 && (
                        <FormControlLabel value="debit" control={<Radio />} label="Debit" />
                        )}
                      
                      {state.formData.paymentMethod ==='debit' && (
                         <FormControl sx={{ marginTop:2 }} error={!!state.validationErrors.installment}>
                        <RadioGroup
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name="row-radio-buttons-group"
                        row
                        value={state.formData.installment}
                        onChange={(e)=>handleRadioButton("installment",e.target.value)}
                        >
                        <FormControlLabel value={3} control={<Radio />} label="3 Bulan" />
                        <FormControlLabel value={6} control={<Radio />} label="6 Bulan" />
                        <FormControlLabel value={12} control={<Radio />} label="12 Bulan" />
                      </RadioGroup>
                    <FormHelperText>{state.validationErrors.installment}</FormHelperText>
                      </FormControl>
                      )}
                    </RadioGroup>
                    <FormHelperText>{state.validationErrors.paymentMethod}</FormHelperText>
                  </FormControl>

                    <FormControl sx={{ marginTop:2 }} error={!!state.validationErrors.deliveryMethod}>
                    <FormLabel id="demo-row-radio-buttons-group-label">Shipping Method</FormLabel>
                    <RadioGroup
                      aria-labelledby="demo-row-radio-buttons-group-label"
                      name="row-radio-buttons-group"
                      value={state.formData.deliveryMethod}
                      onChange={(e)=>handleRadioButton("deliveryMethod",e.target.value)}
                    >
                      <FormControlLabel value="pickUp" control={<Radio />} label="Pick Up" />
                      <FormControlLabel value="delivery" control={<Radio />} label="Delivery" />
                      {state.formData.deliveryMethod ==='delivery' && (
                        <>
                          <Autocomplete
                                    id="country-select-demo"
                                    sx={{ marginTop:2 }}
                                    disableClearable
                                    options={fleet}
                                    getOptionLabel={(option) => option.staff.name}
                                    renderOption={(props, option) => (
                                      <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                                        {option.staff.name}
                                      </Box>
                                    )}
                                    renderInput={(params) => (
                                      <TextField
                                      {...params}
                                      label="Choose a Fleet"
                                      inputProps={{
                                        ...params.inputProps,
                                      }}
                                      error={!!state.validationErrors.fleet_id}
                                      helperText={state.validationErrors.fleet_id || ' '}
                                      />
                                      )}
                                      onChange={(event,newValue) => {
                                        if (newValue) {
                                          handleChangeForm({ target: { name: 'fleet_id', value: newValue.id } });
                                        }
                                      }}
                            />
                             <TextField
                              id="outlined-disabled"
                              label="information Delivery"
                              fullWidth
                              multiline
                              name='informationDelivery'
                              sx={
                                {
                                  marginBottom:2,
                                  marginTop:2
                                }
                              }
                              onChange={handleChangeForm}
                              error={!!state.validationErrors.informationDelivery}
                              helperText={state.validationErrors.informationDelivery || `Number of characters: ${state.formData.informationDelivery.length}/600`}
                            />
                        </>
                      )}
                    </RadioGroup>
                    <FormHelperText>{state.validationErrors.deliveryMethod}</FormHelperText>
                  </FormControl>
                <TextField
                  id="outlined-disabled"
                  label="Information"
                  sx={
                    {
                      marginBottom:2,
                      marginTop:2
                    }
                  }
                  fullWidth
                  multiline
                  name='information'
                  onChange={handleChangeForm}
                  error={!!state.validationErrors.information}
                  helperText={state.validationErrors.information || `Number of characters: ${state.formData.information.length}/600`}
                />
                    </Box>
                <Typography variant='subtitle1' fontSize={17} sx={{ marginTop:3 }}>Total Purchase :</Typography>
                {state.product.map(p=>{
                  const formattedAfterDisc = p.sellingPrice.toLocaleString('id-ID',{
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  })
                  
                  return(
                  <>
                  <Box display={'flex'} justifyContent={'space-between'} width={'100%'}>
                  <Typography variant='subtitle2' fontSize={12} >{p.name}</Typography>
                  <Typography variant="subtitle2" fontSize={12} color="text.secondary">
                    {p.quantity} X Rp{formattedAfterDisc}
                  </Typography>
                  </Box>
                  </>
                )})}
                  <Typography variant='subtitle2' fontSize={15} textAlign={'end'} sx={{ width: '100%', "::after": { content: '""', whiteSpace: 'nowrap' } }}>
                    +{'-'.repeat(30)}
                  </Typography>
                  <Box display={'flex'} justifyContent={'space-between'} width={'100%'}>
                  <Typography variant='subtitle2' fontSize={12} >Total Payment</Typography>
                  <Typography variant="subtitle2" fontSize={12} color="text.secondary">
                    Rp{formatedTotal}
                  </Typography>
                  </Box>
                </Paper>
                </>
                ) :
                (
                  <>
                  <Typography variant="subtitle1" color="text.secondary" component="div" sx={{ textAlign:'center'}}>
                    no items in the cart
                  </Typography>
                </>
              )
              )}
            {activeStep === 2 && (
                <>
                    <Typography>
                      <>
                      <Box display={'flex' } flexDirection={'column'} alignItems={'center'} marginTop={10}>
                        <i className="fa-regular fa-circle-check" style={{ color: "#19c876", fontSize:250}}/>
                        <Typography variant='subtitle2' fontSize={30} marginTop={5}>Transaction Success</Typography>
                      </Box>
                      </>
                    </Typography>
                    
                </>
            )}
              </Stack>
            </Scrollbar>
              <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2}}>
                <Button
                  color="inherit"
                  disabled={activeStep === 0 || activeStep === 2}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />
                <Button onClick={handleNext}>
                  {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </Box>
            </>
      </Drawer>
    </>
    );
  }
  