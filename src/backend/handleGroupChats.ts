import toast from "react-hot-toast";
import { supabase } from "../supabaseClient";
import { v4 as uuidv4 } from "uuid";

export const getGroupChats = async (groupId: string | undefined) => {
    if (!groupId) return;
    const { data, error } = await supabase
        .from("groupmessages")
        .select("*")
        .eq("groupid", groupId)
    if (error) {
        throw error;
    }

    return data;
};

export const sendGroupChat = async (groupId: string | undefined, message: string, isImg = false) => {
    const currUser = (await supabase.auth.getUser()).data;
    if (!currUser.user) {
        throw new Error("currUser is undefined");
    }
    if (!groupId) {
        throw new Error("groupId is undefined");
    }
    const { data: isPresent, error: groupError } = await supabase
        .from("groupmembers")
        .select("*")
        .match({ groupid: groupId, userid: currUser.user.id });
    if (groupError) throw groupError;
    if (isPresent.length === 0) {
        toast.error("You are not a member of this group");
        return;
    }
    const { data, error } = await supabase
        .from("groupmessages")
        .insert(
            {
                sender: currUser.user.id,
                groupid: groupId,
                sendername: currUser.user.user_metadata.fullName,
                message: message,
                isImg
            }
        );

    if (error) {
        throw error;
    }

    return data;
};

export const deleteGroupMsg = async (groupId: string | undefined, chatid: string, msg: string, isImg: boolean) => {
    if (!groupId) return;
    if (isImg) {
        const { error } = await supabase
            .storage
            .from("groupmedia")
            .remove([msg]);
        if (error) {
            return toast.error("Error deleting message");
        }
    }
    const { data, error } = await supabase
        .from("groupmessages")
        .delete()
        .match({ id: chatid, groupid: groupId });

    if (error) {
        throw error;
    }

    return data;
}

export const sendGroupMedia = async (groupId: string | undefined, fileList: FileList | null) => {
    const senderId = (await supabase.auth.getUser()).data.user?.id;
    const file = fileList?.item(0);
    if (!file) return;
    if (!senderId) return;
    if (!groupId) return;
    if (file === null) return;
    const { data, error } = await supabase
        .storage
        .from("groupmedia")
        .upload(`/${groupId}/${senderId}/${uuidv4()}`, file);
    if (error) {
        toast.error("Error sending media");
        return null;
    }
    if (data.path === null) return null;
    await sendGroupChat(groupId, data.path, true);
}

export const getGroupMedia = (path: string) => {
    const { data } = supabase.storage.from("groupmedia").getPublicUrl(path);
    return data.publicUrl;
}

export const checkIfGroupMember = async (groupId: string | undefined) => {
    const currUser = (await supabase.auth.getUser()).data;
    if (!currUser.user) return;
    const { data: isPresent, error: groupError } = await supabase
        .from("groupmembers")
        .select("*")
        .match({ groupid: groupId, userid: currUser.user.id });
    if (groupError) throw groupError;
    console.log(isPresent);
    if (isPresent.length === 0) return false;
    console.log(isPresent);
    return true;
}