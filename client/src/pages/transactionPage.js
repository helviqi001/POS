import { Helmet } from 'react-helmet-async';
import { filter, get, size } from 'lodash';
import { sentenceCase } from 'change-case';
import { useContext, useEffect, useReducer, useState } from 'react';
import Cookies from 'universal-cookie/cjs/Cookies';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MuiFileInput } from 'mui-file-input';
import MoreVertIcon from '@mui/icons-material/MoreVert';

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
import { DataGrid, GridActionsCellItem, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import DoneForm from '../sections/@dashboard/delivery/doneForm';
import { ProductListHead, ProductListToolbar } from '../sections/@dashboard/product';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
// import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
// mock
import USERLIST from '../_mock/user';
import { OutletContext } from '../layouts/dashboard/OutletProvider';
import { INITIAL_STATE,StaffReducer } from '../sections/@dashboard/delivery/StaffReducer';
import InvoicePage from './invoicePage';
// ----------------------------------------------------------------------


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

export default function TransactionPage() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const cookies = new Cookies()

  const [productList,setProduct] = useState([])

  const [loading,setLoading] = useState(true)

  const [id,setId] = useState()
  
  const {load} = useContext(OutletContext)

  const [state,dispatch] = useReducer(StaffReducer,INITIAL_STATE)

  const cookie = cookies.get("Authorization")



  const handleEditClick = (event , id)=> {
    setOpen(event.currentTarget)
    const rowId = id.split('-')[0]
    setId(rowId)
  };

  const DATAGRID_COLUMNS = [
    { field: 'idTransaction', headerName: 'ID Transaction', width:150 , headerAlign: 'center', align:'center'},
    { field: 'staffName', headerName: 'Staff Name', width: 150 , headerAlign: 'center',align:'center'},
    { field: 'customerName', headerName: 'Customer Name', width: 190 , headerAlign: 'center',align:'center'},
    { field: 'itemStatus', headerName: 'Shipping Method', width: 190 , headerAlign: 'center',align:'center'},
    { field: 'paymentStatus', headerName: 'Payment Method', width: 150 , headerAlign: 'center',align:'center'},
    { field: 'transactionDate', headerName: 'Transaction Date', width: 200 , headerAlign: 'center',align:'center'},
    { field: 'productName', headerName: 'Product', width: 200 , headerAlign: 'center',align:'center'},
    { field: 'quantity', headerName: 'quantity', width: 200 , headerAlign: 'center',align:'center'},
    { field: 'total', headerName: 'Total Payment', width:200 , headerAlign: 'center', align:'center',valueGetter:(params)=>{
      const sellingPrice = params.row.total
      return `IDR ${sellingPrice.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })}`}},
    {
      field: 'information',
      headerName: 'Information',
      width: 150,
      headerAlign: 'center',
      align:'center'
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 110,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            icon={<MoreVertIcon />}
            label="3Dots"
            className="textPrimary"
            onClick={(e)=>handleEditClick(e,id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  const getProcessedData = (data) => {
    const processedData = [];
    
    data.forEach((entry) => {
      const { staff,customer, products, ...rest } = entry;
      
      if (products && products.length > 0) {
        // Loop through each product in the current restock
        products.forEach((product) => {
          const productRow = {
            customerName:customer.name,
            staffName:staff.name,
            productId:product.id,
            productName:product.name,
            quantity:product.pivot.quantity,
            ...rest,
          };
          processedData.push(productRow);
        });
      }
    });
    
    return processedData;
  };
  useEffect(()=>{
    setLoading(true)
    const getdata=async()=>{
     await axios.get("http://localhost:8000/api/transactions?relations=staff,customer,products",{
        headers:{
          "Content-Type" : "aplication/json",
          "Authorization" : `Bearer ${cookie}`
        }
      }).then(response=>{
        const ProcessedData = getProcessedData(response.data.data)
        setProduct(ProcessedData)
      })
      setLoading(false)
    }
    getdata()
  },[])
  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleOpenModal=async()=>{
    axios.post(`http://localhost:8000/api/invoices/`,{transactionId:id},{
      headers:{
        "Content-Type" : "aplication/json",
        "Authorization" : `Bearer ${cookie}`
      }
    }).then(response=>{
      const data = response.data.data
      navigate("/invoice", { state: { paramName: data } })
    })
  }

  console.log(id);


  const handleDelete=async()=>{
    load(true)
    axios.delete(`http://localhost:8000/api/transactions/${id}`,{
      headers:{
        "Content-Type" : "aplication/json",
        "Authorization" : `Bearer ${cookie}`
      }
    }).then(response=>{
      console.log(response);
    })
    setTimeout(()=>{
      load(false)
    },1000)
  }

  const style2 = {
    marginTop: 2
  }
  const style3 = {
    overflowX:"scroll",
    marginTop:2,
  }

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };
  
  
  
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - productList.length) : 0;
  
  const filteredUsers = applySortFilter(productList, getComparator(order, orderBy), filterName);
  
  const isNotFound = !filteredUsers.length && !!filterName;
  console.log(filteredUsers);
 
  return (
    <>
      <Helmet>
        <title> History Transaction Page </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            History Transaction
          </Typography>
        </Stack>

        <Card>
          <ProductListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />

          <Scrollbar>
          {loading ? (
              <Typography textAlign={'center'} variant='subtitle2' marginBottom={5}>.....Loading</Typography>
          ):(

          filteredUsers.length === 0 ? (
              <Box sx={{ height:150 }}>
              <DataGrid
                rows={filteredUsers}
                columns={DATAGRID_COLUMNS}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 5 },
                  },
                }}
                pageSizeOptions={[5, 10]}
                onRowSelectionModelChange={(s)=>{
                  setSelected(s)
                }}
                checkboxSelection 
                disableRowSelectionOnClick
                getRowHeight={() => 'auto'}
              />
            </Box>
            ) :(
              <Box sx={{ height:"auto" }}>
              <DataGrid
                rows={filteredUsers}
                columns={DATAGRID_COLUMNS}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 5 },
                  },
                }}
                slots={{
                  toolbar: CustomToolbar,
                }}
                pageSizeOptions={[5, 10]}
                onRowSelectionModelChange={(s)=>{
                  setSelected(s)
                }}
                checkboxSelection 
                disableRowSelectionOnClick
                getRowHeight={() => 'auto'}
                getRowId={(row) => `${row.id}-${row.productId}`}
              />
              </Box>
            )
          )}
          </Scrollbar>
        </Card>
      </Container>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 140,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <MenuItem sx={{ color: 'error.main' }} onClick={handleDelete}> 
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          Delete
        </MenuItem>
        <MenuItem onClick={handleOpenModal}> 
          <ReceiptOutlinedIcon sx={{ mr: 2 }}/>
          Invoice
        </MenuItem>
      </Popover>
        </>
  );
}


function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport printOptions={{ disableToolbarButton: true }} />
    </GridToolbarContainer>
  );
}