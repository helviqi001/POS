import axios from 'axios';
// @mui
import {
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Table,
  TableContainer,
  TableHead,
  TableCell,
  TableRow,
  Paper,
  TableBody,
} from '@mui/material';
import { useEffect, useReducer, useState } from 'react';
import Cookies from 'universal-cookie';
import Loading2 from '../../../Loading/loading2';
import { SUPPLIER_STATE, RestockRecuder } from './RestockReducer';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const DetailRestock = ({ id , openModal , handleCloseModal})=>{

    const [loading, setLoading] = useState(true);
    const [state,dispatch] = useReducer(RestockRecuder,SUPPLIER_STATE)
    const cookies = new Cookies
    
    const cookie = cookies.get("Authorization")

      useEffect(()=>{
        setLoading(true)
        const getData= async()=>{
          await axios.get(`${apiEndpoint}api/restocks/${id}?relations=products`,{
            headers:{
              "Content-Type":"aplication/json",
              Authorization: `Bearer ${cookie}`
            }}).then(response=>{
              dispatch(
                {type:"UPDATE" , payload: response.data}
                )
              })
              await setLoading(false)
            }

            getData()
          },[id,cookie])
    return(
      <> 
          <Dialog open={openModal} onClose={handleCloseModal} scroll='body'>
          <DialogTitle align='center'>Update Supplier Form</DialogTitle>
          <DialogContent>
      
          {loading ? <div style={{ height:500 , width:400 }}>
            <Loading2/>
           </div>
           :

           (
            <>
               <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 300 }} aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">Product Name</TableCell>
                        <TableCell align="center">Quantity of Restock</TableCell>
                        <TableCell align="center">Coli of Restock</TableCell>
                      </TableRow>
                    </TableHead>
              {state.products.map(p=>(
                <>
                    <TableBody>
                        <TableRow
                          key={p.id}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 }}}
                        >
                          <TableCell component="th" scope="row" align="center">
                            {p.name}
                          </TableCell >
                          <TableCell align="center">{p.pivot.quantity}pcs</TableCell>
                          <TableCell align="center">{p.pivot.coli}coli</TableCell>
                        </TableRow>
                    </TableBody>
                
                </>
              ))}
              </Table>
            </TableContainer>
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
export default DetailRestock