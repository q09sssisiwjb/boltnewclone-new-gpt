
import { createContext, Dispatch, SetStateAction } from "react";

interface UserDetail {
  _id: string;
  _creationTime: number;
  name: string;
  email: string;
  picture: string;
  uid: string;
}

interface UserDetailContextType {
  userDetail: UserDetail | null;
  setUserDetail: Dispatch<SetStateAction<UserDetail | null>>;
}

export const UserDetailContext = createContext<UserDetailContextType | null>(null);
