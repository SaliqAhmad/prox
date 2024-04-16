import toast from "react-hot-toast";
import { supabase } from "../supabaseClient";
import { v4 as uuidv4 } from "uuid";

export const sendMsgs = async (receiverId: string | undefined, msg: string, isImg = false) => {
    const senderId = (await supabase.auth.getUser()).data.user?.id;
    if (!senderId) return;
    if (!receiverId) return;
    if (msg === "") return;
    const { error } = await supabase
        .from("chats")
        .insert({
            id: senderId,
            receiverid: receiverId,
            message: msg,
            isImg: isImg,
        });
    if (error) {
        toast.error("Error sending message");
    }
    const { data } = await supabase
        .from("Recent_chats")
        .select("*")
        .match({ chat_from: senderId, chat_to: receiverId });

    if (data?.length === 0) {
        const { error: error1 } = await supabase
            .from("Recent_chats")
            .insert({
                chat_from: senderId,
                chat_to: receiverId,
            });
        if (error1) {
            toast.error("Error sending message");
        }
        return;
    }
};

export const delMsgs = async (msgId: string, msg: string, isImg: boolean) => {
    const currUserId = (await supabase.auth.getUser()).data.user?.id;
    if (!currUserId) return;
    if (isImg) {
        const { error } = await supabase
            .storage
            .from("media")
            .remove([msg]);
        if (error) {
            return toast.error("Error deleting message");
        }
    }
    const { error } = await supabase
        .from("chats")
        .delete()
        .match({ id: currUserId, msgid: msgId });
    if (error) {
        return toast.error("Error deleting message");
    }
}

export const sendMedia = async (receiverId: string | undefined, fileList: FileList | null) => {
    const senderId = (await supabase.auth.getUser()).data.user?.id;
    const file = fileList?.item(0);
    if (!file) return;
    if (!senderId) return;
    if (file === null) return;
    const { data, error } = await supabase
        .storage
        .from("media")
        .upload(`/${senderId}/${receiverId}/${uuidv4()}`, file);
    if (error) {
        toast.error("Error sending media");
        return null;
    }
    if (data.path === null) return null;
    await sendMsgs(receiverId, data.path, true);
}

export const getMedia = (path: string) => {
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    return data.publicUrl;
}