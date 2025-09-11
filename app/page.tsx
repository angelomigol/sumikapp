import Image from "next/image";

import authConfig from "@/config/auth.config";
import pathsConfig from "@/config/paths.config";

import { SignInMethodsContainer } from "@/components/auth/sign-in-methods-container";

const paths = {
  callback: pathsConfig.auth.callback,
  dashboard: pathsConfig.app.dashboard,
};

export default function IndexPage() {
  return (
    <div className="relative h-screen max-h-screen overflow-hidden bg-[#343f83]">
      {/* BACKGROUND IMAGE */}
      <Image
        src="/bg.png"
        alt="Background"
        fill
        priority
        className="absolute inset-0 hidden bg-no-repeat md:block"
      />
      {/* BACKGROUND SHADOW EFFECTS */}
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          background:
            "linear-gradient(180deg, rgba(52, 62, 130, 0.00) 50%, #000 100%)",
        }}
      />

      <div className="relative mx-auto flex h-full max-w-4xl items-center justify-center bg-[#343f83]/20">
        {/* MAIN COMPONENT */}
        <div className="relative w-full rounded-md max-w-md space-y-6 bg-[#343f83] p-6 md:space-y-8 md:p-7">
          <div className="flex flex-col items-center justify-center gap-3.5 text-center md:flex-row md:text-left">
            <Image
              width={48}
              height={48}
              src="/nu_logo.png"
              alt="NU Logo"
              priority
            />
            <div className="md:hidden">
              <p className="text-xl font-semibold text-white">
                Welcome to <span className="text-secondary">SumikAPP!</span>
              </p>
              <p className="text-sm text-white/80">
                Enter your credentials to start.
              </p>
            </div>
            <p className="hidden text-lg font-semibold text-white md:block">
              SumikAPP: On-The-Job Training
              <br /> Management and Placement System
            </p>
          </div>

          <SignInMethodsContainer
            paths={paths}
            providers={authConfig.providers}
          />
        </div>
      </div>
    </div>
  );
}
