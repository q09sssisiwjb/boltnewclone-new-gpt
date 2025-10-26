"use client"
import { UserDetailContext } from '@/context/UserDetailContext'
import Image from 'next/image'
import React, { useContext, useState } from 'react'
import LoginDialog from './LoginDialog';
import { LogOut, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/configs/firebase'
import { deleteUser } from 'firebase/auth'

const Header = () => {
  const context = useContext(UserDetailContext)
  if (!context) throw new Error('UserDetailContext must be used within UserDetailProvider')
  
  const { userDetail, setUserDetail } = context
  const [openDialog, setOpenDialog] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter();

  const handleOpenDialog = () => {
    setOpenDialog(true)
  }

  const handleCloseDialog = (isOpen: boolean) => {
    setOpenDialog(isOpen)
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      
      if(typeof window !== 'undefined'){
        localStorage.removeItem('user')
        localStorage.removeItem('hasVisited')
      }
      setUserDetail(null)
      setShowDropdown(false)
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    try {
      setIsDeleting(true)
      
      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error('No authenticated user found')
      }

      await deleteUser(currentUser)

      if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
        localStorage.removeItem('hasVisited')
      }

      setUserDetail(null)
      setShowDropdown(false)
      router.push('/')
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className='p-4 flex items-center justify-between'>
      <Link href='/'>
        <Image src={"https://bolt.new/static/favicon.svg"} alt='Logo' width={50} height={50} />
      </Link>
      {
        userDetail?.name && (
          <div className='relative'>
            <Image
              src={userDetail?.pic}
              alt='User'
              width={35}
              height={35}
              className='rounded-full cursor-pointer'
              onClick={() => setShowDropdown(!showDropdown)}
            />
            {showDropdown && (
              <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50'>
                <button
                  onClick={handleLogout}
                  className='flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                >
                  <LogOut className='w-4 h-4 mr-2' />
                  <p>Logout</p>
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className='flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50'
                >
                  <Trash2 className='w-4 h-4 mr-2' />
                  <p>{isDeleting ? 'Deleting...' : 'Delete Account'}</p>
                </button>
              </div>
            )}
          </div>
        )
      }
      <LoginDialog openDialog={openDialog} closeDialog={handleCloseDialog} />
    </div>
  )
}

export default Header