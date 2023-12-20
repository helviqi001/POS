import { Helmet } from 'react-helmet-async';
import { filter, size } from 'lodash';
import { sentenceCase } from 'change-case';
import { forwardRef, useContext, useEffect, useState } from 'react';
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
  Dialog,
  DialogContent,
  Snackbar,
} from '@mui/material';
// components
import MuiAlert from '@mui/material/Alert';
import DetailsIcon from '@mui/icons-material/Details';
import { DataGrid, GridActionsCellItem, GridCsvExportMenuItem, GridToolbarContainer, GridToolbarExport, GridToolbarExportContainer } from '@mui/x-data-grid';
import {ProductListToolbar } from '../sections/@dashboard/product';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
import { OutletContext } from '../layouts/dashboard/OutletProvider';
import DetailRestock from '../sections/@dashboard/restock/detail';

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
    return filter(array, (_user) => _user.productName.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

const Alert = forwardRef((props, ref) =>(
  <MuiAlert elevation={6} ref={ref} variant="standard" {...props} />
));

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
const baseUrl = process.env.PUBLIC_URL

export default function RestockPage() {
  const {menu,item} = useParams()

  const setting = JSON.parse(localStorage.getItem('setting'))

  const Privilages = JSON.parse(localStorage.getItem('privilage'))

  const navigate = useNavigate()
  
  const [open, setOpen] = useState(null);
  
  const [openModal, setOpenModal] = useState(false);
  
  const [Detail, setDetail] = useState(false);
  
  const [page, setPage] = useState(0);
  
  const [order, setOrder] = useState('asc');
  
  const [selected, setSelected] = useState([]);
  
  const [orderBy, setOrderBy] = useState('');
  
  const [filterName, setFilterName] = useState('');
  
  const cookies = new Cookies()
  
  const [productList,setProduct] = useState([])
  
  const [id,setId] = useState()
  
  const {load} = useContext(OutletContext)

  const [loading,setLoading] = useState(true)

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


  const handleOpenMenu = (event,id) => {
    setOpen(event.currentTarget);
    const rowId = id.split('-')[0]
    setId([Number(rowId)])
  };
  const DATAGRID_COLUMNS = [
    { field: 'No', headerName: 'No', width: 80, headerAlign: 'center', align: 'center'},
    { field: 'id', headerName: 'Restock_id', width: 150 , headerAlign: 'center',align:'center'},
    { field: 'idRestock', headerName: 'Kode Restock', width: 150 , headerAlign: 'center',align:'center'},
    { field: 'productName', headerName: 'Product', width: 150,
       headerAlign: 'center', align:'center'},
    { field: 'supplierName', headerName: 'Supplier name', width: 150 , headerAlign: 'center',align:'center'},
    { field: 'quantity', headerName: 'Quantity', width: 150,
   headerAlign: 'center',align:'center' },
    { field: 'coli', headerName: 'Coli', width: 150,
   headerAlign: 'center',align:'center'},
    { field: 'restockDate', headerName: 'Restock Date',width:150,headerAlign: 'center',align:'center'},
    { field: 'totalSpend', headerName: 'Total Spend',width:150,headerAlign: 'center',align:'center',
    valueGetter: (params) => {
        const totalSpend = params.row.totalSpend;
        return `IDR ${totalSpend.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        })}`} },
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
            onClick={(e)=>handleOpenMenu(e,id)}
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
      const { supplier, products, ...rest } = entry;
      
      if (products && products.length > 0) {
        // Loop through each product in the current restock
        products.forEach((product) => {
          const productRow = {
            productId: product.id,
            supplierName: supplier.name,
            productName: product.name,
            quantity: product.pivot.quantity,
            coli: product.pivot.coli,
            No: processedData.length +1,
            ...rest,
          };
          processedData.push(productRow);
        });
      }
    });
    
    return processedData;
  };

  useEffect(()=>{
    const cookie = cookies.get("Authorization")
    setLoading(true)
    const getdata=async()=>{
      await axios.get(`${apiEndpoint}api/restocks?relations=supplier,products`,{
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

  const handleOpenModalDetail=()=>{
    setOpenModal(true)
    setDetail(true)
  }

  const handleCloseModal=()=>{
    setOpenModal(false)
    setDetail(false)
  }

  const handleOpenModal=()=>{
    navigate(`${baseUrl}/dashboard/restock/create/${menu}/${item}`)
  }
  const handleOpenModalEdit=()=>{
    setOpen(null);
    navigate(`${baseUrl}/dashboard/restock/edit/${menu}/${item}`,{state:{id}})
  }

  const handleDelete=async()=>{
    load(true)
    const cookie = cookies.get("Authorization")
    axios.post(`${apiEndpoint}api/delete/restocks`,{id},{
      headers:{
        "Content-Type" : "aplication/json",
        "Authorization" : `Bearer ${cookie}`
      }
    }).then(()=>{
      load(false)
      handleClose()
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
        title="Restock Page"
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
            Restock List
          </Typography>
          {priv.add === 1 && (
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleOpenModal}>
            New Resctock
          </Button>
          )}
        </Stack>

        <Card>
        <ProductListToolbar selected={selected} setId={setId} filterName={filterName} onFilterName={handleFilterByName} handleClick={handleClick} />
          <Scrollbar>
          {loading ? (
              <Typography textAlign={'center'} variant='subtitle2' marginBottom={5}>.....Loading</Typography>
          ) : (
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
        <MenuItem onClick={handleOpenModalDetail}> 
          <DetailsIcon sx={{ mr: 2 }} />
          Detail
        </MenuItem>
      </Popover>
      {openModal && (
                  <>
                      {Detail && (
                          <DetailRestock style2={style2} openModal={openModal} handleCloseModal={handleCloseModal} id={id} />
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


const CustomToolbar =()=>{
  const {menu,item} = useParams()
  const Privilages = JSON.parse(localStorage.getItem('privilage'))
  const Alert = forwardRef((props, ref) =>{
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });
  const [open,setOpen] = useState(false)
  const [file,setFile] = useState([])
  const cookies = new Cookies()
  const cookie = cookies.get("Authorization")
  const {load} = useContext(OutletContext)
  const [priv,setPriv] = useState({
    export:0,
    import:0,
  })
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
  const handleImport = (files) => {
    setFile(files)
    const formData = new FormData();
    formData.append('excel_file', files);
  
    // Kirim file ke server menggunakan Axios atau library lainnya
    axios.post(`${apiEndpoint}api/import/restocks`, formData,{
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
        if (error.response.status === 400 ) {
          if(error.response.data.error){
            handleClick(error.response.data.error,'error')
          }
          else if(error.response.data.error.errorInfo){
            handleClick(error.response.data.error.errorInfo[2],'error')
          }
        }
      });
  };
  const handleOpenModal=()=>{
    setOpen(true)
  }
  const handleCLose=()=>{
    setOpen(false)
  }
  useEffect(()=>{
    Privilage()
  },[])
  return (
    <>
    <GridToolbarContainer>
      {priv.export === 1 && (
          <GridToolbarExportContainer>
          <GridCsvExportMenuItem options={{ 
          delimiter: ';',
           }} />
        </GridToolbarExportContainer>
      )}
      {priv.import === 1 && (
        <Button onClick={handleOpenModal}>Import</Button>
      )}
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