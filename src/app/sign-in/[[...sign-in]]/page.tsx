import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12">
      <SignIn
        appearance={{
          variables: { colorPrimary: "#6366f1", borderRadius: "0.5rem" },
          elements: {
            card: "bg-card shadow-xl border border-white/10",
            headerTitle: "text-foreground",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton: "border-white/10",
            formButtonPrimary: "bg-[#6366f1] hover:bg-[#4f51d4]",
            footerActionLink: "text-[#a5b4fc]",
          },
        }}
      />
    </div>
  );
}
