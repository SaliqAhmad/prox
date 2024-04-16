import { handleUserSignIn, handleUserSignUp } from "@/backend/handleUser"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@radix-ui/react-label"
import { FormEvent, useEffect, useState } from "react"
import { useGeolocated } from "react-geolocated"
import { useMutation, useQueryClient } from "react-query"
import { LocationError } from "./LocationError"
import { useNavigate } from "react-router-dom"
import { IconReload } from "@tabler/icons-react"
import toast, { Toaster } from "react-hot-toast"

const Login = () => {
    const [Loginemail, setLoginEmail] = useState<string>('');
    const [Loginpassword, setLoginPassword] = useState<string>('');
    const [signing, setSigning] = useState<boolean>(false);
    const [fullName, setFullName] = useState<string>('');
    const [Regemail, setRegEmail] = useState<string>('');
    const [Regpassword, setRegPassword] = useState<string>('');
    const [registering, setRegistering] = useState<boolean>(false);

    const navigate = useNavigate();

    const queryClient = useQueryClient();

    const { coords, isGeolocationAvailable, isGeolocationEnabled } =
        useGeolocated({
            positionOptions: {
                enableHighAccuracy: false,
            },
            userDecisionTimeout: 5000,
        });

    const { mutate, isSuccess } = useMutation({
        mutationKey: 'user',
        mutationFn: (e: FormEvent) => handleUserSignIn(Loginemail, Loginpassword, coords?.latitude, coords?.longitude, e),
        onSuccess: (res) => {
            if (res) {
                setSigning(true);
                setTimeout(() => {
                    navigate('/chat');
                }
                    , 1000);
            }
        },
    });
    const { mutate: Register } = useMutation({
        mutationKey: "handleUserSignUp",
        mutationFn: (e: FormEvent) => handleUserSignUp(Regemail, Regpassword, fullName, coords?.latitude, coords?.longitude, e),
        onSuccess: (res) => {
            if (res) {
                setRegistering(true);
                setTimeout(() => {
                    setRegistering(false);
                    toast.success("Registration successful! Please login to continue.");
                }
                    , 1000);
            }
        }
    });

    useEffect(() => {
        if (isSuccess) {
            queryClient.invalidateQueries('user');
        }
    }
        , [isSuccess, queryClient]);

    if (!isGeolocationAvailable) {
        return (
            <LocationError />
        )
    }

    if (!isGeolocationEnabled) {
        return (
            <LocationError />
        );
    }

    if (!coords) {
        return <div>Getting the location data&hellip; </div>;
    }

    return (
        <>
            <Toaster />
            <div className="grid h-screen justify-center content-center">
                <Tabs defaultValue="Login" className="w-[400px]">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="Login" >Login</TabsTrigger>
                        <TabsTrigger value="Register">Register</TabsTrigger>
                    </TabsList>
                    <TabsContent value="Login">
                        <Card>
                            <CardHeader>
                                <CardTitle style={{ fontFamily: "AudioWide", fontSize: "2rem", fontWeight: "lighter" }}>Proxi-Chat</CardTitle>
                                <CardDescription className="">
                                    Welcome to Axion! Please login to continue.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="space-y-1">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" className="rounded-full" placeholder="email" value={Loginemail} onChange={(e) => setLoginEmail(e.currentTarget.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" type="password" className="rounded-full" placeholder="*****" value={Loginpassword} onChange={(e) => setLoginPassword(e.currentTarget.value)} />
                                </div>
                            </CardContent>
                            <CardFooter className="flex- justify-center">
                                <Button className="rounded-full" disabled={signing} size={"lg"} onClick={async (e) => mutate(e)} >{signing ? (<IconReload className="animate-spin" />) : "LOGIN"}</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                    <TabsContent value="Register">
                        <Card>
                            <CardHeader className="text-center">
                                <CardTitle style={{ fontFamily: "AudioWide", fontSize: "2rem", fontWeight: "lighter" }}>Proxi-Chat</CardTitle>
                                <CardDescription>
                                    Welcome to Axion! Please Register to continue.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="space-y-1">
                                    <Label htmlFor="fullName">Full name</Label>
                                    <Input id="fullName" className="rounded-full" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.currentTarget.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" className="rounded-full" placeholder="email" value={Regemail} onChange={(e) => setRegEmail(e.currentTarget.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" type="password" className="rounded-full" placeholder="*****" value={Regpassword} onChange={(e) => setRegPassword(e.currentTarget.value)} />
                                </div>
                            </CardContent>
                            <CardFooter className="flex- justify-center">
                                <Button className="rounded-full" disabled={registering} size={"lg"} onClick={async (e) => Register(e)} >{registering ? (<IconReload className="animate-spin" />) : "REGISTER"}</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    )
}

export default Login