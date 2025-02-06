import { findUserByEmail } from '../../db/user/user.db.js';

const signInHandler = async (socket, payload) => {
  try {
    const { email, password } = payload;

    // 1. 사용자 존재 여부 DB에서 확인
    const userData = await findUserByEmail(email);

    if (!userData) {
      throw new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
    }

    // 2. 비밀번호 일치 여부 확인
    if (!(await bcrypt.compare(password, userData.password))) {
      throw new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
    }

    // 3. 중복 로그인 유저 세션에서 체크 TODO
    // ex) const dupUser = getUserByEmail;

    // if (dupUser) {
    //   throw new Error('이미 접속 중인 유저입니다.');
    // }

    // 4. 유저 세션에서 자신의 user 찾아서 정보 입력하기 TODO
    // ex) const user = getUserBySocket;
    
    // if(!user) {
    //     throw new Error('소켓을 찾을 수 없습니다.');
    // }

    // user.updateUserInfo(userData.name, userData.email);

    // 5. 결과 반환 TODO
    // ex) createResponse~

} catch (error) {
    console.log(error);
  }
};
