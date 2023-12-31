import {Server} from 'socket.io';

const io = new Server({
    cors:true,
})

const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();

io.on('connection', (socket) => {
    console.log('new user detected');
    socket.on("join-room",(data) => {
        const {roomID, userID} = data;
        console.log(`user: ${userID} joined room: ${roomID}`);
        emailToSocketMapping.set(userID, socket.id);
        socketToEmailMapping.set(socket.id, userID);
        socket.join(roomID);
        socket.emit('joined-room',{roomID});
        socket.broadcast.to(roomID).emit('user-joined', {userID,roomID});
    });
    socket.on('call-user', (data) => {
        const {userID,offer,roomID} = data;
        const fromEmail = socketToEmailMapping.get(socket.id);
        const socketID = emailToSocketMapping.get(userID);
        console.log("offer",offer,"roomID",roomID);
        setTimeout(()=>socket.broadcast.to(roomID).emit('incoming-call', {from:fromEmail, offer, roomID}), 1000);
    });
    socket.on('call-accepted',(data)=>{
        const{UserID,ans,roomID} = data;
        const socketId = emailToSocketMapping.get(UserID);
        setTimeout(()=>socket.broadcast.to(roomID).emit('call-accepted-Ack', {ans}), 1000);
        console.log('call accepted');
    });
});

io.listen(8001, () => {
    console.log('Socket listening on port 8001');
})