import { loadGameAssets, getGameAssets } from "../src/init/assets.js"

const minifactory = new miniMonsterFactory();

//데이터베이스에 불러오기 전에 이런 형태로 관리하면 될 듯 하다.
const test = async () => {
    await loadGameAssets();
    const asset = getGameAssets();
    const finding = asset.monster.data.find((data)=>data.level === 5);
    const goblin = minifactory.createMonster("hello", 1, 1);
    goblin.getstatus(finding.hp, finding.attack, finding.defence);
    console.log(goblin.monsterDeath());



    console.log(finding);
}

test();

