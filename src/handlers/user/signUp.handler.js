const signUpHandler = async (socket, payload) => {
    const {id, password, email, name} = payload;

    // 1. payload 유효성 검사(TODO 클라 보고 고치기!)

    

    // 2. 유저 DB 확인 (TODO DB 함수 만들고 변경)

    // 3. 비밀번호 bcrypt로 암호화 (TODO 변겨어엉)

    // 4. 유저 정보 저장 (TODO 크리에이뜨 유절)

    // 
    let user = await findUserByDeviceID(deviceId);

    // 유저가 이미 존재하는지 확인
    if (!user) {
      user = await createUser(deviceId);
    } else {
      await updateUserLogin(user.id);
    }


}