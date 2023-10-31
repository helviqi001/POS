import 'bootstrap/dist/css/bootstrap.css';
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "universal-cookie";
import Loading from '../Loading/loading';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

export default function InvoicePage(){
  const location = useLocation();
  const cookies = new Cookies()
  const cookie = cookies.get("Authorization")
  const [data,setData] = useState([])
  const [loading,setLoading] = useState(true)

  // Access the passed parameter
  const paramName = location.state.paramName;

  
  useEffect(()=>{
    setLoading(true)
    const GetData =async()=>{
       await axios.get(`${apiEndpoint}api/transactions/${paramName.transaction_id}?relations=staff,customer,products`,{
        headers:{
          "Content-Type" : "aplication/json",
          "Authorization" : `Bearer ${cookie}`
        }
       }).then(response=>{
        setData(response.data)
        console.log(response.data);
       })
       setLoading(false)
    }
    GetData()
  },[])
    return(
        <>
        {loading ? (
          <Loading/>
        ) : (
          <div className="card">
  <div className="card-body">
    <div className="container mb-5 mt-3">
      <div className="row d-flex align-items-baseline">
        <div className="col-xl-9">
          <p style={{ color: "#7e8d9f",fontSize: "20px" }}>Invoice<strong>ID: #{paramName.invoiceId}</strong></p>
        </div>
        <hr/>
      </div>

        <div className="row">
          <div className="col-8">
            <ul className="list-unstyled">
                  <li className="text-muted">To: <span style={{ color:"#5d9fc5"}}>{data.customer.name}</span></li>
                  <li className="text-muted w-50">{data.customer.address}</li>
                  <li className="text-muted"><i className="fas fa-phone"/> {data.customer.phone}</li>
            </ul>
          </div>
          <div className="col-4">
            <p className="text-muted">Invoice</p>
            <ul className="list-unstyled">
              <li className="text-muted"><i className="fas fa-circle" style={{ color:"#84B0CA" }}/> <span
                  className="fw-bold">ID:</span>#{paramName.invoiceId}</li>
              <li className="text-muted"><i className="fas fa-circle" style={{ color:"#84B0CA" }}/> <span
                  className="fw-bold">Creation Date: </span>{paramName.date}</li>
              <li className="text-muted"><i className="fas fa-circle" style={{ color:"#84B0CA" }}/> <span
                  className="me-1 fw-bold">Status:</span><span className="badge bg-warning text-black fw-bold">
                  {data.paymentStatus}</span></li>
            </ul>
          </div>
        </div>

        <div className="row my-2 mx-1 justify-content-center">
          <table className="table table-striped table-borderless text-center">
            <thead className="text-white table-primary">
              <tr>
                <th scope="col">#</th>
                <th scope="col">Description</th>
                <th scope="col">Qty</th>
                <th scope="col">Unit Price</th>
                <th scope="col">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((p,index)=>(
              <tr key={index}>
                <td>
                  {index+1}
                </td>
                <td>
                  {p.name}
                </td>
                <td>
                  {p.pivot.quantity}
                </td>
                <td>
                  IDR {(p.sellingPrice * (100 - p.discount) / 100).toLocaleString('id-ID')}
                </td>
                <td>
                IDR {(p.pivot.quantity*(p.sellingPrice * (100 - p.discount) / 100)).toLocaleString('id-ID')}
                </td>
              </tr>
              ))}
            </tbody>

          </table>
        </div>
        <div className="row">
          <div className="col-8">
            <p className="ms-3">tertanda,</p>

          </div>
          <div className="col-3">
            <p className="text-black d-flex flex-column align-items-center"><span className="text-black"> Total Amount :</span><span
                style={{ fontSize: "15px" }}>IDR {data.total.toLocaleString('id-ID')}</span></p>
          </div>
        </div>
        <hr className="mt-5"/>
        <div className="row">
          <div className="col-xl-10">
            <p>Thank you for your purchase</p>
          </div>
        </div>

      </div>
    </div>
</div>
        )}
        </>
    )
}