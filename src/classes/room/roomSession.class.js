import { maxMonsterCount } from "../../config/constants/monster.js";
import { getGameAssets } from "../../init/assets.js";
import { v4 as uuidV4 } from "uuid";
import Monster from "../monster/monster.class.js";
import { packetNames } from "../../protobuf/packetNames.js";

class roomSession {

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
            this.addMonsterAfterGameStart();
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
                this.monsterDisCovered();
                this.monsterMove(latency);
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

    //몬스터의 루프가 돌아가고 있을 때 이걸 체크해 보도록 하자.
    monsterMove(latency) {
        for (const [key, monster] of this.globalMonsters) {
            if (!monster.hasPriorityPlayer()) {
                continue;
            }
            else {
                monster.moveByLatency(latency);//S2CMonsterMoveNotification을 보낸다

                const monsterMovePayload = {
                    monsterId : monster.id,
                    x : monster.x,
                    y : monster.y
                }
                const packet = createResponse(packetNames[11], monsterMovePayload);
                this.game.broadcast(packet);
            }
        }
    }


    monsterDisCovered() {
        for (const [key, monster] of this.globalMonsters) {
            if (!monster.hasPriorityPlayer()) {
                for (const [key, player] of this.playerList) {
                    monster.setTargetPlayer(player);
                }
            }
        }
    }

    monsterLostPlayerCheck()
    {
        for (const [key, monster] of this.globalMonsters) {
            if (monster.hasPriorityPlayer()) {
                monster.lostPlayer();
            }
        }
    }


}

export default roomSession;