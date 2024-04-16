import { supabase } from "../supabaseClient";
import { getUserSession } from "./handleUser";

export const getChats = async (otherUserId: string | undefined) => {
    const currentUser = await getUserSession();
    if (!currentUser) return;
    const { data: chats, error } = await supabase
        .from("chats")
        .select("*")
    if (error) {
        return;
    }

    const filteredChats = chats.filter((chat) => {
        return (
            (chat.id === currentUser.user.id && chat.receiverid === otherUserId) ||
            (chat.id === otherUserId && chat.receiverid === currentUser.user.id)
        );
    }
    );

    return filteredChats;
};