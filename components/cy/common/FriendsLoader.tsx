import { auth } from "@/app/auth";
import { getFriendStatus } from "@/lib/services/cy/common/friends/service";
import Friends from "./Friends";

export default async function FriendsLoader() {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  const { isFriend, isInCooldown } = await getFriendStatus(session.user.email);

  return (
    <Friends
      userEmail={session.user.email}
      isFriend={isFriend}
      isInCooldown={isInCooldown}
    />
  );
}
