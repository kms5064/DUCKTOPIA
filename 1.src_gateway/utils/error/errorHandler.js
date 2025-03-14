import makePacket from '../packet/makePacket.js';
import CustomError from './customError.js';
import { config } from '../../config/config.js';

/**
 * 클라이언트와 연결되어 어떠한 동작을 하던 중 에러가 발생할 경우 호출되는 함수
 * @param {Socket} socket - 소켓 객체
 * @param {Error} error - 에러 객체
 */

export const errorHandler = (socket, error) => {
  let message;
  let clienterr = false;

  // 에러 정보 로깅
  console.error(error);

  // 에러 타입별 분류 및 처리
  switch (true) {
    // CustomError 처리
    case error instanceof CustomError:
      message = error.message;
      const regx = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
      if (regx.test(message)) clienterr = true;
      break;

    // MySQL 에러
    case error.code === 'ER_DUP_ENTRY':
      if (error.sqlMessage.includes('users.name')) {
        message = '이미 존재하는 닉네임입니다';
        clienterr = true;
      } else if (error.sqlMessage.includes('users.email')) {
        message = '이미 존재하는 이메일입니다';
        clienterr = true;
      }
      break;
    // 기타 일반 에러
    default:
      message = error.message || '알 수 없는 오류가 발생했습니다';
  }

  console.log(`에러 메시지: ${message}`);

  // 에러 응답 패킷 생성 및 전송
  const errorResponse = makePacket(config.packetType.S_ERROR_NOTIFICATION, {
    errorMessage: message,
    timestamp: Date.now(),
    clienterr: clienterr,
  });

  socket.write(errorResponse);
};
