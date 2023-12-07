import { filter} from 'lodash';
import { useContext, useEffect, useReducer, useState } from 'react';
import Cookies from 'universal-cookie/cjs/Cookies';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
// @mui
import {
  Card,
  Table,
  Paper,
  Button,
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
  Box,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Select,
  FormHelperText,
} from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
// components

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { ProductListHead } from '../product';
import Scrollbar from '../../../components/scrollbar';
// sections
// import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
// mock
import { OutletContext } from '../../../layouts/dashboard/OutletProvider';
import { RestockRecuder, SUPPLIER_STATE } from './RestockReducer';
import RestockListHead from './restockListHead';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'unit_name', label: 'Unit name', alignRight: false },
  { id: 'category', label: 'Category', alignRight: false },
  { id: 'image', label: 'Image', alignRight: false },
  { id: 'stock', label: 'Stock', alignRight: false },
  { id: 'coli', label: 'coli', alignRight: false },
  { id: 'tax', label: 'Tax ', alignRight: false },
  { id: 'selling_price', label: 'Selling price (IDR)', alignRight: false },
  { id: 'discount', label: 'Discount (IDR)', alignRight: false },
  { id: 'net_price', label: 'Net_price (IDR)', alignRight: false },
  { id: 'information', label: 'Information', alignRight: false },
  { id: '' },
];
const TABLE_HEAD2 = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'quantity', label: 'quantity', alignRight: false },
  { id: 'coli', label: 'coli', alignRight: false },
  { id: 'netPrice', label: 'netPrice(IDR)', alignRight: false },
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
const baseUrl = process.env.PUBLIC_URL


