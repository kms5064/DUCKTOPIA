import { config } from "../config/config.js";
import attackPlayerHandler from "./player/attackPlayer.handler.js";
import signInHandler from "./user/signIn.handler.js";
import signUpHandler from "./user/signUp.handler.js";

const handlers = {
    [config.packetType.REGISTER_REQUEST]: signUpHandler,
    [config.packetType.LOGIN_REQUEST]: signInHandler,
    [config.packetType.PLAYER_ATTACK_REQUEST]: attackPlayerHandler
}

export default handlers;