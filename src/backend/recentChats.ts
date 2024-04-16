import toast from "react-hot-toast";
import { supabase } from "../supabaseClient";

// get users from recent chats table
export const getRecentChats = async () => {
    const currUser = (await supabase.auth.getUser()).data.user?.id;
    if (!currUser) return;
    const { data, error } = await supabase
        .from("Recent_chats")
        .select(`*, users!Recent_chats_chat_to_fkey(*)`)
        .eq("chat_from", currUser)

    if (error) {
        toast.error(error.message);
        return;
    }
    return data;
};