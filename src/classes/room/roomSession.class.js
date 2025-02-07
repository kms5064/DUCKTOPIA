import { maxMonsterCount } from "../../config/constants/monster.js";
import { getGameAssets } from "../../init/assets.js";
import { v4 as uuidV4 } from "uuid";
import Monster from "../monster/monster.class.js";
import { packetNames } from "../../protobuf/packetNames.js";

//일단 룸 세션에서 루프를 돌리고 있지만 게임 세션을 돌려야 할 수도 있다.
//게임이 시작되는 
class RoomSession {

    constructor() {
        this.globalMonsters = new Map();
        this.playerList = new Map();//유저 id가 키이고 user를 집어넣자.
        this.monsterAssets = getGameAssets().monster;
        this.maxStageX = 1000;
        this.maxStageY = 1000;
        this.centerStageX = 100;
        this.centerStageY = 100;
        this.game = null;
        this.gameLoop = null;
        this.lastUpdate = 0;
        
    }


    //게임이 시작되었을 때 몬스터들이 랜덤하게 배치되도록 한다.
    addMonsterAfterGameStart() {
        //중간 지점이 플레이어라고 가정하고 중간 지점에서 벗어난 위치들에 몬스터를 생성하도록 한다.
        while (this.globalMonsters.size < maxMonsterCount) {
            const vecX = Math.floor(Math.random() * 2) === 1 ? 1 : -1;
            const vecY = Math.floor(Math.random() * 2) === 1 ? 1 : -1;
            const id = uuidV4();

            const summonX = vecX * (Math.random() * (this.maxStageX - this.centerStageX) + this.centerStageX);
            const summonY = vecY * (Math.random() * (this.maxStageY - this.centerStageY) + this.centerStageY);

            const monsterCode = Math.floor(Math.random() * this.monsterAssets.data.length);
            const monsterInfo = this.monsterAssets.data[monsterCode];

            const newMonster = new Monster(id, monsterCode, summonX, summonY, monsterInfo.range, monsterInfo.speed);
            this.globalMonsters.set(id, newMonster);

        }
    }

    addPlayer(socket, player) {
        this.playerList.set(socket, player);
    }

    addGame(game) {
        if (!this.game) {
            this.game = game;
            this.game.addRandomAllMonsterAfterGameStart();
            this.game.gameLoopStart();
            this.lastUpdate = Date.now();
            if(this.gameLoop !== null)
            {
                clearInterval(this.gameLoop);
                this.gameLoop = null;
            }
        }

    }

    //게임 시작 버튼을 눌렀을 때 이 함수를 사용한다.
    //이걸 통해서 gameLoop가 돌아가도록 한다.
    gameLoopStart()
    {
        
        //일단 게임이 시작되었을 때 이 루프가 시작되도록 할 거니까
        //일단은 서버 측에서 레이턴시를 관리하는데 클라이언트의 레이턴시를 참고하는 방법도 고려해 보자.
        this.gameLoop = setInterval(() => {
            if(!this.game)
            {
                

                clearInterval(this.gameLoop);
                this.gameLoop = null;
            }
            else
            {
                const now = Date.now();
                const latency = now - this.lastUpdate;
                this.lastUpdate = Date.now();
                //업데이트를 보낼 때마다 
                //몬스터가 플레이어를 발견하는 과정
                this.monsterDisCovered();
                //
                this.monsterMove(latency);
                //몬스터가 플레이어를 잃는 과정
                this.monsterLostPlayerCheck();
            }
        }, 60);
    }

    removeGame() {
        if (this.game !== null) {
            this.game = null;
        }
    }

    findPlayerBySocket(socket) {
        return this.playerList.get(socket);
    }

}

export default RoomSession;