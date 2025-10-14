import { UserDTO } from '../dtos/user.dto';
import { userDocument } from '../models/userModel';
import { v2 as cloudinary } from 'cloudinary';

export const toUserDTO = (user: userDocument): UserDTO => {
    let signedImageUrl: string | undefined;

  if (user.image) {
    signedImageUrl =  cloudinary.url(user.image, {
      type: 'authenticated', 
      secure: true,
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600, 
    });
  }
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    image: signedImageUrl || user.image,
    gender: user.gender,
    dob: user.dob,
    phone: user.phone,
    address: user.address,
    isBlocked: user.isBlocked,
  };
};