export default function CreateRestock() {
  const {menu,item} = useParams()

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [totalSpend, setTotalState] = useState(0);

  const cookies = new Cookies()

  const [productList,setProduct] = useState([])

  const [supplierList,setSupplier] = useState([])

  const [id,setId] = useState([])

  const [state,dispatch] = useReducer(RestockRecuder,SUPPLIER_STATE)

  const {load} = useContext(OutletContext) 

  const navigate = useNavigate()

  const cookie = cookies.get("Authorization")

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
      axios.get(`${apiEndpoint}api/suppliers`,{
        headers:{
          "Content-Type" : "aplication/json",
          "Authorization" : `Bearer ${cookie}`
        }
      }).then(response=>{
        setSupplier(response.data)
      })
    }
    getdata()
  },[cookie])
  const handleDate=(data)=>{
    const date = new Date(data.$y, data.$M , data.$D,data.$H,data.$m,)

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day} ${hour}:${minute}`;
    dispatch({type:"DATE_INPUT",payload:formattedDate})
  }

  const handleOpenMenu = (data) => {
    const productCopy = [...productList];
    const productIndex = productCopy.findIndex(item => item.id === data.id);
    if (productIndex !== -1) {
      productCopy[productIndex] = { ...data, added: true };
      setProduct(productCopy);
    }
    const Productadded =  [...id , {...data,quantity:0,colii:0}]
    setId(Productadded)
  };


  const handleRemove= (data)=>{
  const updatedProductList = productList.map(item =>
    item.id === data.id ? { ...item, added: false } : item
  );
  setProduct(updatedProductList);

  const updatedIdArray = id.filter(item => item.id !== data.id);
  setId(updatedIdArray);
  }
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  const handleChange = (e) => {
    const productId = e.target.name.split('-')[1];
    const updatedId = id.map(item => {
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
        if (e.target.name.split('-')[0] === 'colii') {
          const colii = Number(e.target.value);
          // Perform coli validation here
          const coliError = validateColi(colii);
          setValidationErrors((prevState) => ({
            ...prevState,
            [`colii-${productId}`]: coliError,
          }));
          return { ...item, colii };
        }
      }
      return item;
    });
  
    setId(updatedId);
  };


  // Calculate total cost based on id, quantity, and costOfGoodsSold
  const calculateTotalCost = () => {
    return id.reduce((total, item) => {
      return total + item.quantity * item.netPrice;
    }, 0);
  };
  
  // Reset totalState when coli changes
  useEffect(() => {
    setTotalState(calculateTotalCost());
  }, [id, totalSpend]);


  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = productList.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    overflowY:"scroll"
  };
  
  const style2 = {
    marginTop: 2
  }
  const style3 = {
    overflowX:"scroll",
    marginTop:2,
  }

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };
  
  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };
  
  const handleSupplier = async (e)=>{
    const supplierId = e.target.value
    dispatch(
      {type:"CHANGE_INPUT" , payload:{name:e.target.name ,value:e.target.value}}
      );
     await axios.get(`${apiEndpoint}api/suppliers/${supplierId}?relations=product,product.category,product.unit`,{
        headers:{
          "Content-Type":"aplication/json",
          Authorization: `Bearer ${cookie}`
        }
      }).then(response=>{
        setProduct(response.data.product)
      })
  }

  const handleCreate=async()=>{
    const validationErrors = {};
    id.forEach((item) => {
      const { id, quantity, colii } = item;
      if (quantity === 0) {
        validationErrors[`quantity-${id}`] = 'Quantity cannot be 0 ';
      }
      if (colii === 0  ) {
        validationErrors[`colii-${id}`] = 'Coli cannot be 0';
      }
    });
    if(state.restockDate === ""){
      validationErrors.restockDate = 'restockDate Should be filled';
    }
    setValidationErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      load(true)
      await axios.post(`${apiEndpoint}api/restocks`,{id,supplier_id:state.id , restockDate:state.restockDate , totalSpend , product_id:id.map(p=>({id:p.id,quantity:p.quantity,coli:p.colii}))},{
        headers : {
          "Content-Type" : 'application/json',
          Authorization: `Bearer ${cookie}`
        }
      }).then(response=>{
        console.log(response);
      })
      await load(false)
      navigate(`${baseUrl}/dashboard/restock/${menu}/${item}`)
    }
  }
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - productList.length) : 0;
  
  const filteredUsers = applySortFilter(productList, getComparator(order, orderBy), filterName);
  
  const isNotFound = !filteredUsers.length && !!filterName;

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
      <FormControl fullWidth sx={{ style2 , marginBottom:5}}>
        <InputLabel id="demo-simple-select-label">Choose a Supplier</InputLabel>
          <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          label="Choose a Supplier"
          name='id'
          value={state.id}
          onChange={handleSupplier}
          >
            {supplierList && supplierList.map(s=>(
              <MenuItem value={s.id}>{s.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Card>
          {/* <ProductListToolbar selected={selected} filterName={filterName} onFilterName={handleFilterByName} /> */}

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <ProductListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={productList.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                  
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, name,unit,supplier,category,urlImage,stock,coli,tax,sellingPrice,discount,netPrice,information,added} = row;
                    const selectedUser = selected.indexOf(name) !== -1;

                    return (
                      <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, name)} />
                        </TableCell>

                        <TableCell component="th" scope="row" padding="none" align='center'>
                            <Typography variant="subtitle2" noWrap>
                              {name}
                            </Typography>
                        </TableCell>

                        <TableCell align="center">{unit.shortname}</TableCell>

                        <TableCell align="center">{category.itemType}</TableCell>

                        <TableCell align="center">
                          <img src={`${apiEndpoint}storage/${urlImage}`} alt=''/>
                        </TableCell>


                        <TableCell align="center">{stock}</TableCell>

                        <TableCell align="center">{coli}</TableCell>

                        <TableCell align="center">{tax}</TableCell>

                        <TableCell align="center">{sellingPrice}</TableCell>

                        <TableCell align="center">{discount}</TableCell>

                        <TableCell align="center">{netPrice}</TableCell>

                        <TableCell align="center">{information}</TableCell>

                        <TableCell align="right">
                         {added ? (
                           <IconButton size="large" color="inherit" onClick={(e)=>handleRemove(row)}>
                           <RemoveIcon/>
                         </IconButton>
                         ) : (
                          <IconButton size="large" color="inherit" onClick={(e)=>handleOpenMenu(row)}>
                            <AddIcon/>
                          </IconButton>
                         )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6}/>
                    </TableRow>
                  )}
                </TableBody>

                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            Not found
                          </Typography>

                          <Typography variant="body2">
                            No results found for &nbsp;
                            <strong>&quot;{filterName}&quot;</strong>.
                            <br /> Try checking for typos or using complete words.
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={productList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>

        <Card sx={{ marginTop:10 , display:'flex'}}>
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
                  {id.map((row) => {
                    const { id, name,netPrice} = row;

                    return (
                      <TableRow hover key={id} tabIndex={-1} role="checkbox">
                        <TableCell component="th" scope="row" padding="none" align='center'>
                            <Typography variant="subtitle2" noWrap>
                              {name}
                            </Typography>
                        </TableCell>

                       <TableCell align="center">
                       <FormControl>
                          <OutlinedInput
                            id="outlined-adornment-amount"
                            startAdornment={<InputAdornment position="start">Pcs</InputAdornment>}
                            name={`quantity-${id}`}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            error={!!validationErrors[`quantity-${id}`]}
                          />
                          <FormHelperText sx={{ color:"#f44336" }}>{validationErrors[`quantity-${id}`]}</FormHelperText>
                        </FormControl>
                       </TableCell>

                       <TableCell align="center">
                       <FormControl>
                          <OutlinedInput
                            id="outlined-adornment-amount"
                            startAdornment={<InputAdornment position="start">Coli</InputAdornment>}
                            name={`colii-${id}`}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            error={!!validationErrors[`colii-${id}`]}
                          />
                          <FormHelperText sx={{ color:"#f44336" }}>{validationErrors[`colii-${id}`]}</FormHelperText>
                        </FormControl>
                       </TableCell>

                        <TableCell align="center">{netPrice}</TableCell>

                      </TableRow>
                    );
                  })}
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
                          <DateTimePicker label="Restock Date" onChange={(data)=>handleDate(data)} value={state.restockDate} slotProps={{ textField: { helperText:validationErrors.restockDate , error:!!validationErrors.restockDate} }}/>
                      </DemoContainer>
                    </LocalizationProvider>

              <Typography variant='subtitle2' sx={{ marginBottom:2,marginTop:2 }}>TOTAL SPEND IDR {formattedTotalSpend}</Typography>

              <Button  variant="contained" onClick={handleCreate}  sx={{marginBottom:2}}>Create</Button>
              </div>
            </>
          </Box>
        </Card>
      </Container>
             
        </>
  );
}
