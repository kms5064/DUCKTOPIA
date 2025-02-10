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

    //레이턴시 구하기 => 수정할 것)각 클라마다 다른 레이턴시를 가지고 계산
    //레이턴시 속성명도 생각해볼 필요가 있다
    player.latency = Date.now() - player.lastPosUpdateTime; //player값 직접 바꾸는건 메서드로 만들어서 사용
    player.lastPosUpdateTime = Date.now();

    // 현재 위치와 요청받은 위치로 방향을 구하고 speed와 레이턴시를 곱해 이동거리를 구하고 좌표 예측 검증
    const ceta = (Math.atan2(y - player.y, x - player.x) * 180) / Math.PI;
    const distance = player.speed * player.latency;

    // 만약 거속시로 구한 거리보다 멀면 서버가 알고있는 좌표로 강제 이동
    if (distance > VALID_DISTANCE) {
      console.error(`유효하지 않은 이동입니다.`);
    }

    const targetX = Math.cos(ceta) * distance;
    const targetY = Math.sin(ceta) * distance;

    // 유효한 이동이라면 player.lastPosUpdateTime 업데이트
    player.x = targetX;
    player.y = targetY;

    // 계산한 좌표 전송(브로드캐스트)
    const payload = { playerId: player.id, x: player.x, y: player.y };

    //payload 인코딩하는 부분

    const notification = makePacket([PACKET_TYPE.PLAYER_UPDATE_POSITION_NOTIFICATION],payload);

    game.players.forEach((player) => {
      //player.calculatePosition(player.latency)
      player.socket.write(notification);
    });
  } catch (error) {
    handleError(socket, error);
  }
};
//player 메서드 여기에 만들어놓고 나중에 붙여넣기

const playerPositionUpdate = (player, x, y) => {
}

const calculatePosition = (latency)=>{

}



export default updateLocationHandler;
