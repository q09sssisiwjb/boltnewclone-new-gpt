"use client"
import React, { useContext, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { UserDetailContext } from '@/context/UserDetailContext'

interface AutoLoginPopupProps {
  openDialog: boolean;
  onContinue: () => void;
}

const AutoLoginPopup = ({ openDialog, onContinue }: AutoLoginPopupProps) => {
  const context = useContext(UserDetailContext)
  if (!context) throw new Error('UserDetailContext must be used within UserDetailProvider')

  const [loading, setLoading] = useState(false)

  const handleContinue = async () => {
    setLoading(true)
    await onContinue()
    setLoading(false)
  }

  return (
    <Dialog open={openDialog} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className='font-bold text-3xl text-white text-center'>
            Welcome!
          </DialogTitle>
          <DialogDescription className='text-center text-gray-300'>
            Click continue to start building amazing web apps instantly
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col justify-center items-center gap-4 py-4'>
          <Button 
            onClick={handleContinue}
            className='w-full bg-[#2ba6ff] hover:bg-[#2196e8] text-white'
            disabled={loading}
          >
            {loading ? 'Creating your account...' : 'Continue'}
          </Button>

          <span className='text-xs text-gray-400 text-center'>
            By continuing, a temporary account will be created for you automatically
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AutoLoginPopup
