import { LOCATION_REQ_TIME_TERM, VALID_DISTANCE } from '../../constants/player.js';
import makePacket from '../../utils/packet/makePacket.js';
import { PACKET_TYPE } from '../../config/constants/header.js';

const updateLocationHandler = ({ socket, payload }) => {
  try {
    const { x, y } = payload;

    const game = getGameBySocket(socket); //없는 함수

    if (!game) {
      console.error('게임을 찾을 수 없습니다.');
    }

    const player = game.getPlayerBySocket(socket);

    if (!player) {
      console.error('유저를 찾을 수 없습니다.');
    }

    const latency = calculateLatency(player);

    game.players.forEach((otherPlayer) => {
      // 계산한 좌표 전송(브로드캐스트)
      const payload = calculatePosition(player,otherPlayer);

      //payload 인코딩
      const notification = makePacket([PACKET_TYPE.PLAYER_UPDATE_POSITION_NOTIFICATION], payload);

      player.socket.write(notification);
    });
  } catch (error) {
    handleError(socket, error);
  }
};

//player 메서드 여기에 만들어놓고 나중에 옮기기

const playerPositionUpdate = (player, dx,dy) => {
  player.x = dx;
  player.y = dy;
};

const calculatePosition = (player,otherPlayer) => {
  // 현재 위치와 요청받은 위치로 방향을 구하고 speed와 레이턴시를 곱해 이동거리를 구하고 좌표 예측 검증
  const seta = (Math.atan2(y - player.y, x - player.x) * 180) / Math.PI;
  const distance = player.speed * otherPlayer.packetTerm;

  // 만약 거속시로 구한 거리보다 멀면 서버가 알고있는 좌표로 강제 이동
  if (distance > VALID_DISTANCE) {
    console.error(`유효하지 않은 이동입니다.`);
  }

  const dx = Math.cos(seta) * distance;
  const dy = Math.sin(seta) * distance;

  // 유효한 이동이라면 player.lastPosUpdateTime 업데이트
  this.playerPositionUpdate(player, dx, dy);
  return { playerId: player.id, x: player.x, y: player.y };
};

const calculateLatency = (player) => {
  //레이턴시 구하기 => 수정할 것)각 클라마다 다른 레이턴시를 가지고 계산
  //레이턴시 속성명도 생각해볼 필요가 있다
  player.packetTerm = Date.now() - player.lastPosUpdateTime; //player값 직접 바꾸는건 메서드로 만들어서 사용
  player.lastPosUpdateTime = Date.now();
};

export default updateLocationHandler;
