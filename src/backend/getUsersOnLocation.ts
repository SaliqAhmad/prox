import { supabase } from "../supabaseClient";
import { getPreciseDistance } from "geolib";
import toast from "react-hot-toast";
import { getUserSession } from "./handleUser";


export const getUsersOnLocation = async () => {
    const currentUser = await getUserSession().then((user) => user);
    if (!currentUser) return;
    const { data: currUserCoords } = await supabase.from("users")
        .select("*")
        .eq("id", currentUser.user.id);
    const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .neq("id", currentUser.user.id)

    if (error) {
        toast.error(error.message, {
            style: {
                background: "#DCDCDC",
                opacity: "10",
                padding: "16px",
                borderRadius: "3rem",
            },
        });
        throw error
    }

    if (!currUserCoords) return;

    const usersOnLocation = users.filter((user) => {
        const distance = getPreciseDistance(
            {
                latitude: currUserCoords[0].latitude,
                longitude: currUserCoords[0].longitude,
            },
            {
                latitude: user.latitude,
                longitude: user.longitude,
            }
        );
        return distance <= 2000;
    });

    return usersOnLocation;

}