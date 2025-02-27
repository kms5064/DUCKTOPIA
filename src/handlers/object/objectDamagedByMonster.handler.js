import { config } from '../../config/config.js';
import { roomSession, userSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';

const objectDamagedByMonsterHandler = async ({ socket, payload }) => {
  const { objectId, monsterId } = payload;

  
  const user = userSession.getUser(socket.id);
  const room = roomSession.getRoom(user.roomId);
  const game = room.getGame();
  //const object = game.getObject(objectId);
  const monster = game.getMonsterById(monsterId);
  

  let packet;
  let gameOverPacket;
  let coreHp = game.getCoreHp();

  if (objectId === 1 && coreHp > 0) {
    coreHp = game.coreDamaged(monster.getAttack());
    console.log(`코어가 ${monster.name}(${monsterId})에게  ${monster.getAttack()}의 데미지를 받았습니다! HP: ${coreHp}`);
    const payload = { objectId: objectId, hp: coreHp };
    packet = makePacket(config.packetType.S_OBJECT_HP_UPDATE_NOTIFICATION, payload);
    game.broadcast(packet);
    if (coreHp <= 0) {
      console.log(`코어가 파괴되었습니다. HP: ${coreHp}`);
      const gameOverPayload = {};
      gameOverPacket = makePacket(config.packetType.S_GAME_OVER_NOTIFICATION, gameOverPayload);
      game.broadcast(gameOverPacket);
      roomSession.removeRoom(room.id);
    }
  } else {
  }
}
;

export default objectDamagedByMonsterHandler;
