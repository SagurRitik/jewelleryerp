import mongoose from "mongoose";

const creditNoteSchema = new mongoose.Schema({

 creditNoteNo:{
  type:String,
  unique:true
 },

 customer:Object,

 invoiceId:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"SalesOrder",
 },

 returnOrderId:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"ReturnOrder"
 },

 amount:Number,

 metalValue:Number,
 diamondValue:Number,
 makingCharge:Number,
 stoneValue:Number,
 discount:Number,
 gst:Number,

 usableForExchange:{
  type:Boolean,
  default:true
 },

 usedAmount:{
  type:Number,
  default:0
 },

 remainingAmount:Number,

 expiryDate:Date,

 status:{
  type:String,
  enum:["ACTIVE","USED","EXPIRED"],
  default:"ACTIVE"
 }

 },{timestamps:true})

export default mongoose.model("CreditNote", creditNoteSchema);