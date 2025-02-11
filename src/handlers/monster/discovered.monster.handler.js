//몬스터가 플레이어를 발견했을 때의 핸들러

import RoomSession from "../../classes/room/roomSession.class";
import { PACKET_TYPE } from "../../config/constants/header";

export const discoveredMonsterHandler = async (socket, payload) => {
  //플레이어가 발견하는 것이니까
  const { monsterId } = payload;

  //현재 몬스터가 플레이어를 발견했을 때 여기서 체크를 해보도록 한다.

  //1. room session 가운데 socket이 들어 있는 곳을 찾아 보도록 한다.
  //2. 몬스터에게 플레이어의 정보를 등록시킨다.
  //3. 해당 몬스터는 이동할 수 있도록 전환해보도록 한다.
  const game = RoomSession.findGameBySocket(socket);
  const player = game.getPlayerBySocket(socket);
  const monster = game.getMonster(monsterId);

  monster.setTargetPlayer(player);

  const discoverPayload = {
    monsterId : monsterId
  };

  const packet = createResponse(PACKET_TYPE.MONSTER_AWAKE_NOTIFICATION, discoverPayload);

  //몬스터가 탐색이나 생성 등은 game 쪽에서 broadcast를 하는 게 더 나을 듯 하다.
  //유저들이 어떤 몬스터가 어떤 유저를 쫒고 있는지 알아야 하니까
  game.broadcastAllPlayer(packet,[socket]);
};
