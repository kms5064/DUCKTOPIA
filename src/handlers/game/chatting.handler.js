import { string } from "joi";
import CustomError from "../../utils/error/customError.js";

const chattingHandler = ({ socket, payload }) => {
    const { userId, chatting } = payload;



    if (chatting.length === 0) {
        new CustomError("채팅 내용이 없습니다.");
        return;
    }


}