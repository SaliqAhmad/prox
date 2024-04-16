import { useMutation, useQuery, useQueryClient } from "react-query";
import { getUserSession } from "../backend/handleUser";
import { IconPhoto, IconSend } from "@tabler/icons-react";
import { createGroup, delGroup, getAllGroups, joinGroup, leaveGroup } from "../backend/handlegroup";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { Database } from "../lib/database.types";
import { UnauthorizaError } from "./UnauthorizaError";
import { TopBar } from "../components/TopBar";
import { Loading } from "../components/Loading";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { checkIfGroupMember, deleteGroupMsg, getGroupChats, getGroupMedia, sendGroupChat, sendGroupMedia } from "@/backend/handleGroupChats";
import { Edit, Trash } from "lucide-react";

type MediaProps = {
    path: string;
}
const Media = (path: MediaProps) => {
    const queryClient = useQueryClient();
    const { data: media, isLoading, isSuccess } = useQuery({
        queryFn: async () => getGroupMedia(path.path),
        queryKey: [`img-${path.path}`],
    })
    useEffect(() => {
        if (isSuccess) {
            queryClient.invalidateQueries(["groupChats"]);
        }
    }, [isSuccess, queryClient, path.path]);

    if (isLoading) {
        return <span className="loading loading-dots loading-md"></span>
    }

    return <img src={media} className="w-[650px] rounded-xl" alt="..." />
}


type Group = Database["public"]["Tables"]["groups"]["Row"];

