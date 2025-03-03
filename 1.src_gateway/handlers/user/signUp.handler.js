import bcrypt from 'bcrypt';
import Joi from 'joi';
import { createUser } from '../../db/user/user.db.js';
import makePacket from '../../utils/packet/makePacket.js';
import CustomError from '../../utils/error/customError.js';
import { config } from '../../config/config.js';
import { getProtoMessages } from '../../init/loadProtos.js';

const SALT_OR_ROUNDS = 10;

const signUpSchema = Joi.object({
  nickname: Joi.string().min(2).max(20).required().messages({
    'string.min': '닉네임은 2글자 이상이어야 합니다.',
    'string.max': '닉네임은 20글자를 넘길 수 없습니다.',
    'any.required': '닉네임을 다시 입력해주세요.',
  }),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    .required()
    .messages({
      'string.email': '이메일 형식에 적합하지 않습니다.',
      'any.required': '이메일을 다시 입력해주세요',
    }),
  password: Joi.string().min(6).max(15).required().messages({
    'string.min': '비밀번호는 6글자 이상이어야 합니다.',
    'string.max': '비밀번호는 15글자를 넘길 수 없습니다.',
    'any.required': '비밀번호를 다시 입력해주세요.',
  }),
});

const signUpHandler = async ({ socket, payloadBuffer }) => {
  const proto = getProtoMessages().GamePacket;
  const gamePacket = proto.decode(payloadBuffer);
  const payload = gamePacket[gamePacket.payload];

  const { email, password, nickname } = payload;
  const obj = { nickname, email, password };

  // 1. payload 유효성 검사
  try {
    await signUpSchema.validateAsync(obj);
  } catch (validationError) {
    throw new CustomError(validationError.message);
  }

  // 2. 비밀번호 bcrypt로 암호화
  const hashedPw = await bcrypt.hash(password, SALT_OR_ROUNDS);

  // 3. 유저 정보 저장
  await createUser(nickname, email, hashedPw);

  // 4. 패킷 전송
  const registerResponse = makePacket(config.packetType.REGISTER_RESPONSE, { success: true });
  socket.write(registerResponse);
};

export default signUpHandler;
