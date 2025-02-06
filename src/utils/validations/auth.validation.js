import Joi from 'joi';

export const signUpSchema = Joi.object({
  name: Joi.string().min(2).max(20).required().messages({
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
