"use server";

import { redirect } from "next/navigation";

export const searchFriends = async (formData: FormData) => {
    const search = formData.get("search") as string;
    redirect(`/cy/profile/favor/friend?search=${encodeURIComponent(search)}`);
}