import { config } from '../../config/config.js';
import { roomSession, userSession } from '../../sessions/session.js';
import makePacket from '../../utils/packet/makePacket.js';
import CustomError from '../../utils/error/customError.js';
import { setRedisToRoom } from '../../db/redis/redis.js';

const gamePrepareReqHandler = async ({ socket, payload }) => {
  const user = userSession.getUser(socket.id);
  const room = roomSession.getRoom(user.roomId);
  if (!room) {
    throw new CustomError('방 생성에 실패했습니다!');
  }

  // TODO : 레디스에 게임 정보를 저장하고 그 키 값과 게임서버 URL을 클라로 전송.
  const roomData = {
    roomId: room.id,
    users: room.getUserIds(),
  };

  const key = await setRedisToRoom(roomData);

  const GamePrepareResponse = makePacket(config.packetType.PREPARE_GAME_RESPONSE, {
    redisKey: key,
  });

  room.broadcast(GamePrepareResponse);

  // 클라로 전송하고
  // 토큰을 약간 유저마다 일회성 으로 hash 값 << 현재 시간 랜덤값 uuid4?

  /*
  추가 기획1 

  게임이 끝났어 -> 로비서버(기본 접속 주소)로 재접속
  게임이 강제종료됨 -> 로비서버 재접속

  IF
  만약에 누군가가 게임에 접속을 안하고 버텼어 
  그다음에 게임이 끝났다는 거짓 패킷을 로비 서버에게 보냈어
  그러면 그 방에서 새로운 게임을 시작할 수 있네?
  
  룸 user에 저장 << 나중에 재접속할 수 있으니까
  로비 -> 내 방이다 찾아서 들어가기 -> 방이 너 주소하고 아이디따라서 토큰만들어둔거 다시 줄께~
  */

  /*
  토큰을 레디스에 저장을 하고
  소켓을 통해서 아이디(= playerId = user.id = socket.id )로 토큰을 레디스에서 조회
  */
};

export default gamePrepareReqHandler;
