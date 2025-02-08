const updateLocationHandler = ({ socket, payload }) => {
  try {
    const { x,y } = payload;

    const game = getGameBySocket(socket);//없는 함수

    if (!game) {
      console.error( '게임을 찾을 수 없습니다.');
    }

    const player = game.getPlayerBySocket(socket);

    if (!player) {
      console.error( '유저를 찾을 수 없습니다.');
    }
    //레이턴시 구하기
    player.latency = Date.now() - player.lastPosUpdateTime;

    // 현재 위치와 요청받은 위치로 방향을 구하고 speed와 레이턴시를 곱해 이동거리를 구하고 좌표 예측 검증
    // 만약 거속시로 구한 거리보다 멀면 서버가 알고있는 좌표로 강제 이동
    // 유효한 이동이라면 player.lastPosUpdateTime 업데이트
    // 계산한 좌표 전송(브로드캐스트)



    const packet = 1;

    socket.write(packet);
  } catch (error) {
    handleError(socket, error);
  }
};

export default updateLocationHandler;