import { UserDTO } from "../dtos/user.dto";
import { userDocument } from "../models/userModel";

export const toUserDTO = (user: userDocument): UserDTO => {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    image: user.image,
    gender: user.gender,
    dob: user.dob,
    phone: user.phone,
    address: user.address,
    isBlocked: user.isBlocked,
  };
};
