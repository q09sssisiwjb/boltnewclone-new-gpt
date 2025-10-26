'use client';

import { MessageContext } from "@/providers/MessageContext";
import { UserDetailContext } from "@/context/UserDetailContext";
import { LOOKUP } from "@/data/Lookup";
import { ArrowRight, Link } from "lucide-react";
import React, { useState, useContext, useEffect } from "react";
import LoginDialog from "./LoginDialog";
import AutoLoginPopup from "./AutoLoginPopup";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { generateRandomCredentials, generateRandomAvatar } from "@/lib/autoLogin";
import { auth } from '@/configs/firebase'
import { signInAnonymously } from 'firebase/auth'

export const Hero = () => {
  const [userInput, setUserInput] = useState<string>('');
  const messageContext = useContext(MessageContext);
  const userDetailContext = useContext(UserDetailContext);

  if (!messageContext || !userDetailContext) {
    throw new Error('MessageContext or UserDetailContext is not defined');
  }

  const { messages, setMessages } = messageContext;
  const { userDetail, setUserDetail } = userDetailContext;
  const [openDialog, setOpenDialog] = useState(false);
  const [showAutoLogin, setShowAutoLogin] = useState(false);
  const CreateUser = useMutation(api.user.CreateUser);
  const Createworkspace = useMutation(api.workspace.CreateWorkSpace);
  const getUserData = useQuery(api.user.GetUser,
    userDetail?.email ? { email: userDetail.email } : "skip"
  );
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasVisited = localStorage.getItem('hasVisited');
      const user = localStorage.getItem('user');
      
      if (!hasVisited && !user) {
        setShowAutoLogin(true);
      }
    }
  }, []);

  const handleAutoLogin = async () => {
    try {
      const { username, email } = generateRandomCredentials();
      const avatarUrl = generateRandomAvatar(username);
      
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      const convexUserId = await CreateUser({
        name: username,
        email: email,
        picture: avatarUrl,
        uid: user.uid,
      });

      if (!convexUserId) {
        throw new Error("Failed to create user in database");
      }

      const userData = {
        name: username,
        email: email,
        pic: avatarUrl,
        uid: user.uid,
        _id: convexUserId,
        _creationTime: Date.now(),
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('hasVisited', 'true');
      }
      
      setUserDetail(userData as any);
      setShowAutoLogin(false);
    } catch (error) {
      console.error("Error creating auto-login account:", error);
      alert("Failed to create account. Please try again.");
    }
  };

  const onGenerate = async (input: string) => {
    if (!userDetail?.name) {
      setOpenDialog(true);
      return;
    }
    const message = {
      role: 'user',
      content: input,
    }
    setMessages([...messages, message]);
    try {
      if (!getUserData?._id) {
        console.error("User not found in database");
        return;
      }
      const workspaceId = await Createworkspace({
        user: getUserData._id,
        message: [message],
      });
      if (workspaceId) {
        router.push('/workspace/' + workspaceId);
      }
    } catch (error) {
      console.error("Error creating workspace:", error);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center mt-36 xl:mt-45 gap-2">
      <h2 className="font-bold text-4xl">{LOOKUP.HERO_HEADING}</h2>
      <p className="text-gray-400 font-medium">{LOOKUP.HERO_DESC}</p>

      <div className="p-5 border rounded-xl max-w-xl w-full mt-3 bg-[#151515]">
        <div className="flex gap-2 ">
          <textarea
            placeholder={LOOKUP.INPUT_PLACEHOLDER}
            className="outline-none bg-transparent w-full h-24 max-h-56 resize-none"
            onChange={(e) => setUserInput(e.target.value)}
            value={userInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onGenerate(userInput);
              }
            }}
          />
          {userInput && (
            <ArrowRight
              onClick={() => onGenerate(userInput)}
              onKeyDown={(e) => e.key === 'Enter' && onGenerate(userInput)}
              tabIndex={0}
              className="bg-blue-500 p-2 h-10 w-10 rounded-md cursor-pointer hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            />
          )}
        </div>
        <div>
          <Link className="h-5 w-5" />
        </div>
      </div>
      <div className="flex flex-wrap max-w-2xl items-center justify-center gap-3 mt-5">
        {LOOKUP.SUGGESTIONS.map((suggstion, index) => (
          <h2
            key={index}
            onClick={() => onGenerate(suggstion)}
            className="p-1 px-2 border rounded-full text-sm text-gray-400 hover:text-white cursor-pointer"
          >
            {suggstion}
          </h2>
        ))}
      </div>
      <LoginDialog openDialog={openDialog} closeDialog={(v: boolean) => setOpenDialog(v)} />
      <AutoLoginPopup openDialog={showAutoLogin} onContinue={handleAutoLogin} />
    </div>
  )



}
