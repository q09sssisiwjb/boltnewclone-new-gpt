'use client';

import { MessageContext } from "@/providers/MessageContext";
import { UserDetailContext } from "@/context/UserDetailContext";
import { LOOKUP } from "@/data/Lookup";
import { ArrowRight, Sparkles, UserCircle2, Loader2 } from "lucide-react";
import React, { useState, useContext, useEffect } from "react";
import LoginDialog from "./LoginDialog";
import AutoLoginPopup from "./AutoLoginPopup";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { generateRandomCredentials, generateRandomAvatar } from "@/lib/autoLogin";
import { auth } from '@/configs/firebase'
import { signInAnonymously } from 'firebase/auth'
import Image from 'next/image'

const templates = [
  {
    title: "Netflix Clone",
    description: "A video streaming app interface.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCE8Veu6e7xV2eFJHs5k3nRG3p09GjNK_tvy8o8oD4D9JtmZt0lpMYe0bA7y6aWtzFiui-JaVOASs2LWjwfVZvmIRVxYNe3kBUXTFuFKddBsoLB6WClfJS0FWW2js7cjAm4dNrou4OMkHOiDZXqEaeikjsm8BuxoqDSGf5OTaqV7av1CW0IJxIpwFSYCjCtu2QrVngDD45i2mu-QBZhgeLGiNmR-wGZynmMrz92Nqg-6pFHV4w60bH9TfZMKCrKQ2AUzuzDfkf10ozD",
    prompt: "Create Netflix Clone"
  },
  {
    title: "YouTube Clone",
    description: "A video feed and playback interface.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCo8fKCYB7in5YSEOzYusRRBVGzFtXAIOu57a-Q7IoEgMuK2T6lggncL1XY-sb03EHdYHOdxAp4gTEBuoXJ3UKLrBFnYG1naTAux6PBREAp9Jy56vKvzEGgBc-uvwck4sXZPRGh_2s3cblwMywFfxd9PK6Yc97eEhqdL0UMEYFXqJpbklfR1H5p_krywoerDtIxtBxezno5WgOVGvTmDgXIMrXWMYVzIWXkVypzKqtMNfWh6-a0JWEOjoY51yCowwtg0aG-MiaqsGmZ",
    prompt: "Create YouTube Clone"
  },
  {
    title: "Airbnb Clone",
    description: "Property listings with an integrated map.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1ISsqh5560r8haEoeithwgL_IMeUywVoKnydHQY_r4LxUR8RbumG6nJTnDoLUGVcK2zb5tR7i2lmwE9zUoPrWWIykZzCKEUKlvtqYDfFA_wsL9rTnf0obhFtS4Xjws_hGwa33IYwsZ592Uz5bjlVlHNOR7dwjNxfj8xkH4B5E4wYaUSu9cWZkAuw5uPaDQjfOoCdgyLTSS9HWLER9dpk05EeuO94gjpMQNEjfVH5fdTNOd8cz_Zf3FsvSo9Rm43j1k7lwbTOgoww8",
    prompt: "Create Airbnb Clone"
  },
  {
    title: "Kanban Board",
    description: "A task management board with columns.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCoJyOhFYqylWDry0zxORP4UZL-o5ovNh2iDKih3CQAizmYnRoB-rt1fXwuP5DLdZ_aEMkasiwJmrh4d8IkAVOt5ALUdEv_934MruzE7lqVoqo7fe3tADbijXAQ0vBNEppftDk5b1f2Hnewq1CDYXyj3DQvykz-nP9JPXhWtN7pvfBAmtn60fnsK3tvCQo2DoZV_tEWdO86C6smrAiprFfqpwgUaCqcpkhkTIcIwIGsyGTqKcAmMZBs0ya3FrP0G1yOFeRutblrAARC",
    prompt: "Create Kanban Board"
  }
];

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
  const [showDropdown, setShowDropdown] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const CreateUser = useMutation(api.user.CreateUser);
  const Createworkspace = useMutation(api.workspace.CreateWorkSpace);
  const getUserData = useQuery(api.user.GetUser,
    userDetail?.email ? { email: userDetail.email } : "skip"
  );
  const router = useRouter();

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

  const handleInputChange = (value: string) => {
    setUserInput(value);
    
    if (value.trim() && !userDetail?.name) {
      setShowAutoLogin(true);
    }
  };

  const onGenerate = async (input: string) => {
    if (!userDetail?.name) {
      setShowAutoLogin(true);
      return;
    }
    
    if (!input.trim()) {
      return;
    }
    
    setIsGenerating(true);
    const message = {
      role: 'user',
      content: input,
    }
    setMessages([...messages, message]);
    try {
      if (!getUserData?._id) {
        console.error("User not found in database");
        setIsGenerating(false);
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
      setIsGenerating(false);
    }
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

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <div className="flex items-center p-4 pb-2 justify-between">
        <div className="text-white flex size-12 shrink-0 items-center cursor-pointer" onClick={() => router.push('/')}>
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="flex w-12 items-center justify-end">
          {userDetail?.name ? (
            <div className="relative">
              <Image
                src={userDetail.pic}
                alt="User"
                width={40}
                height={40}
                className="rounded-full cursor-pointer"
                onClick={() => setShowDropdown(!showDropdown)}
              />
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1a2632] rounded-lg shadow-lg py-2 z-50 border border-gray-700">
                  <div className="px-4 py-2 border-b border-gray-700">
                    <p className="text-sm text-white font-medium">{userDetail.name}</p>
                    <p className="text-xs text-gray-400">{userDetail.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#0d7ff2] hover:text-white transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-transparent text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0">
              <UserCircle2 className="w-8 h-8" />
            </button>
          )}
        </div>
      </div>

      <h1 className="text-white tracking-tight text-[32px] font-bold leading-tight px-4 text-left pb-3 pt-6">
        Build anything, instantly.
      </h1>

      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <textarea
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border-none bg-[#1a2632] focus:border-none min-h-36 placeholder:text-[#9cabba] p-4 text-base font-normal leading-normal"
            placeholder="Describe the app you want to build..."
            value={userInput}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onGenerate(userInput);
              }
            }}
          />
        </label>
      </div>

      <div className="flex px-4 py-3 justify-center">
        <button 
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 flex-1 bg-[#0d7ff2] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#0c6fd9] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          onClick={() => onGenerate(userInput)}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="truncate">Generating...</span>
            </>
          ) : (
            <span className="truncate">Generate</span>
          )}
        </button>
      </div>

      <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Start with a Template
      </h2>

      <div className="flex overflow-x-auto snap-x snap-mandatory space-x-4 px-4 py-3 no-scrollbar">
        {templates.map((template, index) => (
          <div key={index} className="flex-shrink-0 w-[80%] snap-center cursor-pointer" onClick={() => onGenerate(template.prompt)}>
            <div className="bg-[#1a2632] rounded-xl overflow-hidden hover:bg-[#1f2d3d] transition-colors">
              <img 
                className="h-40 w-full object-cover" 
                src={template.image} 
                alt={template.title}
              />
              <div className="p-4">
                <h3 className="font-bold text-lg text-white">{template.title}</h3>
                <p className="text-sm text-gray-400">{template.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-5"></div>

      <LoginDialog openDialog={openDialog} closeDialog={(v: boolean) => setOpenDialog(v)} />
      <AutoLoginPopup openDialog={showAutoLogin} onContinue={handleAutoLogin} />
    </div>
  );
}
