// import { useEffect, useState } from "react"
// import axios from "axios"
// import { useNavigate } from "react-router-dom"

// export default function InvoiceList(){

//  const [invoices,setInvoices] = useState([])
//  const [loading,setLoading] = useState(false)

//  const navigate = useNavigate()

// //  const fetchInvoices = async () => {
// //   try{

// //    setLoading(true)

// //    const res = await axios.get("/api/sales-invoices")

// //    setInvoices(res.data)

// //   }catch(err){
// //    console.error(err)
// //   }finally{
// //    setLoading(false)
// //   }
// //  }
// const fetchInvoices = async () => {
//   try{

//    setLoading(true)

//    const res = await axios.get("/api/sales-invoices")

//    setInvoices(res.data.invoices || [])

//   }catch(err){
//    console.error(err)
//   }finally{
//    setLoading(false)
//   }
// }
//  useEffect(()=>{
//   fetchInvoices()
//  },[])

//  if(loading) return <p>Loading invoices...</p>

//  return (

//   <div style={{padding:"20px"}}>

//    <h2>Invoices</h2>

//    <table border="1" cellPadding="10" width="100%">

//     <thead>
//      <tr>
//       <th>Invoice No</th>
//       <th>Customer</th>
//       <th>Mobile</th>
//       <th>Grand Total</th>
//       <th>Action</th>
//      </tr>
//     </thead>

//     <tbody>

//      {invoices.map((invoice)=>(
//       <tr key={invoice._id}>

//        <td>{invoice.invoiceNo}</td>

//        <td>{invoice.customer?.name}</td>

//        <td>{invoice.customer?.mobile}</td>

//        <td>₹ {invoice.totals?.grandTotal}</td>

//        <td>

//         <button
//          onClick={()=>navigate(`/invoices/${invoice._id}`)}
//         >
//          View
//         </button>

//        </td>

//       </tr>
//      ))}

//     </tbody>

//    </table>

//   </div>
//  )
// }