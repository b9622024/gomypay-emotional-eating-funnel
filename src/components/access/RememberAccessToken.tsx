"use client";
import { useEffect } from "react";
export default function RememberAccessToken({accessToken}:{accessToken:string}){useEffect(()=>{try{localStorage.setItem("emotionalEatingAccessToken",accessToken)}catch{}},[accessToken]);return null}
