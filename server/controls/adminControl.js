const { model } = require('mongoose')
const userModel=require('../models/userModel')
const tipsModel=require('../models/tipsModel')
const productModel=require('../models/productModel')
const login=async(req,res)=>{
    try{
        const {email,password}=req.body
        const user=await userModel.findOne({email:email})
        if(!user){
            res.json({msg:"Admin Don't exists",status:500})
        }else{
            if(user.password==password){
                res.json({msg:"Login Successfull",status:200})
            }
            else{
                res.json({msg:"Admin password wrong",status:500})
            }
        }
    }
    catch(err){
        console.log(err)
    }
}

const viewfarmers=async(req,res)=>{
   try{
    const users=await userModel.find({role: { $ne: "admin" }})
    res.json(users).status(200)
   }catch(err){
    console.log(err)
   }
}


const addTips=(req,res)=>{
    try{
        const{title,url}=req.body
        console.log(req.body)
        const tips=new tipsModel({
            title,url
        })
        tips.save()
        res.json("Tips added successfully")
    }catch(err){
        console.log(err)
    }
}


const viewtips=async(req,res)=>{
   try{
    const tips=await tipsModel.find()
    res.json(tips)
   }catch(err){
    console.log(err)
   }
}

const deleteTips=async(req,res)=>{
    try{
        const id=req.headers.id
        await tipsModel.deleteOne({_id:id})
        res.json("Data deleted successfully")
    }
    catch(err){
        console.log(err)
    }
}


const viewCount = async (req, res) => {
    try {
      const userCount = await userModel.countDocuments();
      const productCount = await productModel.countDocuments();
      const orderCount = await tipsModel.countDocuments();
  
      res.status(200).json({
        users: userCount,
        products: productCount,
        orders: orderCount,
      });
    } catch (err) {
      console.error("Error fetching counts:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  
  const deleteUsers=async(req,res)=>{
    try{
        const id=req.headers._id
        await userModel.deleteOne({_id:id})
        res.json("Data deleted successfully")
    }
    catch(err){
        console.log(err)
    }
}
module.exports={login,viewfarmers,addTips,viewtips,deleteTips,viewCount,deleteUsers}