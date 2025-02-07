import { config } from "../config/config.js";
import attackPlayerHandler from "./player/attackPlayer.handler.js";
import signInHandler from "./user/signIn.handler.js";
import signUpHandler from "./user/signUp.handler.js";

const handlers = {
    [config.packetType.REGISTER_REQUEST[0]]: signUpHandler,
    [config.packetType.LOGIN_REQUEST[0]]: signInHandler,
    [config.packetType.PLAYER_ATTACK_REQUEST[0]]: attackPlayerHandler
}

export default handlers;