import { config } from '../../config/config.js';
import { roomSession, userSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';

const objectDamagedByMonsterHandler = async ({ socket, payload }) => {
  const { objectId, monsterId } = payload;

    const user = userSession.getUser(socket.id);
    const game = roomSession.getRoom(user.getRoomId()).getGame();
    //const object = game.getObject(objectId);
    const monster = game.getMonsterById(monsterId);

    let packet;

    if (objectId === 1) {
        //console.log(`코어가 ${monster.getAttack()}의 데미지를 받았습니다!`)
        const CoreHp = game.coreDamaged(monster.getAttack());
        const payload = { objectId: objectId, hp: CoreHp }
        packet = makePacket(config.packetType.S_OBJECT_HP_UPDATE_NOTIFICATION, payload);
    } else {


  if (objectId === 1) {
    console.log(`코어가 ${monster.getAttack()}의 데미지를 받았습니다!`);
    const CoreHp = game.coreDamaged(monster.getAttack());
    if (CoreHp <= 0) {//게임중일때만 보냄.
      //1.룸 상태를 게임 끝난거(대기)로 고침
      console.log(`코어가 파괴되었습니다. HP: ${CoreHp}`);
      const gameOverPayload = {};
      gameOverPacket = makePacket(config.packetType.S_GAME_OVER_NOTIFICATION, gameOverPayload);
      game.broadcast(gameOverPacket);
  
    }else{
    const payload = { objectId: objectId, hp: CoreHp };
    packet = makePacket(config.packetType.S_OBJECT_HP_UPDATE_NOTIFICATION, payload);
    game.broadcast(packet);
    }

  } else {
  }
};

export default objectDamagedByMonsterHandler;
