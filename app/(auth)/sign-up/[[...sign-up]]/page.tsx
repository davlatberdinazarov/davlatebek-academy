import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.45)] md:p-6">
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          forceRedirectUrl="/dashboard"
        />
      </div>
    </main>
  );
}
