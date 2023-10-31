import { Helmet } from 'react-helmet-async';
import { filter, get, size } from 'lodash';
import { sentenceCase } from 'change-case';
import { forwardRef, useContext, useEffect, useReducer, useState } from 'react';
import Cookies from 'universal-cookie/cjs/Cookies';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { MuiFileInput } from 'mui-file-input';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// @mui
import {
  Card,
  Stack,
  Button,
  Popover,
  MenuItem,
  Container,
  Typography,
  Box,
  Snackbar,
} from '@mui/material';
// components
import MuiAlert from '@mui/material/Alert';
import { DataGrid, GridActionsCellItem, GridFilterPanel, GridToolbarContainer, GridToolbarExport, GridToolbarFilterButton } from '@mui/x-data-grid';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import { ProductListHead, ProductListToolbar } from '../sections/@dashboard/product';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
import { OutletContext } from '../layouts/dashboard/OutletProvider';
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

const Alert = forwardRef((props, ref) =>(
  <MuiAlert elevation={6} ref={ref} variant="standard" {...props} />
));
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

export default function TransactionPage() {
  const {menu,item} = useParams()

  const setting = JSON.parse(localStorage.getItem('setting'))

  const Privilages = JSON.parse(localStorage.getItem('privilage'))

  const navigate = useNavigate()

  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const cookies = new Cookies()

  const [productList,setProduct] = useState([])

  const [loading,setLoading] = useState(true)

  const [id,setId] = useState()
  
  const {load} = useContext(OutletContext)

  const cookie = cookies.get("Authorization")

  const [priv,setPriv] = useState({
    add:0,
    edit:0,
    delete:0,
    export:0,
    import:0,
  })

  const [state2, setState] = useState({
    openSnack: false,
    vertical: 'top',
    horizontal: 'center',
    message:"Are you sure want to delete this data ? it will delete everything related with this",
  });
  const { vertical, horizontal, openSnack } = state2;

  const handleClick = () => {
    setState({ ...state2, openSnack: true });
    setOpen(null);
  };

  const handleClose = () => {
    setState({ ...state2, openSnack: false });
  };


  const handleEditClick = (event , id)=> {
    setOpen(event.currentTarget)
    const rowId = id.split('-')[0]
    setId([rowId])
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

  const Privilage = ()=>{
    let menuItem = []
    const menuGroup = Privilages.filter((m)=>m.id === Number(menu))
    menuGroup.forEach(e => {
       menuItem = e.menuitem.filter((i)=>i.id === Number(item))
   });
     menuItem.forEach(e=>{
       const privilege = e.privilege
       setPriv({ ...priv, export:privilege.export, add:privilege.add, edit:privilege.edit, delete:privilege.delete, import:privilege.import })
     })
   }

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
     await axios.get(`${apiEndpoint}api/transactions?relations=staff,customer,products`,{
        headers:{
          "Content-Type" : "aplication/json",
          "Authorization" : `Bearer ${cookie}`
        }
      }).then(response=>{
        const ProcessedData = getProcessedData(response.data.data)
        setProduct(ProcessedData)
      })
      Privilage()
      setLoading(false)
    }
    getdata()
  },[])
  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleOpenModal=async()=>{
    axios.post(`${apiEndpoint}api/invoices/`,{transactionId:id[0]},{
      headers:{
        "Content-Type" : "aplication/json",
        "Authorization" : `Bearer ${cookie}`
      }
    }).then(response=>{
      const data = response.data.data
      navigate("/invoice", { state: { paramName: data } })
    })
  }

  const handleDelete=async()=>{
    const updatedData = productList.filter(item => !id.includes(item.id));
    setProduct(updatedData);
    axios.post(`${apiEndpoint}api/delete/transactions/`,{id},{
      headers:{
        "Content-Type" : "aplication/json",
        "Authorization" : `Bearer ${cookie}`
      }
    }).then(response=>{
      console.log(response);
    })
  }

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };
  
  const filteredUsers = applySortFilter(productList, getComparator(order, orderBy), filterName);
 
  return (
    <>
      <Helmet
                title="History Transaction Page"
                link={[
                    {"rel": "icon", 
                    "type": "image/png", 
                    "sizes": '32x32',
                    "href": `${apiEndpoint}storage/${setting[1].urlIcon}`
                    }
                    ]}
            />
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            History Transaction
          </Typography>
        </Stack>

        <Card>
        <ProductListToolbar selected={selected} setId={setId} filterName={filterName} onFilterName={handleFilterByName} handleClick={handleClick} />
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
        {priv.delete === 1 && (
        <MenuItem sx={{ color: 'error.main' }} onClick={handleClick}> 
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          Delete
        </MenuItem>
        )}
        <MenuItem onClick={handleOpenModal}> 
          <ReceiptOutlinedIcon sx={{ mr: 2 }}/>
          Invoice
        </MenuItem>
      </Popover>

      <Snackbar open={openSnack} onClose={handleClose} anchorOrigin={{ vertical , horizontal }} >
        <Alert severity={'warning'} sx={{ width: '100%' }}>
        <Box display={'flex'} flexDirection={'column'}>
          {state2.message}
          <Button style={{ width:'10%',marginTop:15,alignSelf:'end' }} onClick={()=>handleDelete(id)}>
            Yes
          </Button>
        </Box>
        </Alert>
      </Snackbar>
        </>
  );
}


function CustomToolbar() {
  const {menu,item} = useParams()
  const Privilages = JSON.parse(localStorage.getItem('privilage'))
  const [priv,setPriv] = useState({
    export:0,
    import:0,
  })
  const Privilage = ()=>{
    let menuItem = []
    const menuGroup = Privilages.filter((m)=>m.id === Number(menu))
    menuGroup.forEach(e => {
       menuItem = e.menuitem.filter((i)=>i.id === Number(item))
   });
     menuItem.forEach(e=>{
       const privilege = e.privilege
       setPriv({ ...priv, export:privilege.export,import:privilege.import })
     })
   } 
   useEffect(()=>{
    Privilage()
  },[])
  return (
    <GridToolbarContainer>
       {priv.export === 1 && (
        <GridToolbarExport printOptions={{ disableToolbarButton: true }} />
      )}
    </GridToolbarContainer>
  );
}