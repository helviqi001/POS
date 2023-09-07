import { Helmet } from 'react-helmet-async';
import { filter, size } from 'lodash';
import { sentenceCase } from 'change-case';
import { useContext, useEffect, useState } from 'react';
import Cookies from 'universal-cookie/cjs/Cookies';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MuiFileInput } from 'mui-file-input';
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
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// components
import CreateProduct from '../sections/@dashboard/product/createform';
import EditForm from '../sections/@dashboard/product/editForm';
import { ProductListHead, ProductListToolbar } from '../sections/@dashboard/product';
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
import USERLIST from '../_mock/user';
import { OutletContext } from '../layouts/dashboard/OutletProvider';
import FullImage from './fullImage';

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
    : (a, b) => {
        if (orderBy === 'category') {
          return descendingComparator(a.category.itemType, b.category.itemType);
        }
        return -descendingComparator(a, b, orderBy);
      };
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

export default function ProductPage() {
  const [open, setOpen] = useState(null);

  const [openModal, setOpenModal] = useState(false);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('');

  const [filterName, setFilterName] = useState('');

  const [create,setCreate] = useState(false)

  const cookies = new Cookies()

  const [productList,setProduct] = useState([])


  const [edit,setEdit] = useState(false)

  const [id,setId] = useState()
  
  const {load} = useContext(OutletContext)

  const [fullscreenImage, setFullscreenImage] = useState(null);




  const handleEditClick = (event , id)=> {
    setOpen(event.currentTarget)
    setId(id)
  };

  const openFullscreen = (imageSrc) => {
    setFullscreenImage(imageSrc);
    
  };

  const closeFullscreen = () => {
    setFullscreenImage(null);
  };

  const DATAGRID_COLUMNS = [
    { field: 'idProduk', headerName: 'Id Product', width: 150 , headerAlign: 'center', align:'center'},
    { field: 'name', headerName: 'Name', width: 150 , headerAlign: 'center', align:'center'},
    { field: 'unitName', headerName: 'Unit name', width: 130 , headerAlign: 'center',align:'center'},
    { field: 'supplierName', headerName: 'Supplier name', width: 130 , headerAlign: 'center',align:'center'},
    {
      field: 'categoryType',
      headerName: 'Category',
      width: 90,
      headerAlign: 'center',
      align:'center'
    },
    { field: 'urlImage', headerName: 'Image', width: 150,headerAlign:'center', renderCell: (params) =>
    <button
    onClick={() => openFullscreen(`http://localhost:8000/storage/${params.value}`)}
    className="image-button"
    style={{ background:"none",cursor:'pointer' , border:"none"}}
  >
    <span className="image-span" aria-hidden="true">
      <img
        src={`http://localhost:8000/storage/${params.value}`}
        alt='pic'
        style={{ height: "100%" }}
      />
    </span>
    <span className="image-text">View Image</span>
  </button>},
    { field: 'stock', headerName: 'Stock', width: 120,headerAlign: 'center',align:'center' },
    { field: 'coli', headerName: 'coli', width: 120 , headerAlign: 'center',align:'center'},
    { field: 'tax', headerName: 'Tax ', width: 120,renderCell: (params) => <p>{params.value}%</p> ,headerAlign: 'center',align:'center' },
    { field: 'sellingPrice', headerName: 'Selling Price', width: 120, valueGetter:(params)=>{
      const sellingPrice = params.row.sellingPrice
      return `IDR ${sellingPrice.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })}`} ,headerAlign: 'center',align:'center'},
    { field: 'discount', headerName: 'Discount', width: 120, renderCell: (params) => <p>{params.value}%</p> ,headerAlign: 'center',align:'center'},
    { field: 'netPrice', headerName: 'Net_price', width: 120, valueGetter:(params)=>{
      const netPrice = params.row.netPrice
      return `IDR ${netPrice.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })}`} ,headerAlign: 'center',align:'center'},
    { field: 'margin', headerName: 'Margin', width: 120, renderCell: (params) => <p>{params.value}% </p> ,headerAlign: 'center',align:'center'},
    { field: 'information', headerName: 'Information',width:120,headerAlign: 'center',align:'center'},
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
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
    const cookie = cookies.get("Authorization")
    const getdata=async()=>{
      await axios.get("http://localhost:8000/api/products?relations=category,unit,supplier,restocks",{
        headers:{
          "Content-Type" : "aplication/json",
          "Authorization" : `Bearer ${cookie}`
        }
      }).then(response=>{
        setProduct( response.data.data.map((row) => ({
          ...row,
          unitName: row.unit.shortname,
          supplierName: row.supplier.name,
          categoryType: row.category.itemType,
        })))
      })
    }
    getdata()
  },[])
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
    setImmediate(false)
    setEdit(null)
  }
  const handleDelete=async()=>{
    load(true)
    const cookie = cookies.get("Authorization")
    axios.delete(`http://localhost:8000/api/products/${id}`,{
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
  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const filteredUsers = applySortFilter(productList, getComparator(order, orderBy), filterName);
  
  console.log(productList);
  return (
    <>
      <Helmet>
        <title> User | Minimal UI </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Product List
          </Typography>
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleOpenModal}>
            New Product
          </Button>
        </Stack>

        <Card>
          <ProductListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />
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
                          <CreateProduct style2={style2} openModal={openModal} handleCloseModal={handleCloseModal} productList={productList} />
                      )}
                      {edit && (
                          <EditForm id={id} style2={style2} openModal={openModal} handleCloseModal={handleCloseModal} productList={productList} />
                      )}
                  </>
              )}
              {fullscreenImage && (
                <>
                 <FullImage fullImage={fullscreenImage} closeFullscreen={closeFullscreen}/>
                </>
                )}
        </>
  );
}
