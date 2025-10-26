"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { MessageContext } from "@/providers/MessageContext";
import { UserDetailContext } from "@/context/UserDetailContext";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { auth } from "@/configs/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface UserDetail {
  _id: string;
  _creationTime: number;
  name: string;
  email: string;
  pic: string;
  uid: string;
}

interface Message {
  role: string;
  content: string;
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {

  const [messages, setMessages] = React.useState<Message[]>([]);
  const [userDetail, setUserDetail] = React.useState<UserDetail | null>(null);
  const convex = useConvex();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await IsAuthenticated();
      } else {
        setUserDetail(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const IsAuthenticated = async () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user.email) {
            const result = await convex.query(api.user.GetUser, {
              email: user.email
            });
            if (result) {
              setUserDetail(result);
            }
          }
        } catch (error) {
          console.error('Failed to parse user from localStorage:', error);
          localStorage.removeItem('user');
        }
      }
    }
  };

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      <MessageContext.Provider value={{ messages, setMessages }}>
        <NextThemesProvider {...props}>
          {children}
        </NextThemesProvider>
      </MessageContext.Provider>
    </UserDetailContext.Provider>
  );
}
