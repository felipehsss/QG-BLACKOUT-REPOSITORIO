import { GalleryVerticalEnd } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div
      className="flex min-h-svh flex-col items-center justify-center  p-6 md:p-10"
      style={{
        backgroundImage: "url('/imgs/background2.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
        <div className="rounded-xl   backdrop-blur-lg">
      <div className="flex w-full max-w-sm flex-col ">
        <a href="#" className="grid justify-items-center gap-2 self-center font-medium text-white"> 
          <div className="rounded-lg p-2">
            <img src="/logo/1.svg" alt="QG-BLACKOUT Logo" className="w-auto"/>
          </div>
          
        </a>
        <LoginForm />
      </div>
      </div>
    </div>
  );
}
