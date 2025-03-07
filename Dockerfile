# node 베이스 이미지에서 시작
FROM node

# user/ducktopia 폴더 생성 후 여기서 작업
WORKDIR /user/ducktopia

# package.json 복사
COPY package.json ./

# node_modules 생성
RUN npm install

# pm2 전역 설치
#RUN npm install pm2 -g
RUN npm rebuild bcrypt --build-from-source

# 디렉토리 폴더 구조 복사
COPY ./ ./

EXPOSE 5555

# pm2로 서버 실행
# CMD ["pm2", "start","1.src_gateway/server.js"]
CMD ["node", "1.src_gateway/server.js"]

