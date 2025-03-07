# node 베이스 이미지에서 시작
FROM node

# user/ducktopia 폴더 생성 후 여기서 작업
WORKDIR /user/ducktopia

# package.json 복사
COPY package.json ./

# pm2 전역 설치
RUN npm install pm2 -g

# node_modules 생성
RUN npm install

# 디렉토리 폴더 구조 복사
COPY ./ ./

# pm2로 서버 실행
CMD ["pm2", "1.src_gateway/server.js"]