import { auth } from "@/app/auth";
import GoogleButton from "@/components/layout/auth/GoogleButton";
import AskChat from "@/components/cy/profile/intro/42/AskChat";
import { Providers } from "@/components/cy/common/Providers";

export default async function Page() {
  const session = await auth();
  if (!session?.user?.email) return <GoogleButton />;

  return (
    <Providers>
      <AskChat
        myName={session.user.name ?? "나"}
        myImage={session.user.image ?? "/images/cy/common/noimage.jpg"}
      />
    </Providers>
  );
}