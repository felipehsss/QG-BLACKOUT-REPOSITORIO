import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div
      className="bg-white flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 "  style={{
        backgroundImage: "url('/imgs/backbright.png')",
        
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
      
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
         <div className="rounded-lg p-2">
            <img src="/logo/2.svg" alt="QG-BLACKOUT Logo" className="w-auto"/>
          </div>
        
        </a>
        <LoginForm />
      </div>
    </div>
  );
}
