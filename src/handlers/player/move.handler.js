const movePlayerReqHandler=((socket,userId,payload)=>{
    const {x,y} = payload;

    const user = findUserById(userId);

    if(!user){
        throw new Error(`Couldn't find user!`);
    }

    
});

export default movePlayerReqHandler;