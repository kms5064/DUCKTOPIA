import { WaveState } from '../../config/constants/game.js';
import { config } from '../../config/config.js';
import { gameSession, userSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';
import makePacket from '../../utils/packet/makePacket.js';

// 호스트 플레이어가 몬스터 좌표 전달
const waveStartHandler = ({ socket, payload }) => {
  const { monsters } = payload;

  // 1. 유저 찾기
  const user = userSession.getUser(socket.id);
  if (!user) {
    new CustomError('유저가 존재하지 않습니다.');
  }

  // 2. 게임 찾기
  const game = gameSession.getGameById(user.getRoomId());

  if (!game) {
    new CustomError('게임이 존재하지 않습니다.');
  }

  // 3. 게임에 반영하기
  for (const item of monsters) {
    const monster = game.getMonsterById(item.monsterId);

    monster.setPosition(item.x, item.y);
  }

  // 4. 웨이브 상태 변경
  game.setWaveState(WaveState.INWAVE);

  // 5. 게임 내부 유저들에게 notification
  const waveStartNotification = makePacket(config.packetType.S_MONSTER_WAVE_START_NOTIFICATION, {
    monsters,
  });

  game.broadcast(waveStartNotification);
};

export default waveStartHandler;
