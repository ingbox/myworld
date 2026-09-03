export type FriendStatus = {
  isFriend: boolean;
  isInCooldown: boolean;
};

export type FriendActionResult = {
  success: boolean;
  message?: string;
};
