import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiErrors.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave : false });

        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access tokens")
    }
}


const registerUser = asyncHandler( async (req,res) => {
    // res.status(200).json({
    //     message: "ahmad user controller is working fine"
    // })

    // go to user model and see
    // now we want to register user -- algo 
    // 1. get user details from frontend --(for now get details from postman)
    // 2. validation (atleast one, like not empty)
    // 3. check if user already exist (username or email se we can check)
    // 4. check  for images , check for avatar(as it was required in user model)
    // 5. upload them cloudinary, avatar check
    // 6. create user object - create entry in db
    // 7. remove password and refresh token field from response
    // 8. check for user creation 
    // 9. return res
 
    //step 1 - get user details
    const {fullName, email, username, password} = req.body
    // console.log("email: ", email); //check using postman

    //step 2 - validations
    // if(fullName ===""){
    //     throw new ApiError(400,"full name is required")
    // }
    // if(email ===""){
    //     throw new ApiError(400,"email is required")
    // }
    // if(username ===""){
    //     throw new ApiError(400,"username is required")
    // }
    // if(password ===""){
    //     throw new ApiError(400,"password is required")
    // }
    // or
    if(
        [fullName,email,username,password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400,"All Fields are required")
    }

    //step 3 - check if user already exists or not
    const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    })
    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }
    // console.log(req.files);

    //step 4 - check  for images , check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    //step 5 -upload them cloudinary, avatar check
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    //step 6 - create user object : create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    //step 7 - remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registring the user")
    }

    //step 8 -  return the res
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered succesfully")
    )
} )

const loginUser = asyncHandler(async (req,res) => {
    // req body -> get data(get details from client)
    // username or email 
    // find the user
    // password check
    // access and refresh token 
    // send cookies
    // sen response

    const {email,username, password} = req.body;
    
    if(!username || !email){
        throw new ApiError(400,"username or email is required");
    }

    // User.findOne({email})
    // User.findOne({email})
    const user = await User.findOne({ 
        $or: [{username},{email}] // $or : [{},{},{}]--> these are mongodb operators
    })
    if(!user){
        throw new ApiError(404,"User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Password incorrect");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

   const options = {
    httpOnly: true,
    secure: true
   }

   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
    new ApiResponse(
        200,
        {
            user: loggedInUser, accessToken, refreshToken
        },
        "User Logged in Successfully"
    )
   )

})

const logoutUser = asyncHandler( async (req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json( new ApiResponse(200, {}, "User logged Out"))
})

export {
    registerUser,
    loginUser,
    logoutUser
}
