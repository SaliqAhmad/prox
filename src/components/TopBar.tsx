import { getUserSession, handleUserSignOut } from "../backend/handleUser"
import { useMutation, useQuery } from "react-query"
import { useNavigate } from "react-router-dom"
import { UnauthorizaError } from "../pages/UnauthorizaError"
import { ModeToggle } from "./mode-toggle"
import { Link } from "react-router-dom"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import {
    Menubar,
    MenubarMenu,
    MenubarTrigger,
} from "@/components/ui/menubar"

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Menu, X } from "lucide-react"



export function TopBar() {
    const navigate = useNavigate();
    const { data: userSession } = useQuery({
        queryFn: getUserSession,
        queryKey: ["userSession"],
    });
    const { mutate } = useMutation({
        mutationFn: handleUserSignOut,
        mutationKey: ["handleUserSignOut"],
        onSuccess: () => {
            navigate("/");
        }
    });
    if (!userSession) {
        return <UnauthorizaError />;
    }

    return (
        <div className="flex justify-center">
            <Menubar className="hidden lg:flex">
                <MenubarMenu>
                    <MenubarTrigger><Link to="/chat">CHAT</Link></MenubarTrigger>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger><Link to="/groupchat">GROUP CHAT</Link></MenubarTrigger>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger><Link to="/mychats">MY CHATS</Link></MenubarTrigger>
                </MenubarMenu>
                <MenubarMenu>
                    <Button variant='ghost' onClick={() => mutate()}>LOG-OUT</Button>
                    <Badge variant='default' > as {userSession.user.user_metadata.fullName}</Badge>
                </MenubarMenu>
                <MenubarMenu>
                    <ModeToggle />
                </MenubarMenu>
            </Menubar>
            <div className="lg:hidden">
                <Drawer>
                    <DrawerTrigger><Menu size={40} className="mt-4" /></DrawerTrigger>
                    <DrawerContent className="top-0 mt-0">
                        <DrawerHeader>
                            <DrawerTitle>Are you sure absolutely sure?</DrawerTitle>
                            <DrawerDescription>This action cannot be undone.</DrawerDescription>
                        </DrawerHeader>
                        <DrawerFooter>
                            <DrawerClose>
                                <Button variant="default" size={"icon"} ><X /></Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </div>
        </div>
    )
}