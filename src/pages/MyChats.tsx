import { useMutation, useQuery, useQueryClient } from "react-query"
import { getRecentChats } from "../backend/recentChats"
import { getUserSession } from "../backend/handleUser";
import { useEffect, useState } from "react";
import { Database } from "../lib/database.types";
import { UnauthorizaError } from "./UnauthorizaError";
import { TopBar } from "../components/TopBar";
import { Loading } from "../components/Loading";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { delMsgs, getMedia, sendMedia, sendMsgs } from "@/backend/sendMsgs";
import { getChats } from "@/backend/getChats";
import { IconPhoto, IconSend } from "@tabler/icons-react";

type User = Database["public"]["Tables"]["users"]["Row"] | null;
type MediaProps = {
    path: string;
}

const Media = (props: MediaProps) => {
    const queryClient = useQueryClient();
    const { data: media, isLoading, isSuccess } = useQuery({
        queryFn: async () => getMedia(props.path),
        queryKey: [`img-${props.path}`],
    })
    useEffect(() => {
        if (isSuccess) {
            queryClient.invalidateQueries(["chats"]);
        }
    }, [isSuccess, queryClient, props.path]);

    if (isLoading) {
        return <span className="loading loading-dots loading-md"></span>
    }

    return <img src={media} className="w-[650px] rounded-xl" alt="..." />
}

export const MyChats = () => {
    const [otherUser, setOtherUser] = useState<User>();
    const [msg, setMsg] = useState<string>("");
    const queryClient = useQueryClient();

    const { data: userSession } = useQuery({
        queryFn: getUserSession,
        queryKey: ["userSession"],
    });
    const { data: users, isSuccess, isLoading } = useQuery({
        queryKey: 'my-chats',
        queryFn: () => getRecentChats(),
    })
    const { mutate, isSuccess: msgSuccess } = useMutation({
        mutationFn: (msg: string) => sendMsgs(otherUser?.id, msg),
        mutationKey: ["sendMsgs"],
    });
    const { data: chats } = useQuery({
        queryFn: async () => getChats(otherUser?.id),
        queryKey: ["chats", otherUser?.id],
    })
    type DelMsgsProps = Database["public"]["Tables"]["chats"]["Row"];
    const { mutate: delMsg, isSuccess: delMsgSuccess } = useMutation({
        mutationFn: (props: DelMsgsProps) => delMsgs(props.msgid, props.message, props.isImg),
        mutationKey: ["delMsgs"],
    });
    const { mutate: sendPhoto, isSuccess: photoSend } = useMutation({
        mutationFn: (msg: FileList | null) => sendMedia(otherUser?.id, msg),
        mutationKey: ["sendMedia"],
    });

    useEffect(() => {
        if (msgSuccess) {
            queryClient.invalidateQueries(["chats", otherUser?.id]);
            setMsg("");
        }
        if (photoSend) {
            queryClient.invalidateQueries(["chats", otherUser?.id]);
        }
        if (delMsgSuccess) {
            queryClient.invalidateQueries(["chats", otherUser?.id]);
        }
    }, [msgSuccess, photoSend, delMsgSuccess, otherUser?.id, queryClient]);

    if (isLoading) {
        return <Loading />
    }
    if (!userSession) {
        return <UnauthorizaError />
    }

    return (
        <>
            <TopBar />
            <div className="grid h-screen justify-center content-center">
                <ScrollArea className="h-80 w-96 rounded-lg border">
                    <div className="p-4">
                        <h4 className="mb-4 text-center text-primary-foreground text-sm font-medium leading-none">Users on Location</h4>
                        {isLoading ? <h1>loading...</h1> :
                            <>
                                {isSuccess && users?.map((user) => (
                                    <>
                                        <div key={user.id} className="text-lg flex justify-between">
                                            <div className="text-primary-foreground">{user.users?.name}</div>
                                            <div>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button onClick={async () => setOtherUser(user.users)} variant="outline">Chat</Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-1/2">
                                                        <DialogHeader>
                                                            <DialogTitle>{otherUser?.name}</DialogTitle>
                                                        </DialogHeader>
                                                        <ScrollArea className="h-72 sm:max-w-1/2 rounded-md">
                                                            <div className="p-4">
                                                                {isLoading && <h1>loading...</h1>}
                                                                {chats?.map((chat) => (
                                                                    <>
                                                                        <div key={chat.id} className={`text-sm flex text-primary-foreground ${userSession.user.id === chat.id ? "justify-end" : "justify-start"} `}>
                                                                            <DropdownMenu>
                                                                                <DropdownMenuTrigger>
                                                                                    {chat.isImg && <p><Media path={chat.message} /></p>}
                                                                                    {!chat.isImg && chat.message}
                                                                                </DropdownMenuTrigger>
                                                                                {chat.id === userSession.user.id && (
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
                                                                <Button size={"icon"} variant={"default"} ><IconPhoto /><Input type="file" className="w-0 bg-transparent opacity-0 absolute" onChange={(e) => sendPhoto(e.target.files)} /></Button>
                                                                <Button size={"icon"} type="submit" variant={"default"} onClick={() => mutate(msg)} ><IconSend /></Button>
                                                            </div>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </div>
                                        <Separator className="my-4" />
                                    </>
                                ))}
                            </>
                        }
                    </div>
                </ScrollArea>
            </div>
        </>
    )
}

