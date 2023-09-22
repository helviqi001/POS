import { Helmet } from 'react-helmet-async';
import { filter, get, size } from 'lodash';
import { sentenceCase } from 'change-case';
import { forwardRef, useContext, useEffect, useState } from 'react';
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
  Snackbar,
} from '@mui/material';
// components
import MuiAlert from '@mui/material/Alert';
import { DataGrid, GridActionsCellItem, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import CreateStaff from '../sections/@dashboard/fleet/createform';
import EditForm from '../sections/@dashboard/fleet/editForm';
import { ProductListHead, ProductListToolbar } from '../sections/@dashboard/product';
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
// import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
// mock
import USERLIST from '../_mock/user';
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

export default function FleetPage() {
  const [open, setOpen] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [create,setCreate] = useState(false)

  const cookies = new Cookies()

  const [productList,setProduct] = useState([])

  const [edit,setEdit] = useState(false)

  const [loading,setLoading] = useState(true)

  const [id,setId] = useState()
  
  const {load} = useContext(OutletContext)

  const handleEditClick = (event , id)=> {
    setOpen(event.currentTarget)
    setId(id)
  };

  const DATAGRID_COLUMNS = [
    { field: 'id', headerName: 'ID', width:55 , headerAlign: 'center', align:'center'},
    { field: 'idFleet', headerName: 'Kode Fleet', width:205 , headerAlign: 'center', align:'center'},
    { field: 'name', headerName: 'Staff Name', width:205 , headerAlign: 'center', align:'center'},
    { field: 'plateNumber', headerName: 'Plate Number', width: 205 , headerAlign: 'center',align:'center'},
    {
      field: 'informations',
      headerName: 'Information',
      width: 205,
      headerAlign: 'center',
      align:'center'
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 205,
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

  useEffect(()=>{
    setLoading(true)
    const cookie = cookies.get("Authorization")
    const getdata=async()=>{
     await axios.get("http://localhost:8000/api/fleets?relations=staff,delivery",{
        headers:{
          "Content-Type" : "aplication/json",
          "Authorization" : `Bearer ${cookie}`
        }
      }).then(response=>{
        setProduct(response.data.data.map(p=>({
          ...p,
          name : p.staff.name
        })))
      })
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
    load(true)
    const cookie = cookies.get("Authorization")
    axios.delete(`http://localhost:8000/api/fleets/${id}`,{
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
  
  return (
    <>
      <Helmet>
        <title> Fleet Page </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Fleet List
          </Typography>
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleOpenModal}>
            New Fleet
          </Button>
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
                slots={{
                  toolbar: CustomToolbar,
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
        <MenuItem onClick={handleOpenModalEdit}>
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }}/>
          Edit
        </MenuItem>

        <MenuItem sx={{ color: 'error.main' }} onClick={handleDelete}> 
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          Delete
        </MenuItem>
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
        </>
  );
}


function CustomToolbar() {
  const Alert = forwardRef((props, ref) =>{
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });
  const [open,setOpen] = useState(false)
  const [file,setFile] = useState([])
  const cookies = new Cookies()
  const cookie = cookies.get("Authorization")
  const {load} = useContext(OutletContext)
  const [state2, setState] = useState({
    open: false,
    vertical: 'top',
    horizontal: 'center',
    message:"",
    variant:""
  });
  const { vertical, horizontal, openSnack } = state2;

  const handleClick = (message,variant) => {
    setState({ ...state2, openSnack: true , message,variant });
  };

  const handleClosesnack = () => {
    setState({ ...state2, openSnack: false });
  };
  const handleImport = (files) => {
    setFile(files)
    const formData = new FormData();
    formData.append('excel_file', files);
  
    // Kirim file ke server menggunakan Axios atau library lainnya
    axios.post('http://localhost:8000/api/import/fleets', formData,{
      headers:{
        'Authorization':`Bearer ${cookie}`
      }
    })
      .then((response) => {
        handleClick(response.data.message,'success')
        setTimeout(()=>{
          load(true)
          setTimeout(()=>{
            load(false)
            handleCLose()
          },1000)
        },1500)
      })
      .catch((error) => {
        if (error.response.status === 500 ) {
          if(error.response.data.message){
            handleClick(error.response.data.message,'error')
          }
          else if(error.response.data.error.errorInfo){
            handleClick(error.response.data.error.errorInfo[2],'error')
          }
        }
        console.log(error);
      });
  };
  const handleOpenModal=()=>{
    setOpen(true)
  }
  const handleCLose=()=>{
    setOpen(false)
  }
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
  };
  return (
    <>
    <GridToolbarContainer>
      <GridToolbarExport printOptions={{ disableToolbarButton: true }} />
      <Button onClick={handleOpenModal}>Import</Button>
    </GridToolbarContainer>
    {open && (
      <>
      <Dialog
      open={open}
      onClose={handleCLose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <DialogContent>
      <MuiFileInput
        accept=".xlsx, .csv" // Sesuaikan dengan tipe file yang diizinkan
        label="Import Data" // Label tombol
        onChange={handleImport}
        value={file} // Fungsi yang akan dipanggil saat file dipilih
      />
    <Snackbar open={openSnack} autoHideDuration={1500} onClose={handleClosesnack} anchorOrigin={{ vertical , horizontal }}>
        <Alert onClose={handleClosesnack} severity={state2.variant} sx={{ width: '100%' }}>
        {state2.message}
        </Alert>
      </Snackbar>
      </DialogContent>
    </Dialog>
      </>
    )}
    </>
    
  );

}