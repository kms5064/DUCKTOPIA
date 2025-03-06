import CustomError from '../../utils/error/customError.js';
import { gameSession, userSession } from '../../sessions/session.js';
import { getGameAssets } from '../../init/assets.js';
import { config } from '../../config/config.js';

const equipmentUpgradeHandler = ({ socket, payload, userId }) => {
  const { itemCode1, itemCode2 } = payload;

  // 데이터 체크
  if (!itemCode1 || !itemCode2) throw new CustomError(`아이템이 부족하여 조합할 수 없습니다.`);

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

  // 부위 여부 체크
  const item1Str = itemCode1.toString();
  const item2Str = itemCode2.toString();

  // 무기, 방어구 에셋 불러오기
  const { weapon, armorAccessory, armorHelmet, armorBottom, armorShoes, armorTop, upgradeRate } =
    getGameAssets();

  let isSuccess = false;
  let createGrade = null;
  let createEquipmentList = null;
  let mustardWeaponCode = null;
  // 특수 조합 (허니 머스타드 적용 무기)
  if (
    config.game.item.mustardMaterialCode3 === itemCode1 ||
    config.game.item.mustardMaterialCode3 === itemCode2
  ) {
    // '1xx' 무기
    const weaponCode = [item1Str, item2Str].find((code) => code !== config.game.item.mustardItemCode && code[0] === '1');
    if (!weaponCode) throw new CustomError('허니 머스타드는 무기가 아닌 부위에는 조합할 수 없습니다.');

    // 머스타드 무기는 코드에 50을 추가
    mustardWeaponCode = +weaponCode + 50
    isSuccess = true;
    // TODO : 허니머스타드 무기
    // createEquipmentList = 이부분에 넣어주면 됩니다
  } else {
    // 장비 조합

    if (item1Str.length !== item2Str.length || item1Str[0] !== item2Str[0]) 
      throw new CustomError('조합이 불가능합니다.');

    const itemType = item1Str[0];
    const items = [itemCode1, itemCode2];
    const itemDatas = [];
    const itemGrades = [];

    // 에셋 데이터 검증
    items.forEach((item) => {
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
      // 아이템 등급은 비교하기 위해 Index로 저장
      itemGrades.push(config.game.item.equipmentGrades.findIndex((grade) => grade === data.grade));
    });

    if (itemGrades[0] !== itemGrades[1]) {
      /***********
       * 다른 등급
       */
      // 가중치 합산
      const totalWeight =
        upgradeRate.data[config.game.item.equipmentGrades[itemGrades[0]]] +
        upgradeRate.data[config.game.item.equipmentGrades[itemGrades[1]]];
      // 확률 처리
      const random = Math.floor(Math.random() * 100) + 1;

      const maxIndex = Math.max(itemGrades[0], itemGrades[1]);
      // 성공 실패 여부
      if (random <= totalWeight) {
        // 성공 (레전드 = 레전드 / 그외 = 1단계 업글)
        isSuccess = true;
        createGrade =
          config.game.item.equipmentGrades.length - 1 > maxIndex
            ? config.game.item.equipmentGrades[maxIndex + 1]
            : config.game.item.equipmentGrades[maxIndex];
      } else {
        //실패 (재료의 상위 등급을 유지)
        createGrade = config.game.item.equipmentGrades[maxIndex];
      }
    } else {
      /***********
       * 동일 등급
       */
      isSuccess = true;
      createGrade =
        config.game.item.equipmentGrades.length - 1 === itemGrades[0]
          ? config.game.item.equipmentGrades[itemGrades[0]]
          : config.game.item.equipmentGrades[itemGrades[0] + 1];
    }

    // 등급에 따른 아이템 생성

    switch (itemType) {
      case '1':
        createEquipmentList = weapon.data.filter((data) => data.grade === createGrade);
        break;
      case '3':
        createEquipmentList = armorTop.data.filter((data) => data.grade === createGrade);
        break;
      case '4':
        createEquipmentList = armorBottom.data.filter((data) => data.grade === createGrade);
        break;
      case '5':
        createEquipmentList = armorShoes.data.filter((data) => data.grade === createGrade);
        break;
      case '6':
        createEquipmentList = armorHelmet.data.filter((data) => data.grade === createGrade);
        break;
      case '7':
        createEquipmentList = armorAccessory.data.filter((data) => data.grade === createGrade);
        break;
      default:
        throw new CustomError('존재하지않는 아이템 입니다.');
    }
  }

  // 유저 인벤토리에서 재료 삭제
  user.player.removeItem(itemCode1, 1);
  user.player.removeItem(itemCode2, 1);

  const createRandom = Math.floor(Math.random() * createEquipmentList.length);
  const createEquipment = mustardWeaponCode || createEquipmentList[createRandom];
  console.log(
    `조합에 ${isSuccess ? '성공' : '실패'} 하여 ${createGrade} 등급의 새로운 아이템이 생성되었습니다.`,
    createEquipment,
  );

  // 유저 인벤토리에 아이템 생성
  user.player.addItem(createEquipment.code, 1, emptyIndex);

  const sendPayload = {
    success: isSuccess,
    itemCode1: itemCode1,
    itemCode2: itemCode2,
    itemResultCode: createEquipment.code,
    playerId: userId,
  };

  const packet = [config.packetType.S_ITEM_COMBINATION_NOTIFICATION, sendPayload];
  game.broadcast(packet);
};

export default equipmentUpgradeHandler;
