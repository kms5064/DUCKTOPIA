import { createResponse } from '../response/createResponse.js';
import { ErrorCodes } from './errorCodes.js';

/**
 * 에러 메시지를 가져옵니다.
 * @param {number} code - 에러 코드
 * @param {string} defaultMessage - 기본 메시지
 * @returns {string} 에러 메시지
 */

const getErrorMessage = (code, defaultMessage) => {
  const errorMessages = {
    // 기본 시스템 에러 (10000번대)
    [ErrorCodes.SOCKET_ERROR]: '서버와의 연결에 문제가 발생했습니다',
    [ErrorCodes.CLIENT_VERSION_MISMATCH]: '클라이언트 버전이 맞지 않습니다',
    [ErrorCodes.PACKET_DECODE_ERROR]: '잘못된 데이터 형식입니다',
    [ErrorCodes.PACKET_STRUCTURE_MISMATCH]: '패킷 구조가 올바르지 않습니다',
    [ErrorCodes.MISSING_FIELDS]: '필수 필드가 누락되었습니다',
    [ErrorCodes.INVALID_SEQUENCE]: '잘못된 요청 순서입니다',

    // 플레이어 관련 에러 (11000번대)
    [ErrorCodes.PLAYER_NOT_FOUND]: '플레이어를 찾을 수 없습니다',
    [ErrorCodes.PLAYER_DEAD]: '사망한 상태에서는 해당 행동을 할 수 없습니다',
    [ErrorCodes.PLAYER_STAT_INVALID]: '잘못된 스탯 값입니다',
    [ErrorCodes.PLAYER_POSITION_INVALID]: '이동할 수 없는 위치입니다',
    [ErrorCodes.PLAYER_ACTION_INVALID]: '현재 상태에서 불가능한 행동입니다',

    // 아이템/인벤토리 관련 에러 (12000번대)
    [ErrorCodes.ITEM_NOT_FOUND]: '존재하지 않는 아이템입니다',
    [ErrorCodes.INVENTORY_FULL]: '인벤토리가 가득 찼습니다',
    [ErrorCodes.ITEM_NOT_IN_INVENTORY]: '해당 아이템이 인벤토리에 없습니다',
    [ErrorCodes.INVALID_ITEM_USE]: '이 아이템을 사용할 수 없습니다',

    // 게임 상태 관련 에러 (13000번대)
    [ErrorCodes.GAME_NOT_FOUND]: '게임을 찾을 수 없습니다',
    [ErrorCodes.GAME_STATE_INVALID]: '잘못된 게임 상태입니다',
    [ErrorCodes.GAME_ACTION_NOT_ALLOWED]: '현재 게임 상태에서 불가능한 행동입니다',
    [ErrorCodes.GAME_ROOM_NOT_FOUND]: '게임 룸을 찾을 수 없습니다',
    [ErrorCodes.GAME_ALREADY_STARTED]: '이미 시작된 게임입니다',
    [ErrorCodes.GAME_PLAYER_LIMIT_EXCEEDED]: '더 이상 플레이어를 추가할 수 없습니다',
    [ErrorCodes.ROOM_FULL]: '방이 가득 찼습니다',

    // 세션 관련 에러 (14000번대)
    [ErrorCodes.SESSION_EXPIRED]: '세션이 만료되었습니다. 다시 로그인해주세요',
    [ErrorCodes.SESSION_INVALID]: '유효하지 않은 세션입니다',
    [ErrorCodes.SESSION_USER_MISMATCH]: '세션 정보가 일치하지 않습니다',

    // 네트워크/통신 관련 에러 (15000번대)
    [ErrorCodes.NETWORK_LATENCY_HIGH]: '네트워크 상태가 불안정합니다',
    [ErrorCodes.RATE_LIMIT_EXCEEDED]: '너무 많은 요청이 발생했습니다',
    [ErrorCodes.SOCKET_CONNECTION_FAILED]: '서버와의 연결이 끊어졌습니다',

    // 권한/인증 관련 에러 (16000번대)
    [ErrorCodes.USER_NOT_FOUND]: '사용자를 찾을 수 없습니다',
    [ErrorCodes.UNAUTHORIZED_ACCESS]: '권한이 없습니다',
    [ErrorCodes.INVALID_CREDENTIALS]: '로그인 정보가 올바르지 않습니다',
    [ErrorCodes.INVALID_TOKEN]: '인증이 만료되었습니다. 다시 로그인해주세요',

    // 시스템 관련 에러 (17000번대)
    [ErrorCodes.SYSTEM_ERROR]: '시스템 오류가 발생했습니다',
    [ErrorCodes.DATABASE_ERROR]: '데이터베이스 오류가 발생했습니다',
    [ErrorCodes.INTERNAL_SERVER_ERROR]: '서버 내부 오류가 발생했습니다',
  };

  return errorMessages[code] || defaultMessage || '알 수 없는 오류가 발생했습니다';
};

/**
 * 클라이언트와 연결되어 어떠한 동작을 하던 중 에러가 발생할 경우 호출되는 함수
 * @param {Socket} socket - 소켓 객체
 * @param {Error} error - 에러 객체
 * @param {number} handlerId - 핸들러 ID (기본값: 0, 시스템 레벨 에러를 나타냄)
 */

export const handleError = (socket, error, handlerId = 0) => {
  let responseCode;
  let message;

  // 에러 정보 로깅
  console.error(error);

  // 에러 코드 및 메시지 결정
  if (error.code) {
    responseCode = error.code;
    message = getErrorMessage(error.code, error.message);
    console.log(`에러 코드: ${error.code}, 메세지: ${message}`);
  } else {
    responseCode = ErrorCodes.SOCKET_ERROR;
    message = error.message;
    console.log(`일반 에러: ${message}`);
  }

  // 에러 응답 패킷 생성 및 전송
  const errorResponse = createResponse(handlerId, responseCode, { message });
  socket.write(errorResponse);
};
