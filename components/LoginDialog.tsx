import React, { useContext, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LOOKUP } from '@/data/Lookup'
import { Button } from '@/components/ui/button'
import { UserDetailContext } from '@/context/UserDetailContext'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import uuid4 from 'uuid4'
import { auth } from '@/configs/firebase'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth'

// @ts-expect-error - Props are passed from parent component without explicit typing
const LoginDialog = ({ openDialog, closeDialog }) => {
  const context = useContext(UserDetailContext)
  if (!context) throw new Error('UserDetailContext must be used within UserDetailProvider')
  
  const { setUserDetail } = context
  const CreateUser = useMutation(api.user.CreateUser)

  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        // Sign up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Update profile with name
        await updateProfile(user, {
          displayName: name
        })

        // Create user in Convex
        await CreateUser({
          name: name,
          email: user.email || '',
          picture: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
          uid: user.uid,
        })

        // Store in localStorage
        const userData = {
          name: name,
          email: user.email,
          picture: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(userData))
        }
        setUserDetail(userData)
      } else {
        // Sign in
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        const userData = {
          name: user.displayName || 'User',
          email: user.email,
          picture: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}`,
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(userData))
        }
        setUserDetail(userData)
      }
      closeDialog(false)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An error occurred during authentication')
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError('')
  }

  return (
    <Dialog open={openDialog} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription>
            <div className='flex flex-col justify-center items-center gap-2'>
              <h2 className='font-bold text-2xl text-white'>
                {isSignUp ? 'Create Account' : LOOKUP.SIGNIN_HEADING}
              </h2>
              <p className='mt-2 text-center'>
                {isSignUp ? 'Sign up to get started' : LOOKUP.SIGNIN_SUBHEADING}
              </p>
              
              <form onSubmit={handleAuth} className='w-full mt-4 space-y-3'>
                {isSignUp && (
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className='w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500'
                  />
                )}
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className='w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500'
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className='w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500'
                />
                
                {error && (
                  <p className='text-red-500 text-sm'>{error}</p>
                )}
                
                <Button 
                  type="submit" 
                  className='w-full bg-blue-500 hover:bg-blue-400'
                  disabled={loading}
                >
                  {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                </Button>
              </form>

              <button
                onClick={toggleMode}
                className='mt-2 text-sm text-blue-400 hover:underline'
              >
                {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
              </button>

              <p className='text-xs text-gray-400 mt-2'>{LOOKUP.SIGNIN_AGREEMENT_TEXT}</p>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default LoginDialog
