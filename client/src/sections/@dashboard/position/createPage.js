import { filter, size } from 'lodash';
import { forwardRef, useContext, useEffect, useReducer, useState } from 'react';
import Cookies from 'universal-cookie/cjs/Cookies';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
// @mui
import {
  Card,
  Button,
  Checkbox,
  Container,
  Typography,
  Box,
  TextField,
  Snackbar,
} from '@mui/material';
// components
import MuiAlert from '@mui/material/Alert';
import { DataGrid} from '@mui/x-data-grid';
import Scrollbar from '../../../components/scrollbar';
import { OutletContext } from '../../../layouts/dashboard/OutletProvider';
import { INITIAL_STATE, PositionReducer } from './PositionReducer';

const Alert = forwardRef((props, ref) =>{
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

export default function CreatePosition() {
  const {menu,item} = useParams()

  const [state,dispatch] = useReducer(PositionReducer,INITIAL_STATE)

  const cookies = new Cookies()

  const [productList,setProduct] = useState([])

  const {load} = useContext(OutletContext) 

  const navigate = useNavigate()

  const cookie = cookies.get("Authorization")

  const [loading,setLoading] = useState(true)

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
    { field: `id`, headerName: 'id', width: 350 , headerAlign: 'center', align:'center',},
    { field: `menuGroup`, headerName: 'Menu', width: 350 , headerAlign: 'center', align:'center',
    renderCell: (params) => (
      <>
       <Typography>{`${params.row.menuGroup}/${params.row.name}`}</Typography>
      
      </>
      ),},
    { field: 'view', headerName: 'View', width:90 , headerAlign: 'center', align:'center', 
    renderCell: (params) => (
      <>
      <Checkbox
        checked={params.value}
        onChange={() => handleCheckboxChange(params.row.id, 'view')}
        />
    
    </>
      ),},
    { field: 'add', headerName: 'Add', width:90 , headerAlign: 'center', align:'center', 
    renderCell: (params) => (
        <Checkbox
          checked={params.value}
          onChange={() => handleCheckboxChange(params.row.id, 'add')}
        />
      ),},
    { field: 'edit', headerName: 'Edit', width:90 , headerAlign: 'center', align:'center', 
    renderCell: (params) => (
        <Checkbox
          checked={params.value}
          onChange={() => handleCheckboxChange(params.row.id, 'edit')}
        />
      ),},
    { field: 'delete', headerName: 'Delete', width:90 , headerAlign: 'center', align:'center',
    renderCell: (params) => (
        <Checkbox
          checked={params.value}
          onChange={() => handleCheckboxChange(params.row.id, 'delete')}
        />
      ),},
    { field: 'export', headerName: 'Export', width:90 , headerAlign: 'center', align:'center',
    renderCell: (params) => (
        <Checkbox
          checked={params.value}
          onChange={() => handleCheckboxChange(params.row.id, 'export')}
        />
      ),},
    { field: 'import', headerName: 'Import', width:90 , headerAlign: 'center', align:'center', 
    renderCell: (params) => (
        <Checkbox
          checked={params.value}
          onChange={() => handleCheckboxChange(params.row.id, 'import')}
        />
      ),},
  ];

  const handleCheckboxChange = (menuId, menuType) => {
    const updatedCheckedMenus = { ...state.formData.menu };

    if (!updatedCheckedMenus[menuId]) {
      updatedCheckedMenus[menuId] = {};
    }

    // Set nilai field yang sesuai dengan menuType menjadi "1" (dicentang) atau "0" (tidak dicentang)
    updatedCheckedMenus[menuId][menuType] = updatedCheckedMenus[menuId][menuType] === "1" ? "0" : "1";
    if(Object.values(updatedCheckedMenus[menuId]).some(
      (value) => value === "0"
    )){
      delete updatedCheckedMenus[menuId][menuType]
    }
    // Hapus menuId dari objek menu jika semua nilai menuType adalah "0" (tidak ada yang dicentang)
    if (Object.values(updatedCheckedMenus[menuId]).every((value) => value === "0" )){
      delete updatedCheckedMenus[menuId];
    }

    // Update state dengan objek menu yang baru
    dispatch({ type: "CHANGE_CHECKBOX", value: updatedCheckedMenus });
  };
    console.log(state);

//   console.log(state);
  useEffect(()=>{
    setLoading(true)
    const getData=async()=>{
        await axios.get(`${apiEndpoint}api/menuitems?relations=menugroup`,{
            headers:{
                "Content-Type" : "aplication/json",
                "Authorization" : `Bearer ${cookie}`
              }
        }).then(response=>{
            setProduct(response.data.data.map(p=>({
                ...p,
                menuGroup:p.menugroup.name
            })))
        })
        setLoading(false)
    }
    getData()
  },[])

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
      await axios.post(`${apiEndpoint}api/positions`,formData,{
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
            navigate(`/dashboard/position/${menu}/${item}`)
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
                    {productList.length === 0 ? (
                    <Box sx={{ height:150 }}>
                        <DataGrid
                        rows={productList}
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
                        rows={productList}
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
            Create
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
