import CustomError from '../../utils/error/customError.js';
import { gameSession, userSession } from '../../sessions/session.js';
import { getGameAssets } from '../../init/assets.js';
import { config } from '../../config/config.js';

const equipmentUpgradeHandler = ({ socket, payload, userId }) => {
  console.log('## weaponGradeupHandler');
  const { itemCode1, itemCode2 } = payload;

  console.log('## itemCode1', itemCode1, '## itemCode2 ', itemCode2);

  // 데이터 체크
  if (!itemCode1 || !itemCode2) {
    throw new CustomError(`아이템이 부족하여 조합할 수 없습니다.`);
  }

  // 부위 여부 체크
  const item1Str = itemCode1.toString();
  const item2Str = itemCode2.toString();
  if (item1Str.length !== item2Str.length || item1Str[0] !== item2Str[0]) {
    throw new CustomError('조합이 불가능합니다.');
  }
  const itemType = item1Str[0];

  // 유저 객체 조회
  const user = userSession.getUser(userId);
  if (!user) throw new CustomError(`User ID : (${userId}): 유저 정보가 없습니다.`);

  // 룸 객체 조회
  const game = gameSession.getGame(user.getGameId());
  if (!game) throw new CustomError(`Game ID(${user.getGameId()}): Game 정보가 없습니다.`);

  //인벤토리에 빈공간이 있는지 확인
  const checkRoom = (e) => e === 0;
  const emptyIndex = user.player.inventory.findIndex(checkRoom);
  if (emptyIndex === -1) CustomError(`인벤토리에 공간이 없어 조합할 수 없습니다.`);

  // 무기, 방어구 에셋 불러오기
  const { weapon, armorAccessory, armorHelmet, armorBottom, armorShoes, armorTop, upgradeRate } =
    getGameAssets();

  const items = [itemCode1, itemCode2];
  const itemDatas = [];
  const itemGrades = [];

  // 에셋 데이터 검증

  items.forEach((item) => {
    console.log('foreach');
    console.log(item);
    let data = null;
    /**
     * 101 ~ 120 무기 , 301 ~ 305 갑옷
     * 401 ~ 405 바지 , 501 ~ 505 신발
     * 601 ~ 605 투구 , 701 ~ 705 악세
     */
    switch (item.toString()[0]) {
      case '1':
        data = weapon.data.find((data) => data.code === item);
        break;
      case '3':
        data = armorTop.data.find((data) => data.code === item);
        break;
      case '4':
        data = armorBottom.data.find((data) => data.code === item);
        break;
      case '5':
        data = armorShoes.data.find((data) => data.code === item);
        break;
      case '6':
        data = armorHelmet.data.find((data) => data.code === item);
        break;
      case '7':
        data = armorAccessory.data.find((data) => data.code === item);
        break;
      default:
        throw new CustomError('존재하지않는 아이템 입니다.');
    }
    if (!data) throw new CustomError('존재하지않는 아이템 입니다.');

    itemDatas.push(data);
    // const idx = itemGrades.findIndex((grade) => grade === item.grade);
    console.log(config.game.item.equipmentGrades);
    console.log(config.game.item.equipmentGrades.findIndex((grade) => grade === data.grade));
    itemGrades.push(config.game.item.equipmentGrades.findIndex((grade) => grade === data.grade));
  });

  console.log('@@@@@');
  console.log('itemData : ', itemDatas);
  console.log('grades : ', itemGrades);
  /**
   * 동일 등급 : 성공률 100%
   */
  let isSuccess = false;
  let createGrade = null;
  if (itemGrades[0] !== itemGrades[1]) {
    // TODO : 체크
    // 가중치 합산
    const totalWeight =
      upgradeRate.data[config.game.item.equipmentGrades[itemGrades[0]]] +
      upgradeRate.data[config.game.item.equipmentGrades[itemGrades[1]]];
    // 확률 처리
    const random = Math.floor(Math.random() * 100) + 1;
    console.log('totalWeight : ', totalWeight);
    console.log('random: ', random);

    const maxIndex = Math.max(itemGrades[0], itemGrades[1]);
    // 성공 실패 여부
    if (random <= totalWeight) {
      // 성공
      isSuccess = true;

      createGrade =
        config.game.item.equipmentGrades.length - 1 < maxIndex
          ? config.game.item.equipmentGrades[maxIndex + 1]
          : config.game.item.equipmentGrades[maxIndex];
    } else {
      //실패
      createGrade = config.game.item.equipmentGrades[maxIndex];
    }
    // upgradeRate[grade];
  } else {
    /**
     * 동일 등급 합성 처리
     */

    isSuccess = true;
    createGrade =
      config.game.item.equipmentGrades.length - 1 === itemGrades[0]
        ? config.game.item.equipmentGrades[itemGrades[0]]
        : config.game.item.equipmentGrades[itemGrades[0] + 1];
  }

  console.log('isSuccess : ', isSuccess);
  console.log('createGrade : ', createGrade);

  // 등급에 따른 아이템 생성

  let equipmentList = null;
  console.log('itemType : ', itemType);
  switch (itemType) {
    case '1':
      equipmentList = weapon.data.filter((data) => data.grade === createGrade);
      break;
    case '3':
      equipmentList = armorTop.data.filter((data) => data.grade === createGrade);
      break;
    case '4':
      equipmentList = armorBottom.data.filter((data) => data.grade === createGrade);
      break;
    case '5':
      equipmentList = armorShoes.data.filter((data) => data.grade === createGrade);
      break;
    case '6':
      equipmentList = armorHelmet.data.filter((data) => data.grade === createGrade);
      break;
    case '7':
      equipmentList = armorAccessory.data.filter((data) => data.grade === createGrade);
      break;
    default:
      throw new CustomError('존재하지않는 아이템 입니다.');
  }

  // 유저 인벤토리에서 재료 삭제
  user.player.removeItem(itemCode1, 1);
  user.player.removeItem(itemCode2, 1);

  const createRandom = Math.floor(Math.random() * equipmentList.length);
  const createEquipment = equipmentList[createRandom];
  console.log('조합에 성공하여 새로운 아이템이 생성되었습니다.', createEquipment);

  // 유저 인벤토리에 아이템 생성
  user.player.addItem(createEquipment.code, 1, emptyIndex);

  const sendPayload = {
    success: isSuccess,
    itemCode1: itemCode1,
    itemCode2: itemCode2,
    itemResultCode: createEquipment.code,
    playerId: userId,
  };

  console.log(sendPayload);

  const packet = [config.packetType.S_ITEM_COMBINATION_NOTIFICATION, sendPayload];
  game.broadcast(packet);
};

export default equipmentUpgradeHandler;
