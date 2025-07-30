// profile/page.tsx

"use client";
import {isAuthenticated} from '@/Utils/Auth';
import { redirect } from 'next/navigation';
import { useLayoutEffect } from 'react';


const Profile = () => {

    useLayoutEffect(() => {
      const isAuth = isAuthenticated;
      if(!isAuth){
        redirect("/")
      }
    }, [])

  return (
    <main className="text-center h-screen flex justify-center items-center">
      <div>
        <h1>Profile</h1>        
      </div>
    </main>
  );
};


export default Profile;
