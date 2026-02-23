import { Server } from "socket.io";
import { auth } from "./config/firebase.js";

let io: Server;

export const initSocket = (server: any) => {
    io = new Server(server, {
        cors: {
            origin: "*",
        },
    });

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if(!token || token === ""){
                return next(new Error("Authentication error"));
            }

            const decoded = await auth.verifyIdToken(token)

            socket.data.user = decoded

            next();
        } catch (error) {
            console.log(error);
            next(new Error("Authentication error"));
        }
    })

    io.on("connection", (socket) => {
        const user = socket.data.user
        
        console.log("User connected:", user.uid)

        socket.join(`user_${user.uid}`)

        if(user.role === "dj"){
            socket.join(`dj_${user.uid}`)
        }

        if(user.role === "admin"){
            socket.join(`admin_${user.uid}`)
        }

        socket.on("disconnect", () => {
            console.log("User disconnected:", user.uid)
        })
    }) 

    return io;
}

export const getIO = () => {
    if(!io){
        throw new Error("Socket not initialized");
    }
    return io;
}

