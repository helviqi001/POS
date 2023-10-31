
import { useContext, useEffect, useReducer, useState } from 'react';
import Cookies from 'universal-cookie/cjs/Cookies';
import axios from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
// @mui
import {
  Card,
  Table,
  Button,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  Box,
  FormControl,
  OutlinedInput,
  InputAdornment,
  FormHelperText,
} from '@mui/material';
// components
import dayjs from 'dayjs';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
// sections
// import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
// mock
import { OutletContext } from '../../../layouts/dashboard/OutletProvider';
import { ReturnReducer, SUPPLIER_STATE } from './ReturnReducer';
import RestockListHead from './restockListHead';
// ----------------------------------------------------------------------

const TABLE_HEAD2 = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'quantity', label: 'quantity', alignRight: false },
  { id: 'coli', label: 'coli', alignRight: false },
  { id: 'cost_of_goods_sold', label: 'Cost of goods sold (IDR)', alignRight: false },
];

// ----------------------------------------------------------------------

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

export default function EditReturn() {
  const {menu,item} = useParams()

  const location = useLocation();
  
  const id = location.state?.id

  const [totalSpend, setTotalState] = useState(0);
  
  const cookies = new Cookies()

  const [productList,setProduct] = useState([])

  const [newProduct,setNew] = useState([])

  const [state,dispatch] = useReducer(ReturnReducer,SUPPLIER_STATE)

  const cookie = cookies.get("Authorization")

  const {load} = useContext(OutletContext)

  const navigate = useNavigate()
  const [validationErrors, setValidationErrors] = useState({});


  const validateQuantity = (quantity) => {
    if (!/^[0-9]+$/.test(quantity)) {
      return "Only numbers from 0 to 9 are allowed,negative number or alphabet isnt allowed";
    }
    return ''; // No error
  };
  
  const validateColi = (coli) => {
    if (!/^[0-9]+$/.test(coli)) {
      return "Only numbers from 0 to 9 are allowed,negative number or alphabet isnt allowed";
    }
    return ''; // No error
  };

  useEffect(()=>{
    const getdata=async()=>{
      await axios.get(`${apiEndpoint}api/returs/${id}?relations=products`,{
        headers:{
          "Content-Type" : "aplication/json",
          "Authorization" : `Bearer ${cookie}`
        }
      }).then(response=>{
        setProduct([response.data])
        setTotalState(response.data.totalSpend)
        const newProducts = response.data.products.map(product => ({
          ...product,
          coli: product.pivot.coli,
          quantity: product.pivot.quantity
        }));
        const Productadded = [...newProduct, ...newProducts]; 
        setNew(Productadded)

        dispatch(
          {type:"UPDATE" , payload: response.data}
          )
      })
    }
    getdata()
  },[])
    const handleDate=(data)=>{
    const date = new Date(data.$y, data.$M , data.$D)

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${year}-${month}-${day}`;
    dispatch({type:"DATE_INPUT",payload: formattedDate})
  }


  const handleChange = (e) => {
    const productId = e.target.name.split('-')[1];
    const updatedId = newProduct.map(item => {
      if (item.id === Number(productId)) {
        if (e.target.name.split('-')[0] === 'quantity') {
          const quantity = Number(e.target.value);
          // Perform quantity validation here
          const quantityError = validateQuantity(quantity);
          setValidationErrors((prevState) => ({
            ...prevState,
            [`quantity-${productId}`]: quantityError,
          }));
          return { ...item, quantity };
        } 
        if (e.target.name.split('-')[0] === 'coli') {
          const coli = Number(e.target.value);
          // Perform coli validation here
          const coliError = validateColi(coli);
          setValidationErrors((prevState) => ({
            ...prevState,
            [`coli-${productId}`]: coliError,
          }));
          return { ...item, coli };
        }
      }
      return item;
    });
  
    setNew(updatedId);
  };
  
  // Calculate total cost based on id, quantity, and costOfGoodsSold
  const calculateTotalCost = () => {
    return newProduct.reduce((total, item) => {
      return total+item.quantity * item.costOfGoodsSold
    }, 0);
  };
  
  // Reset totalState when coli changes
  useEffect(() => {
    setTotalState(calculateTotalCost());
  }, [newProduct, totalSpend]);

  const handleCreate=async()=>{
    const validationErrors = {};
    newProduct.forEach((item) => {
      const { id, quantity, coli } = item;
      if (quantity === 0) {
        validationErrors[`quantity-${id}`] = 'Quantity cannot be 0 ';
      }
      if (coli === 0  ) {
        validationErrors[`coli-${id}`] = 'Coli cannot be 0';
      }
    });
    if(state.restockDate === ''){
      validationErrors.restockDate = 'restockDate Should be filled';
    }
    setValidationErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
    load(true)
    await axios.post(`${apiEndpoint}api/update/returs`,{id,supplier_id:state.supplier_id , returnDate:state.returnDate , totalSpend , product_id:newProduct.map(p=>({id:p.id,quantity:p.quantity,coli:p.coli}))},{
      headers : {
        "Content-Type" : 'application/json',
        Authorization: `Bearer ${cookie}`
      }
    }).then(response=>{
      console.log(response);
    })
    await load(false)
    navigate(`/dashboard/return/${menu}/${item}`)
  }
  }
  console.log(newProduct);
  console.log(state);
  const formattedTotalSpend = totalSpend.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // Tombol Enter ditekan, panggil handleClick
      handleCreate();
    }
  }
  return (
    <>
      <Container>

        <Card sx={{ marginTop:10 , display:'flex'}}>
          {productList && productList.map((row) => {
            return(
            <>
          <Box 
          sx={
            { 
              width:"100%",
              paddingTop:2,
              boxSizing:'border-box',
              backgroundColor:"#F4F6F8"
            }
          }>
            <TableContainer>
              <Table>
                <RestockListHead
                  headLabel={TABLE_HEAD2}
                />
                <TableBody>
                    {row.products.map(p=>(
                      <TableRow hover key={p.id} tabIndex={-1} role="checkbox">
                      <TableCell component="th" scope="row" padding="none" align='center'>
                          <Typography variant="subtitle2" noWrap>
                            {p.name}
                          </Typography>
                      </TableCell>

                     <TableCell align="center">
                     <FormControl>
                        <OutlinedInput
                          id="outlined-adornment-amount"
                          startAdornment={<InputAdornment position="start">Pcs</InputAdornment>}
                          name={`quantity-${p.id}`}
                          onChange={handleChange}
                          defaultValue={p.pivot.quantity}
                          key={p.id}
                          error={validationErrors[`quantity-${p.id}`]}
                          onKeyDown={handleKeyDown}
                        />
                        <FormHelperText sx={{ color:"#f44336" }}>{validationErrors[`quantity-${p.id}`]}</FormHelperText>
                      </FormControl>
                     </TableCell>

                     <TableCell align="center">
                     <FormControl>
                        <OutlinedInput
                          id="outlined-adornment-amount"
                          startAdornment={<InputAdornment position="start">Coli</InputAdornment>}
                          name={`coli-${p.id}`}
                          onChange={handleChange}
                          defaultValue={p.pivot.coli}
                          key={p.id}
                          error={validationErrors[`coli-${id}`]}
                          onKeyDown={handleKeyDown}
                        />
                         <FormHelperText sx={{ color:"#f44336" }}>{validationErrors[`coli-${p.id}`]}</FormHelperText>
                      </FormControl>
                     </TableCell>

                      <TableCell align="center">{p.costOfGoodsSold}</TableCell>
                        </TableRow>
                        ))}
                </TableBody>

              </Table>
            </TableContainer>
          </Box>
          <Box 
          sx={
            { 
              width:"50%",
              boxSizing:'border-box',
              backgroundColor:"white"
            }
          }>
            <>
              <div style={{ display:'flex' , flexDirection:'column' , alignItems:'center' }}>
              <LocalizationProvider dateAdapter={AdapterDayjs} >
                <DemoContainer
                  components={[
                    'DatePicker',
                    'MobileDatePicker',
                    'DesktopDatePicker',
                    'StaticDatePicker',
                  ]}
                  >
                    <DatePicker  label="Restock Date" onChange={handleDate} sx={{marginTop:5}} defaultValue={dayjs(row.restockDate)}  slotProps={{ textField: { helperText:validationErrors.returnDate , error:!!validationErrors.returnDate}}}/>
                </DemoContainer>
              </LocalizationProvider>
              <Typography variant='subtitile2'>TOTAL REFUND IDR {formattedTotalSpend}</Typography>
              <Button  variant="contained" onClick={handleCreate}  sx={{marginBottom:5}}>Update</Button>
              </div>
            </>
          </Box>
            </>)
})}
        </Card>
      </Container>
             
        </>
  );
}
