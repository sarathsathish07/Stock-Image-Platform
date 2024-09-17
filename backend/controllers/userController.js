import expressAsyncHandler from "express-async-handler"
import User from "../models/userModel.js"
import generateToken from "../utils/generateToken.js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authUser = expressAsyncHandler(async (req,res)=>{
  
  const {email,password} = req.body
  
  const user = await User.findOne({email})
  if(user && (await user.matchPassword(password))){
    generateToken(res,user._id)
    res.status(201).json({
      _id:user._id,
      name:user.name,
      email:user.email
    })
  }else{
    res.status(401)
    throw new Error('Invalid email or password')
  }
})
const registerUser = expressAsyncHandler(async (req,res)=>{
  const {name,email,password} = req.body
  const userExists = await User.findOne({email})
  if(userExists){
    res.status(400)
    throw new Error('User already exists')
  }

  const user = await User.create({
    name,
    email,
    password
  })

  if(user){
    generateToken(res,user._id)
    res.status(201).json({
      _id:user._id,
      name:user.name,
      email:user.email
    })
  }else{
    res.status(400)
    throw new Error('Invalid user data')
  }

 
})
const logoutUser = expressAsyncHandler(async (req,res)=>{
  res.cookie('jwt','',{
    httpOnly:true,
    expires: new Date(0)
  })
  res.status(200).json({message:"User logged out"})
})
// const getUserProfile = expressAsyncHandler(async (req,res)=>{
//   const user = {
//     _id:req.user._id,
//     name:req.user.name,
//     email:req.user.email
//   }
//   res.status(200).json(user)
// })
const updateUserProfile = expressAsyncHandler(async (req,res)=>{
  console.log("2");
  
  const user = await User.findById(req.user._id)
  if(user){
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    if(req.body.password){
      user.password = req.body.password
    }
    const updatedUser = await user.save()
    res.status(200).json({
      _id:updatedUser._id,
      name:updatedUser.name,
      email:updatedUser.email,
    })
  }else{
    res.status(404)
    throw new Error('User not found')
  }
})

const uploadUserImages = expressAsyncHandler(async (req, res) => {
  
  console.log("6");
  
  const user = await User.findById(req.user._id);
  console.log(user);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Validate that a title is provided for each image
  const titles = req.body.titles;

  if (!titles || titles.length !== req.files.length) {
    res.status(400);
    throw new Error('Each image must have a corresponding title');
  }

  const hasEmptyTitle = titles.some((title) => !title.trim());
  if (hasEmptyTitle) {
    res.status(400);
    throw new Error('All images must have non-empty titles');
  }

  const newImages = req.files.map((file, index) => ({
    fileName: file.filename,
    title: titles[index],
  }));
  
  console.log(newImages);

  user.images.push(...newImages);
  await user.save();

  res.json({
    message: 'Images uploaded successfully',
    images: user.images,
  });
});


const getImages = expressAsyncHandler(async (req,res)=>{
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({ images: user.images || [] });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
})
const updateImage = expressAsyncHandler(async (req, res) => {
  console.log("9");
  
  try {
    const userId = req.user._id; 
    const imageId = req.params.id;
    
    const { title } = req.body;
    
    const file = req.file;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const image = user.images.id(imageId);

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    if (title) {
      image.title = title;
    }

    if (file) {
      if (image.fileName) {
        fs.unlinkSync(path.join(__dirname, '../public/uploads', image.fileName));
      }

      image.fileName = file.filename;
    }

    await user.save();
    res.status(200).json(image);
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
const deleteImage = expressAsyncHandler(async (req, res) => {
  const userId = req.user._id; 
  const imageId = req.params.id;
  console.log(imageId);
  

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const image = user.images.id(imageId);

  if (!image) {
    return res.status(404).json({ message: 'Image not found' });
  }

  if (image.fileName) {
    const filePath = path.join(__dirname, '../public/uploads', image.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  await User.updateOne(
    { _id: userId },
    { $pull: { images: { _id: imageId } } }
  );

  res.status(200).json({ message: 'Image deleted successfully' });
});

const updateImageOrder = expressAsyncHandler(async (req, res) => {
  console.log("5"); // This should be logged if the request hits the backend

  const { newImageOrder } = req.body; 

  if (!newImageOrder || !Array.isArray(newImageOrder)) {
    res.status(400);
    throw new Error('Invalid image order');
  }

  const user = await User.findById(req.user._id);

  if (user) {
    const reorderedImages = newImageOrder.map((id) =>
      user.images.find((img) => img._id.toString() === id)
    );

    user.images = reorderedImages;
    await user.save();

    res.status(200).json({ message: 'Image order updated successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});



export {
  authUser,
  registerUser,
  logoutUser,
  // getUserProfile,
  updateUserProfile,
  uploadUserImages,
  getImages,
  updateImage,
  deleteImage,
  updateImageOrder
}