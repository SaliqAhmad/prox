import toast from "react-hot-toast";
import { supabase } from "../supabaseClient";

export const createGroup = async (name: string) => {
    const creatorId = (await supabase.auth.getUser()).data.user?.id;
    if (!creatorId) {
        toast.error("You need to be logged in to create a group");
        return;
    }
    const { data: userGroups, error: userGroupsError } = await supabase
        .from("groups")
        .select("*")
        .eq("groupadmin", creatorId);
    if (userGroupsError) {
        toast.error(userGroupsError.message);
        return;
    }
    if (userGroups?.length) {
        toast.error("You already have a group");
        return;
    }
    const { error } = await supabase
        .from("groups")
        .insert([{ groupadmin: creatorId, groupname: name }]);
    if (error) {
        toast.error(error.message);
        return;
    }
    const { data } = await supabase
        .from("groups")
        .select("*")
        .eq("groupadmin", creatorId)

    if (data) joinGroup(data[0].id)
};

export const getAllGroups = async () => {
    const { data, error } = await supabase.from("groups").select("*");
    if (error) {
        toast.error(error.message);
        return;
    }
    return data;
}

export const delGroup = async (groupId: string) => {
    if (!groupId) return;
    const groupadmin = (await supabase.auth.getUser()).data.user?.id;
    if (!groupadmin) {
        toast.error("You need to be logged in to delete a group");
        return;
    }
    const { error } = await supabase
        .from("groups")
        .delete()
        .eq("groupadmin", groupadmin)
        .eq("id", groupId);
    if (error) {
        toast.error(error.message);
        return;
    }
    return;
}

export const joinGroup = async (groupId: string) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
        toast.error("You need to be logged in to join a group");
        return;
    }
    const { data: userGroups, error: userGroupsError } = await supabase
        .from("groupmembers")
        .select("*")
        .match({ userid: userId, groupid: groupId });
    if (userGroups?.length) {
        toast.error("You are already in this group");
        return;
    }
    if (userGroupsError) {
        toast.error(userGroupsError.message);
        return;
    }
    const { data, error } = await supabase
        .from("groupmembers")
        .insert([{ groupid: groupId, userid: userId }]);
    if (error) {
        toast.error(error.message);
        return;
    }
    toast.success("You have joined the group");
    return data;
}

export const leaveGroup = async (groupId: string | undefined) => {
    if (!groupId) return;
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
        toast.error("You need to be logged in to leave a group");
        return;
    }
    const { error } = await supabase
        .from("groupmembers")
        .delete()
        .match({ userid: userId, groupid: groupId });
    if (error) {
        toast.error(error.message);
        return;
    }
    toast.success("You have left the group");
    return;
}