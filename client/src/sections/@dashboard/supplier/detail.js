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
      { field: 'idRestock', headerName: 'ID Transaction', width:150 , headerAlign: 'center', align:'center'},
      { field: 'restockDate', headerName: 'Restock Date', width: 200 , headerAlign: 'center',align:'center'},
      { field: 'productName', headerName: 'Product', width: 200 , headerAlign: 'center',align:'center'},
      { field: 'totalSpend', headerName: 'Total Spend', width:200 , headerAlign: 'center', align:'center',valueGetter:(params)=>{
        const sellingPrice = params.row.totalSpend
        return `IDR ${sellingPrice.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        })}`}},
    ];

    const getProcessedData = (data) => {
      const processedData = [];
      
      data.forEach((entry) => {
        const {products, ...rest } = entry;
        
        if (products && products.length > 0) {
          // Loop through each product in the current restock
          products.forEach((p) => {
            const productRow = {
              productId:p.id,
              productName:p.name,
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
          await axios.get(`${apiEndpoint}api/suppliers/${id}?relations=restock.products`,{
            headers:{
              "Content-Type":"aplication/json",
              Authorization: `Bearer ${cookie}`
            }}).then(response=>{
              console.log(response.data.restock);
              getProcessedData(response.data.restock)
              })
              await setLoading(false)
            }

            getData()
          },[id,cookie])

          console.log(productList);
    return(
      <> 
          <Dialog open={openModal} onClose={handleCloseModal} scroll='body'>
          <DialogTitle align='center'>Detail Trasaction Customer</DialogTitle>
          <DialogContent>
      
          {loading ? <div style={{ height:500 , width:'auto' }}>
            <Loading2/>
           </div>
           :

           (
            <>
               {productList.length === 0 ? (
              <Box sx={{ height:150}}>
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
                getRowHeight={() => 35}
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