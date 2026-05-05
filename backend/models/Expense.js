// import mongoose from "mongoose";

// const ExpenseSchema = new mongoose.Schema({

// title:{
// type:String,

// },

// amount:{
// type:Number,
// required:true
// },

// category:{
// type:String,
// enum:[
// "RENT",
// "SALARY",
// "ELECTRICITY",
// "TEA",
// "REPAIR",
// "INTERNET",
// "OTHER"
// ],
// default:"OTHER"
// },

// paymentMode:{
// type:String,
// enum:["CASH","BANK","UPI"],
// default:"CASH"
// },

// partyName:String, // vendor (electricity board etc.)

// notes:String,

// expenseDate:{
// type:Date,
// default:Date.now
// }

// },{timestamps:true});

// export default mongoose.model("Expense",ExpenseSchema);


 import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({

title:{
type:String,
},

amount:{
type:Number,
required:true
},

category:{
type:String,
default:"OTHER"
},

paymentMode:{
type:String,
enum:["CASH","BANK","UPI","CARD","CHEQUE"],
default:"CASH"
},

reference:String, // ✅ added

partyName:String,

notes:String,

expenseDate:{
type:Date,
default:Date.now
}

},{timestamps:true});

 export default mongoose.model("Expense",ExpenseSchema);