import { Helmet } from 'react-helmet-async';
import { filter, get, size } from 'lodash';
import { forwardRef, useContext, useEffect, useState } from 'react';
import Cookies from 'universal-cookie/cjs/Cookies';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
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
import { DataGrid, GridActionsCellItem, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import CheckIcon from '@mui/icons-material/Check';
import EditForm from '../sections/@dashboard/delivery/editForm';
import DoneForm from '../sections/@dashboard/delivery/doneForm';
import { ProductListToolbar } from '../sections/@dashboard/product';
import { OutletContext } from '../layouts/dashboard/OutletProvider';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
import TruncatedInformation from './TruncatedInformation';
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
export default function DeliveryPage() {
  const {menu,item} = useParams()

  const setting = JSON.parse(localStorage.getItem('setting'))

  const Privilages = JSON.parse(localStorage.getItem('privilage'))

  const [open, setOpen] = useState(null);

  const [openModal, setOpenModal] = useState(false);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('');

  const [filterName, setFilterName] = useState('');

  const cookies = new Cookies()

  const [productList,setProduct] = useState([])

  const [edit,setEdit] = useState(false)

  const [done,setDone] = useState(false)

  const [loading,setLoading] = useState(true)

  const {load} = useContext(OutletContext)

  const [id,setId] = useState()

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
    setId([id])
  };

  const DATAGRID_COLUMNS = [
    { field: 'No', headerName: 'No', width: 80, headerAlign: 'center', align: 'center'},
    { field: 'idDelivery', headerName: 'Kode Delivery', width:150 , headerAlign: 'center', align:'center'},
    { field: 'driverName', headerName: 'Driver Name', width: 150 , headerAlign: 'center',align:'center'},
    { field: 'plateNumber', headerName: 'Plate Number', width: 150 , headerAlign: 'center',align:'center'},
    { field: 'customerName', headerName: 'Customer Name', width: 190 , headerAlign: 'center',align:'center'},
    { field: 'address', headerName: 'Customer address', width: 190 , headerAlign: 'center',align:'center'},
    { field: 'noTelp', headerName: 'Customer Phone', width: 150 , headerAlign: 'center',align:'center'},
    { field: 'deliveryDate', headerName: 'Delivery Date', width: 200 , headerAlign: 'center',align:'center'},
    { field: 'status', headerName: 'Status', width:200 , headerAlign: 'center', align:'center'},
    { field: 'information', headerName: 'Information', width: 150, headerAlign: 'center', align: 'center', renderCell: (params) => <TruncatedInformation text={params.value} /> },
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


  useEffect(()=>{
    setLoading(true)
    const getdata=async()=>{
     await axios.get(`${apiEndpoint}api/deliveries?relations=fleet,fleet.staff,transaction,transaction.customer`,{
        headers:{
          "Content-Type" : "aplication/json",
          "Authorization" : `Bearer ${cookie}`
        }
      }).then(response=>{
        setProduct(response.data.data.map((p,i)=>({
          ...p,
          plateNumber:p.fleet.plateNumber,
          driverName:p.fleet.staff.name,
          customerName:p.transaction.customer.name,
          address:p.transaction.customer.address,
          noTelp:p.transaction.customer.phone,
          No: i +1
        })))
      })
      Privilage()
      setLoading(false)
    }
    getdata()
  },[])
  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleOpenModal=()=>{
    setEdit(null)
    setDone(true)
    setOpenModal(true)
  }
  const handleOpenModalEdit=()=>{
    setEdit(true)
    setDone(null)
    setOpenModal(true)
    setOpen(null);
  }

  const handleCloseModal=()=>{
    setOpenModal(false)
    setDone(false)
    setEdit(null)
  }


  const handleDelete=async()=>{
   load(true)
    axios.post(`${apiEndpoint}api/delete/deliveries`,{id},{
      headers:{
        "Content-Type" : "aplication/json",
        "Authorization" : `Bearer ${cookie}`
      }
    }).then(()=>{
      handleClose()
      load(false)
    })
  }

  const style2 = {
    marginTop: 2
  }

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };
  const filteredUsers = applySortFilter(productList, getComparator(order, orderBy), filterName);
  return (
    <>
      <Helmet
        title="Delivery Page"
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
            Delivery List
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
       {priv.edit === 1 && (
        <MenuItem onClick={handleOpenModalEdit}>
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }}/>
          Edit
        </MenuItem>
        )}
        {priv.delete === 1 && (
        <MenuItem sx={{ color: 'error.main' }} onClick={handleClick}> 
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          Delete
        </MenuItem>
        )}
        
        {productList.map(p=>(
          p.status === 'On Process Delivery'  && (
            <MenuItem sx={{ color: 'success.main' }} onClick={handleOpenModal}> 
              <CheckIcon sx={{ mr: 2 }} />
                Done
            </MenuItem>
          )
        ))}
      </Popover>
              {openModal && (
                  <>
                      {edit && (
                          <EditForm id={id} style2={style2} openModal={openModal} handleCloseModal={handleCloseModal} productList={productList} />
                      )}
                      {done && (
                        <>
                           <DoneForm id={id} style2={style2} openModal={openModal} handleCloseModal={handleCloseModal} productList={productList}/>                      
                        </>
                      )}
                  </>
              )}
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