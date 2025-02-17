import { roomSession, userSession } from "../../sessions/session.js";
import makePacket from "../../utils/packet/makePacket.js";

const objectDamagedByMonsterHandler = async ({ socket, payload }) => {
    const { objectId, monsterId } = payload;

    const user = userSession.getUser(socket.id);
    const game = roomSession.getRoom(user.getRoomId()).getGame();
    const object = game.getObject(objectId);
    const monster = game.getMonsterById(monsterId);
    

    if(objectId = 1) {
        console.log(`코어가 ${monster.getAttack()}의 데미지를 받았습니다!`)
        const CoreHp = game.coreDamaged(monster.getAttack());
        const payload = { objectId: objectId, hp: CoreHp }
        packet = makePacket(config.packetType.S_Object_HP_UPDATE_NOTIFICATION, payload);
    } else {

    }
    game.broadcast(packet);
}

export default objectDamagedByMonsterHandler;