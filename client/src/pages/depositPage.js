import { Helmet } from 'react-helmet-async';
import { filter, get, size } from 'lodash';
import { forwardRef, useContext, useEffect, useState } from 'react';
import Cookies from 'universal-cookie/cjs/Cookies';
import axios from 'axios';
import { useParams } from 'react-router-dom';
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
import CreateStaff from '../sections/@dashboard/deposit/createform';
import EditForm from '../sections/@dashboard/deposit/editForm';
import {ProductListToolbar } from '../sections/@dashboard/product';
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
export default function DepositPage() {
  const {menu,item} = useParams()

  const setting = JSON.parse(localStorage.getItem('setting'))

  const Privilages = JSON.parse(localStorage.getItem('privilage'))

  const [open, setOpen] = useState(null);
  
  const [status, setStatus] = useState('');

  const [openModal, setOpenModal] = useState(false);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [create,setCreate] = useState(false)

  const cookies = new Cookies()

  const [productList,setProduct] = useState([])

  const [edit,setEdit] = useState(false)

  const [id,setId] = useState()

  const {load} = useContext(OutletContext)
  
  const [loading,setLoading] = useState(true);

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
    message:"",
    status:""
  });
  const { vertical, horizontal, openSnack } = state2;

  const handleClick = (status,message) => {
    setState({ ...state2, openSnack: true ,status,message});
    setOpen(null);
  };

  const handleClose = () => {
    setState({ ...state2, openSnack: false });
  };


  const handleEditClick = (event , id,status)=> {
    setOpen(event.currentTarget)
    setId([id])
    setStatus(status)
  };


  const DATAGRID_COLUMNS = [
    { field: 'idDeposit', headerName: 'ID Deposit', width:150 , headerAlign: 'center', align:'center'},
    {
      field: 'depositDate',
      headerName: 'Deposit Date',
      width: 150,
      headerAlign: 'center',
      align:'center'
    },
    { field: 'customerName', headerName: 'Customer Name', width:150 , headerAlign: 'center', align:'center'},
    { field: 'ammount', headerName: 'Ammount', width: 125 , headerAlign: 'center',align:'center',valueGetter:(params)=>{
      const sellingPrice = params.row.ammount
      return `IDR ${sellingPrice.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })}`}},
    { field: 'total', headerName: 'Total', width: 125 , headerAlign: 'center',align:'center',valueGetter:(params)=>{
      const sellingPrice = params.row.total
      return `IDR ${sellingPrice.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })}`}},
    { field: 'status', headerName: 'Status', width: 100 , headerAlign: 'center',align:'center'},
    { field: 'information', headerName: 'Information',width:150,headerAlign: 'center',align:'center'},
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: (params) => {
        const { id, status } = params.row;
  
        return [
          <GridActionsCellItem
            icon={<MoreVertIcon />}
            label="3Dots"
            className="textPrimary"
            onClick={(e) => handleEditClick(e, id, status)}
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
    const cookie = cookies.get("Authorization")
    setLoading(true)
    const getdata=async()=>{
      await axios.get(`${apiEndpoint}api/deposits?relations=customer`,{
        headers:{
          "Content-Type" : "aplication/json",
          "Authorization" : `Bearer ${cookie}`
        }
      }).then(response=>{
        setProduct(response.data.data.map(p=>({
          ...p,
          customerName : p.customer.name
        })))
      })
      Privilage()
      setLoading(false)
    }
    getdata()
  },[])
  
  console.log(productList);

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleOpenModal=()=>{
    setCreate(true)
    setEdit(null)
    setOpenModal(true)
  }
  const handleOpenModalEdit=()=>{
    setEdit(true)
    setCreate(null)
    setOpenModal(true)
    setOpen(null);
  }

  const handleCloseModal=()=>{
    setOpenModal(false)
    setCreate(false)
    setEdit(null)
  }


  const handleDelete=async()=>{
    const updatedData = productList.filter(item => !id.includes(item.id));
    setProduct(updatedData);
    const cookie = cookies.get("Authorization")
    try{
      await axios.post(`${apiEndpoint}api/delete/deposits`,{id},{
        headers:{
          "Content-Type" : "aplication/json",
          "Authorization" : `Bearer ${cookie}`
        }
      }).then(response=>{
        handleClose()
      })

    }catch(error){
      if (error.response.status === 500) {
        load(false)
        handleClick('b',error.response.data.message)
      }
    }
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
  
  const filteredUsers = applySortFilter(productList, getComparator(order, orderBy), filterName);
  
  return (
    <>
      <Helmet
        title="Deposit Page"
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
            Deposit List
          </Typography>
          {priv.add === 1 && (
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleOpenModal}>
            New Deposit
          </Button>
          )}
        </Stack>

        <Card>
        <ProductListToolbar selected={selected} setId={setId} filterName={filterName} onFilterName={handleFilterByName} handleClick={handleClick} />
          {loading ? (
            <Typography textAlign={'center'} variant='subtitle2' marginBottom={5}>.....Loading</Typography>
          ) : 
          (

          <Scrollbar>
          {filteredUsers.length === 0 ? (
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
            )}
          </Scrollbar>
          )}
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

        {status === 'Deposit' ?(
          <>
         {priv.edit === 1 && (
        <MenuItem onClick={handleOpenModalEdit}>
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }}/>
          Edit
        </MenuItem>
        )}
        {priv.delete === 1 && (
            <MenuItem sx={{ color: 'error.main' }} onClick={()=>handleClick("a","Are you sure want to delete this data ? it will delete everything related with this")}> 
              <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
              Delete
            </MenuItem>
          )}
          </>
        ) : (
            <Typography>No Action</Typography>
        )}
      </Popover>
              {openModal && (
                  <>
                      {create && (
                          <CreateStaff style2={style2} openModal={openModal} handleCloseModal={handleCloseModal} productList={productList} />
                      )}
                      {edit && (
                          <EditForm id={id} style2={style2} openModal={openModal} handleCloseModal={handleCloseModal} productList={productList} />
                      )}
                  </>
              )}
      <Snackbar open={openSnack} onClose={handleClose} anchorOrigin={{ vertical , horizontal }} >
        <Alert severity={'warning'} sx={{ width: '100%' }}>
        <Box display={'flex'} flexDirection={'column'}>
          {state2.message}
          <Button style={{ width:'10%',marginTop:15,alignSelf:'end' }} onClick={state2.status === 'a' ? ()=>handleDelete(id) : ()=>handleClose()}>
            Ok
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