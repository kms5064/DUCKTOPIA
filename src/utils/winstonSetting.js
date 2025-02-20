import winston from "winston";

// Logger 설정
const logger = winston.createLogger({
    level: "info", // 로그 레벨 (error, warn, info, http, verbose, debug, silly)
    format: winston.format.combine(
        winston.format.timestamp(), // 타임스탬프 추가
        winston.format.json() // JSON 형식으로 저장
    ),
    transports: [
        new winston.transports.Console(), // 콘솔 출력
        new winston.transports.File({ filename: "logs/server.log" }), // 파일 저장
    ],
});

export default logger;

// // 로그 기록 예제
// logger.info("서버가 시작되었습니다.");
// logger.warn("경고 메시지");
// logger.error("에러 발생!", { error: new Error("예제 오류") });