import { config } from "../config/config.js";
import attackPlayerHandler from "./player/attackPlayer.handler.js";
import signInHandler from "./user/signIn.handler.js";
import signUpHandler from "./user/signUp.handler.js";

const handlers = {
    [config.packetType.REGISTER_REQUEST]: {
        handler: signUpHandler,
        prototype: 'C2SRegisterRequest',
    },
    [config.packetType.LOGIN_REQUEST]: {
        handler: signInHandler,
        prototype: 'C2SLoginRequest',
    },
    [config.packetType.PLAYER_ATTACK_REQUEST]: {
        handler: attackPlayerHandler,
        prototype: 'C2SPlayerAttackRequest',
    },
}

export default handlers;