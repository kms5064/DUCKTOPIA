import { config } from '../../config/config.js';
import { WaveState } from '../../config/constants/game.js';
import { gameSession, userSession } from '../../sessions/session.js';

// 호스트 플레이어가 몬스터 좌표 전달
const waveStartHandler = ({ socket, payload, userId }) => {
  const { monsters } = payload;

  // 1. 유저 찾기
  const user = userSession.getUser(userId);
  if (!user) return;

  // 2. 게임 찾기
  const game = gameSession.getGame(user.getGameId());
  if (!game) return;

  // 3. 게임에 반영하기
  game.spawnWaveMonster(monsters);

  // 4. 웨이브 상태 변경
  game.setWaveState(WaveState.INWAVE);

  // 5. 게임 내부 유저들에게 notification
  const waveStartNotification = [
    config.packetType.S_MONSTER_WAVE_START_NOTIFICATION,
    {
      monsters,
    },
  ];

  game.broadcast(waveStartNotification);
};

export default waveStartHandler;
