//이건 몬스터가 공격했을 때 어떤 식의 반응이 있을 것인지 테스트하기
const AttackByPlayerHandler = async (socket, sequence, payload) => {

    //몬스터가 플레이어를 때렸을 때 [1] : 우선 몬스터의 정보를 가져온다.
    const {monsterId } = payload;

    //몬스터가 플레이어를 때렸을 때 [2] : 같은 아이디를 가진 몬스터를 세션에서 찾는다.

    //몬스터가 플레이어를 때렸을 때 [3] : 충격 처리

    //몬스터가 플레이어를 때렸을 때 [4] : 동기화 처리

}