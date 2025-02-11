import { PACKET_TYPE } from "../../config/constants/header.js";
import makePacket from "../../utils/packet/makePacket.js";

//몬스터의 움직임을 동기화하는 핸들러.
export const monsterMoveNotification = async (socket, payload) => {
    const {monsterId, targetId, x,y} = payload;

    const game = RoomSession.findGameBySocket(socket);
    const player = game.getPlayerBySocket(socket);
    const monster = game.getMonster(monsterId);

    //지정된 몬스터의 좌표를 변경시킨다.
    monster.setPosition({x,y});

    //일단 타임스탬프 용으로 작성
    const now = Date.now();

    const monsterPos = monster.getPosition();

    const monsterMoverPayload = {
        monsterId : monsterId,
        targetId : player.id,
        x : monsterPos.x,
        y : monsterPos.y
    }

    const packet = makePacket(PACKET_TYPE.MONSTER_MOVE_NOTIFICATION, monsterMoverPayload);

    //이런 식으로 게임에서 notification을 보내보도록 하자.
    game.broadcastAllPlayer(packet,[socket]);

}