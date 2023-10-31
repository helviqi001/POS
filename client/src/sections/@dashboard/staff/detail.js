import { MuiFileInput } from 'mui-file-input';
import axios from 'axios';
// @mui
import {
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Box,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';
import Loading2 from '../../../Loading/loading2';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const DetailTransaction = ({ id , openModal , handleCloseModal})=>{

    const [loading, setLoading] = useState(true);
    const [productList, setProduct] = useState([]);
    const cookies = new Cookies
    const cookie = cookies.get("Authorization")

    const DATAGRID_COLUMNS = [
      { field: 'idTransaction', headerName: 'ID Transaction', width:150 , headerAlign: 'center', align:'center'},
      { field: 'customerName', headerName: 'Customer Name', width: 190 , headerAlign: 'center',align:'center'},
      { field: 'transactionDate', headerName: 'Transaction Date', width: 200 , headerAlign: 'center',align:'center'},
      { field: 'productName', headerName: 'Product', width: 200 , headerAlign: 'center',align:'center'},
      { field: 'total', headerName: 'Total Payment', width:200 , headerAlign: 'center', align:'center',valueGetter:(params)=>{
        const sellingPrice = params.row.total
        return `IDR ${sellingPrice.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        })}`}},
    ];

    const getProcessedData = (data) => {
      const processedData = [];
      
      data.forEach((entry) => {
        const {customer,products, ...rest } = entry;
        
        if (products && products.length > 0) {
          // Loop through each product in the current restock
          products.forEach((product) => {
            const productRow = {
              productId:product.id,
              customerName:customer.name,
              productName:product.name,
              ...rest,
            };
            processedData.push(productRow);
          });
        }
      });
     setProduct(processedData)
    };
      useEffect(()=>{
        setLoading(true)
        const getData= async()=>{
          await axios.get(`${apiEndpoint}api/staffs/${id}?relations=transaction.customer,transaction.products`,{
            headers:{
              "Content-Type":"aplication/json",
              Authorization: `Bearer ${cookie}`
            }}).then(response=>{
              getProcessedData(response.data.transaction)
            
              })
              await setLoading(false)
            }

            getData()
          },[])
    return(
      <> 
          <Dialog open={openModal} onClose={handleCloseModal} scroll='body'>
          <DialogTitle align='center'>Detail Trasaction Customer</DialogTitle>
          <DialogContent>
      
          {loading ? <div style={{ height:500 , width:400 }}>
            <Loading2/>
           </div>
           :

           (
            <>
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
                pageSizeOptions={[5, 10]}
                disableRowSelectionOnClick
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
                    paginationModel: { page: 0, pageSize: 5 },
                  },
                }}
                pageSizeOptions={[5, 10]}
                disableRowSelectionOnClick
                getRowHeight={() => 'auto'}
                getRowId={(row) => `${row.id}-${row.productId}`}
              />
              </Box>
            )}
            </>
           )
          }
           
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
          </DialogActions>
        </Dialog>
        
        </>
    )
}
export default DetailTransaction