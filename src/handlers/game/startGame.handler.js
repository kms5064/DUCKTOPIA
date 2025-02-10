import Game from '../../class/game/game.class.js';
import Player from '../../class/player/player.class.js';

const gamePrepareReqHandler = (socket,payload) => {
  try {
    
    const game = new Game(room.uuid); //room의 uuid 따라가기

    room.users.forEach((user) => {
      const player = new Player(id, x, y, user);
      game.addPlayer(player);
    });

    //map정보 넣기
    //base좌표 넣기

    const payload = {
      S2CGamePrepareResponse: {
        success,
      },
    };

    const message = dataType.create(payload);
    const S2CGamePrepareResponse = dataType.encode(message).finish();

    const notification = payloadParser(S2CGamePrepareResponse);

    game.players.forEach((player) => {
      player.socket.write(notification);
    });
  } catch (err) {
    console.error(err);
  }
};

export default gamePrepareReqHandler;
