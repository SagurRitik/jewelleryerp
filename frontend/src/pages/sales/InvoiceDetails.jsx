import { useEffect,useState } from "react"
import axios from "axios"
import { useParams,useNavigate } from "react-router-dom"

export default function InvoiceDetails(){

 const {id} = useParams()
 const navigate = useNavigate()

 const [invoice,setInvoice] = useState(null)

 useEffect(()=>{
  axios.get(`/api/invoices/${id}`)
   .then(res => setInvoice(res.data))
 },[id])

 if(!invoice) return <p>Loading...</p>

 return (
  <div>

   <h2>Invoice {invoice.invoiceNo}</h2>

   <p>Customer: {invoice.customer?.name}</p>
   <p>Mobile: {invoice.customer?.mobile}</p>

   <h3>Items</h3>

   <table border="1">
    <thead>
     <tr>
      <th>Product</th>
      <th>Qty</th>
      <th>Total</th>
     </tr>
    </thead>

    <tbody>
     {invoice.items.map(item => (
      <tr key={item._id}>
       <td>{item.itemSnapshot?.productDetails?.title}</td>
       <td>{item.quantity}</td>
       <td>₹ {item.breakup?.grandTotal}</td>
      </tr>
     ))}
    </tbody>
   </table>

   <br/>

   <button
    onClick={()=>navigate(`/returns/create/${invoice._id}`)}
   >
    Create Return
   </button>

  </div>
 )
}