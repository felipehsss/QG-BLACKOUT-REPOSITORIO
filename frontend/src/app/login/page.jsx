import { GalleryVerticalEnd } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div
      className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10"
      style={{
        backgroundImage: "url('/imgs/imageFundo.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
        <div className="rounded-xl bg-black/75 p-8 backdrop-blur-lg">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="grid justify-items-center gap-2 self-center font-medium text-white"> 
          <div className="rounded-lg bg-white p-2">
            <img src="/logo/1.svg" alt="QG-BLACKOUT Logo" className="size-18"/>
          </div>
          AUTO PEÇAS
        </a>
        <LoginForm />
      </div>
      </div>
    </div>
  );
}
