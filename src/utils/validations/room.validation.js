import Joi from 'joi';

export const roomNameSchema = Joi.string().max(25).required().messages({
  'string.base': '방 이름은 문자열이어야 합니다.',
  'string.max': '방 이름을 25글자를 넘길 수 없습니다.',
  'any.required': '방 이름을 다시 입력해주세요.',
});
