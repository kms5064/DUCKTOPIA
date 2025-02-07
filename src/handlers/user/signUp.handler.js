import bcrypt from 'bcrypt';
import { createUser, findUserByEmail } from '../../db/user/user.db.js';
import { signUpSchema } from '../../utils/validations/auth.validation.js';

const SALT_OR_ROUNDS = 10;

const signUpHandler = async (socket, payload) => {
  try {
    const { email, password, name } = payload;

    /** 테스트 데이터 */
    // const name = 'qwer';
    // const email = 'asdf@naver.com';
    // const password = 'asdfasdf';

    const obj = { name, email, password };

    // 1. payload 유효성 검사
    await signUpSchema.validateAsync(obj);

    // 2. 비밀번호 bcrypt로 암호화
    const hashedPw = await bcrypt.hash(password, SALT_OR_ROUNDS);

    // 3. 유저 정보 저장
    const user = await createUser(name, email, hashedPw);

    // 4. 회원가입 응답 (TODO 결과 보내기?)
    // ex) createResponse~
  } catch (error) {
    // TODO 에러 캐치해서 email or name 중복체크하기
    // Error code : 'ER_DUP_ENTRY', sqlMessage : "Duplicate entry 'asdf@naver.com' for key 'users.email'"
    console.log(error.code);
    console.log(error);
  }
};

export default signUpHandler;
