import makePacket from '../packet/makePacket.js';
import { config } from '../../config/config.js';
import CustomError from './customError.js';

/**
 * 클라이언트와 연결되어 어떠한 동작을 하던 중 에러가 발생할 경우 호출되는 함수
 * @param {Socket} socket - 소켓 객체
 * @param {Error} error - 에러 객체
 */

export const errorHandler = (socket, error, userId) => {
  let message;

  // 에러 정보 로깅
  console.error(error);

  // 에러 타입별 분류 및 처리
  switch (true) {
    // CustomError 처리
    case error instanceof CustomError:
      message = error.message;
      break;
    // 기타 일반 에러
    default:
      message = error.message || '알 수 없는 오류가 발생했습니다';
  }

  console.log(`에러 메시지: ${message}`);

  const user = userSession.getUserByID(userId);
  if (!user) return

  user.sendPacket([config.packetType.S_ERROR_NOTIFICATION, {
      errorMessage: message,
      timestamp: Date.now(),
      clienterr: true,
    }])
};