export const Groupchat = () => {
    const [groupname, setGroupname] = useState<string>("");
    const [group, setGroup] = useState<Group>();
    const [msg, setMsg] = useState<string>("");

    const queryClient = useQueryClient();

    const { data: userSession } = useQuery({
        queryFn: getUserSession,
        queryKey: ["userSession"],
    });

    const { data: groups, isLoading, isSuccess: getgrps } = useQuery({
        queryFn: () => getAllGroups(),
        queryKey: ["getGroups"],
        onSuccess: () => {
            queryClient.invalidateQueries("checkIfGroupMember");
        }
    })

    const { data: chats, isLoading: chatsLoading } = useQuery({
        queryFn: async () => getGroupChats(group?.id),
        queryKey: ["groupChats", group?.id],
    })

    const { mutate: creategroup, isSuccess } = useMutation({
        mutationKey: "creategroup",
        mutationFn: () => createGroup(groupname),
    })
    const { mutate: joingroup, isSuccess: joinSuccess } = useMutation({
        mutationKey: "joingroup",
        mutationFn: async (id: string) => joinGroup(id),
    })
    type Chat = Database["public"]["Tables"]["groupmessages"]["Row"];

    const { mutate: delMsg, isSuccess: delMsgSuccess } = useMutation({
        mutationFn: (chat: Chat) => deleteGroupMsg(chat.groupid, chat.id, chat.message, chat.isImg),
        mutationKey: ["deleteGroupChat"],
    })
    const { mutate, isSuccess: msgSuccess } = useMutation({
        mutationFn: (msg: string) => sendGroupChat(group?.id, msg),
        mutationKey: ["sendGroupMsgs"],
    })

    const { mutate: sendGrpPhoto, isSuccess: sendMedia } = useMutation({
        mutationFn: (img: FileList | null) => sendGroupMedia(group?.id, img),
        mutationKey: ["sendGroupMedia"],
    })
    const { mutate: delgroup, isSuccess: delgrp } = useMutation({
        mutationKey: "deletegroup",
        mutationFn: async (groupId: string) => delGroup(groupId),
    })

    const { mutate: leavegroup, isSuccess: leaveSuccess } = useMutation({
        mutationKey: "leavegroup",
        mutationFn: async (groupId: string) => leaveGroup(groupId),
    })
    const { isSuccess: checkGrpMember } = useQuery({
        queryKey: ["checkIfgroupMemeber", group?.id],
        queryFn: async () => checkIfGroupMember(group?.id),
    })

    useEffect(() => {
        if (isSuccess) {
            queryClient.invalidateQueries("getGroups");
            setGroupname("");
        }
        if (joinSuccess) {
            queryClient.invalidateQueries("checkIfgroupMemeber");
            queryClient.invalidateQueries("getGroups");
            queryClient.invalidateQueries("groupChats");
        }
        if (delMsgSuccess) {
            queryClient.invalidateQueries("groupChats");
        }
        if (msgSuccess) {
            queryClient.invalidateQueries("groupChats");
            setMsg("");
        }
        if (delgrp) {
            queryClient.invalidateQueries("getGroups");
        }
        if (sendMedia) {
            queryClient.invalidateQueries("groupChats");
        }
        if (leaveSuccess) {
            queryClient.invalidateQueries("getGroups");
            queryClient.invalidateQueries("groupChats");
        }
        if (checkGrpMember) {
            queryClient.invalidateQueries("getGroups");
        }
    }, [isSuccess, queryClient, joinSuccess, delMsgSuccess, msgSuccess, sendMedia, delgrp, leaveSuccess, checkGrpMember]);

    if (isLoading) {
        return <Loading />
    }

    if (!userSession) {
        return <UnauthorizaError />
    }
    return (
        <>
            <Toaster />
            <TopBar />
            <div className="grid h-screen justify-center content-center">
                <ScrollArea className="h-80 w-96 rounded-lg border">
                    <div className="p-4">
                        <h4 className="mb-4 text-center text-primary-foreground text-sm font-medium leading-none">MY GROUP</h4>
                        {getgrps && groups?.map((group) => (
                            <>
                                <div key={group.id} className="text-lg flex justify-between">
                                    <div className="text-primary-foreground">{group.groupname}</div>
                                    <div className="flex gap-3">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" onClick={() => setGroup(group)}>View</Button>
                                            </DialogTrigger>
                                            {group.groupadmin !== userSession.user.id && (
                                                <Button variant="outline" onClick={() => leavegroup(group.id)}>Leave</Button>
                                            )}
                                            <DialogContent className="sm:max-w-1/2">
                                                <DialogHeader>
                                                    <DialogTitle>{group.groupname}</DialogTitle>
                                                </DialogHeader>
                                                <ScrollArea className="h-72 sm:max-w-1/2 rounded-md">
                                                    <div className="p-4">
                                                        {chatsLoading && <h1>loading...</h1>}
                                                        {chats?.map((chat) => (
                                                            <>
                                                                <div key={chat.id} className={`text-sm text-primary-foreground flex ${userSession.user.id === chat.sender ? "justify-end" : "justify-start"} `}>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger>
                                                                            {chat.isImg && <p><Media path={chat.message} /></p>}
                                                                            {!chat.isImg && chat.message}
                                                                        </DropdownMenuTrigger>
                                                                        {chat.sender === userSession.user.id && (
                                                                            <DropdownMenuContent>
                                                                                {!chat.isImg && <DropdownMenuItem className="gap-3"><Edit size={15} />Edit</DropdownMenuItem>}
                                                                                <DropdownMenuItem className="gap-3" onClick={() => delMsg(chat)} ><Trash size={15} />Delete</DropdownMenuItem>
                                                                            </DropdownMenuContent>
                                                                        )}
                                                                    </DropdownMenu>

                                                                </div>
                                                                <Separator className="my-4 bg-transparent" />
                                                            </>
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                                <DialogFooter>
                                                    <div className="flex mx-auto gap-2">
                                                        <Input type="text" placeholder="Enter message..." value={msg} onChange={(e) => setMsg(e.currentTarget.value)} />
                                                        <Button size={"icon"} variant={"default"} ><IconPhoto /><Input type="file" className="w-0 bg-transparent opacity-0 absolute" onChange={(e) => sendGrpPhoto(e.target.files)} /></Button>
                                                        <Button size={"icon"} type="submit" variant={"default"} onClick={() => mutate(msg)} ><IconSend /></Button>
                                                    </div>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                        {group.groupadmin !== userSession.user.id && (<Button variant="outline" onClick={async () => joingroup(group.id)}>Join</Button>)}
                                        {group.groupadmin === userSession.user.id && (<Button variant="outline" onClick={async () => delgroup(group.id)}>Delete</Button>)}
                                    </div>
                                </div>
                                <Separator className="my-4 bg-primary-foreground" />
                            </>
                        ))}
                    </div>
                </ScrollArea>
                <Drawer>
                    <DrawerTrigger><Button size={"sm"} className="mt-4">CREATE GROUP</Button></DrawerTrigger>
                    <DrawerContent className="lg:w-1/3 grid justify-center">
                        <DrawerHeader>
                            <div className="grid w-full mt-5 max-w-sm items-center gap-1.5">
                                <Input type="text" id="name" value={groupname} onChange={(e) => setGroupname(e.currentTarget.value)} placeholder="Enter Group Name " />
                            </div>
                        </DrawerHeader>
                        <DrawerFooter>
                            <Button onClick={() => creategroup()}>CREATE</Button>
                            <DrawerClose>
                                <Button variant="ghost">Cancel</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </div>
        </>
    )
}