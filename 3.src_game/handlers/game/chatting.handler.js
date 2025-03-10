import { config } from '../../config/config.js';
import { getGameAssets } from '../../init/assets.js';
import { userSession, gameSession } from '../../sessions/session.js';
import CustomError from '../../utils/error/customError.js';

const chattingHandler = ({ socket, payload, userId }) => {
  const { profanity } = getGameAssets();
  const { playerId, message } = payload;
  let replacedMessage = message;

  const user = userSession.getUser(userId);
  if (!user) throw new CustomError('유저 정보가 없습니다.');

  const replaceList = ['♥', '★', '※', '♣', '♠',
    '♥♥', '★★', '※※', '♣♣', '♠♠',
    '♥♥♥♥', '★★★★', '※※※※', '♣♣♣♣', '♠♠♠♠',
    '!#@$', '%#@!', '^!!^', '^#^', '^)^', '^0^'];

  let badWordCount = 0;

  profanity.data.forEach(word => {
    const regex = new RegExp(word, "gi");
    if (replacedMessage.match(regex)) {
      const num = Math.floor(Math.random() * replaceList.length);
      replacedMessage = replacedMessage.replace(regex, replaceList[num]);
      badWordCount++;
    }
  });

  // 게임 객체 조회
  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID(${user.getGameId()}): Game 정보가 없습니다.`);
  //console.log(replacedMessage);
  //console.log("채팅이 변환됨");

  if (badWordCount > 3) {
    replacedMessage = "대충 뭔가 험한 말";
  }

  const chattingPayloadInfos = [
    config.packetType.S_PLAYER_CHATTING_NOTIFICATION,
    {
      playerId,
      message: replacedMessage,
    },
  ];

  game.broadcast(chattingPayloadInfos);
};

export default chattingHandler;
