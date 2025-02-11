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

    const latency = player.calculateLatency();

    game.players.forEach((otherPlayer) => {
      // 계산한 좌표 전송(브로드캐스트)
      const payload = player.calculatePosition(otherPlayer,x,y);

      //payload 인코딩
      const notification = makePacket([PACKET_TYPE.PLAYER_UPDATE_POSITION_NOTIFICATION], payload);

      player.socket.write(notification);
    });
  } catch (error) {
    handleError(socket, error);
  }
};

export default updateLocationHandler;
