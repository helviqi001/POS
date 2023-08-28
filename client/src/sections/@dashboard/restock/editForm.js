
import { useContext, useEffect, useReducer, useState } from 'react';
import Cookies from 'universal-cookie/cjs/Cookies';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Avatar,
  Button,
  Popover,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  Modal,
  Box,
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
// components
import dayjs from 'dayjs';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
// sections
// import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
// mock
import { OutletContext } from '../../../layouts/dashboard/OutletProvider';
import { RestockRecuder, SUPPLIER_STATE } from './RestockReducer';
import RestockListHead from './restockListHead';
// ----------------------------------------------------------------------

const TABLE_HEAD2 = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'quantity', label: 'quantity', alignRight: false },
  { id: 'coli', label: 'coli', alignRight: false },
  { id: 'cost_of_goods_sold', label: 'Cost of goods sold (IDR)', alignRight: false },
];

// ----------------------------------------------------------------------


export default function EditRestock() {
  const location = useLocation();
  
  const id = location.state?.id

  const [totalSpend, setTotalState] = useState(0);

  const [create,setCreate] = useState(false)

  const cookies = new Cookies()

  const [productList,setProduct] = useState([])

  const [newProduct,setNew] = useState([])

  const [state,dispatch] = useReducer(RestockRecuder,SUPPLIER_STATE)

  const cookie = cookies.get("Authorization")

  const {load} = useContext(OutletContext)

  const navigate = useNavigate()

  useEffect(()=>{
    const getdata=async()=>{
      await axios.get(`http://localhost:8000/api/restocks/${id}?relations=products`,{
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
          return { ...item, quantity: Number(e.target.value) }; // Update quantity
        } 
        if (e.target.name.split('-')[0] === 'coli') {
          return { ...item, coli: Number(e.target.value) }; // Update coli
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
    load(true)
    await axios.post("http://localhost:8000/api/update/restocks",{id,supplier_id:state.supplier_id , restockDate:state.restockDate , totalSpend , product_id:newProduct.map(p=>({id:p.id,quantity:p.quantity,coli:p.coli}))},{
      headers : {
        "Content-Type" : 'application/json',
        Authorization: `Bearer ${cookie}`
      }
    }).then(response=>{
      console.log(response);
    })
    await load(false)
    navigate("/dashboard/restock")
  }
  console.log(newProduct);
  console.log(state);
  const formattedTotalSpend = totalSpend.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
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
                        />
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
                        />
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
                    <DatePicker  label="Restock Date" onChange={handleDate} sx={{marginTop:5}} defaultValue={dayjs(row.restockDate)}/>
                </DemoContainer>
              </LocalizationProvider>
              <h4>TOTAL SPEND IDR {formattedTotalSpend}</h4>

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
