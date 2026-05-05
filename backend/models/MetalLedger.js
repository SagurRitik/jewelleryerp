// import mongoose from "mongoose";

// const MetalLedgerSchema = new mongoose.Schema(
// {
// type: {
// type: String,
// enum: ["CREDIT", "DEBIT"],
// required: true
// },

// source: {
// type: String,
// enum: [
// "ORDER",
// "INVOICE",
// "MANUAL",
// "VENDOR",
// "REFINERY",
// "CASH_CONVERSION"
// ],
// required: true
// },

// referenceId: {
// type: mongoose.Schema.Types.ObjectId,
// default: null
// },

// referenceModel: {
// type: String,
// enum: ["Order", "SalesOrder"],
// default: null
// },

// customerName: String,

// metalType: String,
// purity: String,

// weight: {
// type: Number,
// default: 0
// },

// ratePerGram: {
// type: Number,
// default: 0
// },

// value: {
// type: Number,
// required: true
// },

// notes: String

// },
// { timestamps: true }
// );

// export default mongoose.model("MetalLedger", MetalLedgerSchema);



import mongoose from "mongoose";

const MetalLedgerSchema = new mongoose.Schema(
{
type:{
type:String,
enum:["CREDIT","DEBIT"],
required:true
},

source:{
type:String,
enum:[
"ORDER",
"INVOICE",
"MANUAL",
"VENDOR",
"REFINERY",
"CASH_CONVERSION"
],
required:true
},

referenceId:{
type:mongoose.Schema.Types.ObjectId,
default:null
},

referenceModel:{
type:String,
enum:["Order","SalesOrder", "Purchase"],
default:null
},

partyName:String,   // 🔥 vendor / customer / refinery

metalType:{
type:String,
enum:["Gold","Silver","Platinum","Other"]
},

purity:String,

weight:{
type:Number,
default:0
},

ratePerGram:{
type:Number,
default:0
},

value:{
type:Number,
required:true
},

notes:String

},
{timestamps:true}
);

export default mongoose.model("MetalLedger",MetalLedgerSchema);