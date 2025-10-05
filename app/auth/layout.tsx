import React from "react";
import Image from "next/image";

export default function AuthLayout({ children }: React.PropsWithChildren) {
  return (
    <div className="relative h-screen max-h-screen overflow-hidden bg-[#343f83]">
      <Image
        src="/bg.png"
        alt="Background"
        fill
        priority
        className="absolute inset-0 hidden bg-no-repeat md:block"
      />
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          background:
            "linear-gradient(180deg, rgba(52, 62, 130, 0.00) 50%, #000 100%)",
        }}
      />

      <div className="relative mx-auto flex h-full max-w-4xl items-center justify-center bg-[#343f83]/20">
        <div className="relative w-full max-w-md space-y-6 rounded-md bg-[#343f83] p-6 md:space-y-8 md:p-7">
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

          {children}
        </div>
      </div>
    </div>
  );
}
