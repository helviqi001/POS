import { Helmet } from 'react-helmet-async';
import { filter, size } from 'lodash';
import { sentenceCase } from 'change-case';
import { forwardRef, useContext, useEffect, useReducer, useState } from 'react';
import Cookies from 'universal-cookie/cjs/Cookies';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { MuiFileInput } from 'mui-file-input';
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
  FormHelperText,
  Snackbar,
} from '@mui/material';
// components
import MuiAlert from '@mui/material/Alert';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import Scrollbar from '../../../components/scrollbar';
import { OutletContext } from '../../../layouts/dashboard/OutletProvider';
import { INITIAL_STATE, PositionReducer } from './PositionReducer';

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
const Alert = forwardRef((props, ref) =>{
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });
export default function EditPosition() {

  const location = useLocation()

  const [state,dispatch] = useReducer(PositionReducer,INITIAL_STATE)

  const [order, setOrder] = useState('asc');

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const cookies = new Cookies()

  const [productList,setProduct] = useState([])

  const {load} = useContext(OutletContext) 

  const navigate = useNavigate()

  const cookie = cookies.get("Authorization")

  const [loading,setLoading] = useState(true)

  const paramName = location.state.paramName

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
  const handleChange = e =>{
      dispatch(
        {type:"CHANGE_INPUT" , payload:{name:e.target.name , value:e.target.value}},
      )
  }

  const DATAGRID_COLUMNS = [
    { field: `id`, headerName: 'id', width: 350 , headerAlign: 'center', align:'center'},
    { field: `menuGroup`, headerName: 'Menu', width: 350 , headerAlign: 'center', align:'center',
    renderCell: (params) => (
       <Typography>{`${params.row.menuGroup}/${params.row.name}`}</Typography>
      ),},
    { field: 'view', headerName: 'View', width:90 , headerAlign: 'center', align:'center', 
    renderCell: (params) => (
      <>
      <Checkbox
        defaultChecked={params.value}
        onChange={() => handleCheckboxChange(params.row.id, 'view')}
      />
      </>
      ),},
    { field: 'add', headerName: 'Add', width:90 , headerAlign: 'center', align:'center', 
    renderCell: (params) => (
        <Checkbox
        defaultChecked={params.value}
          onChange={() => handleCheckboxChange(params.row.id, 'add')}
        />
      ),},
    { field: 'edit', headerName: 'Edit', width:90 , headerAlign: 'center', align:'center', 
    renderCell: (params) => (
        <Checkbox
        defaultChecked={params.value}
          onChange={() => handleCheckboxChange(params.row.id, 'edit')}
        />
      ),},
    { field: 'delete', headerName: 'Delete', width:90 , headerAlign: 'center', align:'center',
    renderCell: (params) => (
        <Checkbox
        defaultChecked={params.value}
          onChange={() => handleCheckboxChange(params.row.id, 'delete')}
        />
      ),},
    { field: 'export', headerName: 'Export', width:90 , headerAlign: 'center', align:'center',
    renderCell: (params) => (
        <Checkbox
        defaultChecked={params.value}
          onChange={() => handleCheckboxChange(params.row.id, 'export')}
        />
      ),},
    { field: 'import', headerName: 'Import', width:90 , headerAlign: 'center', align:'center', 
    renderCell: (params) => (
        <Checkbox
        defaultChecked={params.value}
          onChange={() => handleCheckboxChange(params.row.id, 'import')}
        />
      ),},
  ];

  const handleCheckboxChange = (menuId, menuType) => {
    const updatedCheckedMenus = { ...state.formData.menu };

    if (!updatedCheckedMenus[menuId]) {
      updatedCheckedMenus[menuId] = {};
    }
    updatedCheckedMenus[menuId][menuType] = updatedCheckedMenus[menuId][menuType] === "1" ? "0" : "1";
    if (Object.values(updatedCheckedMenus[menuId]).every((value) => value === "0")) {
      delete updatedCheckedMenus[menuId];
    }
    // Update state dengan objek menu yang baru
    dispatch({ type: "CHANGE_CHECKBOX", value: updatedCheckedMenus });
  };

  const checkAndHandleInitialCheckboxValues = (DataPriv) => {
    DataPriv.forEach((item) => {
      if (item.view === true) {
        handleCheckboxChange(item.id, 'view');
      }
      if (item.add === true) {
        handleCheckboxChange(item.id, 'add');
      }
      if (item.edit === true) {
        handleCheckboxChange(item.id, 'edit');
      }
      if (item.delete === true) {
        handleCheckboxChange(item.id, 'delete');
      }
      if (item.export === true) {
        handleCheckboxChange(item.id, 'export');
      }
      if (item.import === true) {
        handleCheckboxChange(item.id, 'import');
      }
    });
  };

  useEffect(()=>{
    setLoading(true)
    const getData=async()=>{
        await axios.get(`http://localhost:8000/api/positions/${paramName}?relations=privilage,privilage.menuitem,privilage.menuitem.menugroup`,{
            headers:{ 
                "Content-Type" : "aplication/json",
                "Authorization" : `Bearer ${cookie}`
              }
        }).then(response=>{
            const privilage = response.data.privilage
            const DataPriv = privilage.map(p=>({
                ...p,
                id: p.menuitem.id,
                name:p.menuitem.name,
                menuGroup:p.menuitem.menugroup.name,
                view: p.view === 1,
                add: p.add === 1,
                edit: p.edit === 1,
                delete: p.delete === 1,
                export: p.export === 1,
                import: p.import === 1,
            }))
            checkAndHandleInitialCheckboxValues(DataPriv)
            setProduct(DataPriv)
        })
        setLoading(false)
    }
    getData()
  },[])
  console.log(productList);
  console.log(state);
 
  const handleValidation = (formData) => {
    const errors = {};
    // Perform validation here
    Object.keys(formData).forEach((field) => {
      if (field !== "stock" && field !== "coli" && field !== "discount") {
        if (formData[field] === '' || formData[field] === 0) {
          errors[field] = `${field} is required`;
        }
      }
      if (field === "netPrice" || field === "discount" || field === "tax") {
        if (!/^[0-9]+$/.test(formData[field])) {
          errors[field] = "Only numbers from 0 to 9 are allowed, negative number or alphabet isn't allowed";
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
  };
  const handleCreate= async() =>{
    const formdata = {...state.formData}; // Clone the formData to avoid modifying the original state

    const errors = handleValidation(formdata);

    if (Object.keys(errors).length > 0) {
      return;
    }
    const formData = new FormData()
    formData.append("name",state.formData.name)
    if (state.formData.menu && Object.keys(state.formData.menu).length > 0) {
        // Jika ada data dalam array menu, tambahkan data tersebut langsung ke formData
        Object.keys(state.formData.menu).forEach((menuId) => {
          Object.keys(state.formData.menu[menuId]).forEach((menuType) => {
            formData.append(`menu[${menuId}][${menuType}]`, state.formData.menu[menuId][menuType]);
          });
        });
      }
    try {
      await axios.post("http://localhost:8000/api/positions",formData,{
        headers:{
          Authorization: `Bearer ${cookie}`
        }
      }).then(response=>{
        console.log(response);
        handleClick(response.data.message,'success')
        setTimeout(()=>{
          load(true)
          setTimeout(()=>{
            load(false)
            navigate('/dashboard/position')
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
  
  const filteredUsers = applySortFilter(productList, getComparator(order, orderBy), filterName);
  
  return (
    <>
      <Container>
        {loading ? (
            <Typography textAlign={'center'} variant='subtitle2' marginBottom={5}>.....Loading</Typography>
        ):(
      <>
        <TextField
            id="outlined-disabled"
            label="Position"
            fullWidth
            name='name'
            onChange={handleChange}
            error={!!state.validationErrors.name}
            helperText={state.validationErrors.name || ' '}
            />
            <Card>
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
                        pageSizeOptions={[25, 50]}
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
                            paginationModel: { page: 0, pageSize: 25 },
                            },
                        }}
                        pageSizeOptions={[25, 50]}
                        getRowHeight={() => 'auto'}
                        />
                    </Box>
                ) }
          </Scrollbar>
        </Card>
        <Button variant="contained"  onClick={handleCreate} sx={{ marginTop:5 }}>
            Update
          </Button>
      
      </>
            )}
        <Snackbar open={open} autoHideDuration={1500} onClose={handleClose} anchorOrigin={{ vertical , horizontal }}>
        <Alert onClose={handleClose} severity={state2.variant} sx={{ width: '100%' }}>
        {state2.message}
        </Alert>
      </Snackbar>
      </Container>
             
        </>
  );
}
