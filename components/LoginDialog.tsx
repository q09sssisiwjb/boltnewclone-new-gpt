import React, { useContext } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LOOKUP } from '@/data/Lookup'
import { Button } from '@/components/ui/button'
import { useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import { UserDetailContext } from '@/context/UserDetailContext'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import uuid4 from 'uuid4'


// @ts-expect-error - Props are passed from parent component without explicit typing
const LoginDialog = ({ openDialog, closeDialog }) => {
  const context = useContext(UserDetailContext)
  if (!context) throw new Error('UserDetailContext must be used within UserDetailProvider')
  
  const { setUserDetail } = context
  const CreateUser = useMutation(api.user.CreateUser)

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const userInfo = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: 'Bearer ' + tokenResponse.access_token } },
      );

      const user = userInfo.data;
      await CreateUser({
        name: user?.name,
        email: user?.email,
        picture: user?.picture,
        uid: uuid4(),
      })
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user))
      }
      setUserDetail(userInfo.data)
      closeDialog(false);
    },
    onError: errorResponse => console.log(errorResponse),
  });

  return (
    <Dialog open={openDialog} onOpenChange={closeDialog} >

      <DialogContent>
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription >
            <div className='flex flex-col justify-center items-center gap-2'>
              <h2 className='font-bold text-2xl text-white'>{LOOKUP.SIGNIN_HEADING}</h2>
              <p className='mt-2 text-center'>{LOOKUP.SIGNIN_SUBHEADING}</p>
              <Button onClick={() => googleLogin()} className='bg-blue-500 mt-2 hover:bg-blue-400'>Sign In with Google</Button>
              <p>{LOOKUP.SIGNIN_AGREEMENT_TEXT}</p>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>

  )
}

export default LoginDialog
