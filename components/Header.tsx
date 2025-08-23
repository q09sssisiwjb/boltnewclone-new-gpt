"use client"
import { Button } from '@/components/ui/button'
import { UserDetailContext } from '@/context/UserDetailContext'
import Image from 'next/image'
import React, { useContext, useState } from 'react'
import LoginDialog from './LoginDialog';
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

const Header = () => {
  const context = useContext(UserDetailContext)
  if (!context) throw new Error('UserDetailContext must be used within UserDetailProvider')
  
  const { userDetail } = context
  const [openDialog, setOpenDialog] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const router = useRouter();

  const handleOpenDialog = () => {
    setOpenDialog(true)
  }

  const handleCloseDialog = (isOpen: boolean) => {
    setOpenDialog(isOpen)
  }

  const handleLogout = () => {
    if(typeof window !== 'undefined'){
      localStorage.removeItem('user')
    }
    setShowDropdown(false)
    router.push('/')
  }

  return (
    <div className='p-4 flex items-center justify-between'>
      <a href='/'>
        <Image src={"https://bolt.new/static/favicon.svg"} alt='Logo' width={50} height={50} />
      </a>
      {!userDetail?.name && (
        <div className='flex gap-5'>
          <Button variant={'ghost'} onClick={handleOpenDialog}>Sign in</Button>
          <Button className='bg-[#2ba6ff] text-white' onClick={handleOpenDialog}>Get started</Button>
        </div>
      )}
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
              <div className='absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg py-1 z-50'>
                <button
                  onClick={handleLogout}
                  className='flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                >
                  <LogOut className='w-4 h-4 mr-2' />
                  <p>Logout</p>
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