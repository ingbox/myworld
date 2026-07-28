'use client';

import { createFriend, deleteFriend } from "@/lib/services/cy/common/friends/action";
import { useRouter } from "next/navigation";

type FriendsProps = {
  userEmail: string;
  isFriend: boolean;
  isInCooldown: boolean;
};

export default function Friends({ userEmail, isFriend, isInCooldown }: FriendsProps) {
  const router = useRouter();

  const handleClick = async () => {
    const formData = new FormData();
    formData.set("user_email", userEmail);

    if (isFriend) {
      if (!window.confirm("일촌을 해제하시겠습니까?")) {
        return;
      }

      const response = await deleteFriend(formData);
      if (!response.success) {
        alert(response.message);
        return;
      }
    } else {
      if (isInCooldown) {
        alert("일촌 해제 후 24시간이 지나야 다시 신청할 수 있습니다.");
        return;
      }

      if (!window.confirm("일촌을 맺으시겠습니까?")) {
        return;
      }

      const response = await createFriend(formData);
      if (!response.success) {
        alert(response.message);
        return;
      }
    }

    router.refresh();
  };

  return (
    <button type="button" onClick={handleClick}>
      <span className="text-xs text-gray-600">{isFriend ? "일촌해제" : "일촌맺기"}</span>
    </button>
  );
}
