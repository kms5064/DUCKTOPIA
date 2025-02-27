const latencyCheckHandler = ({ socket, payload, userId }) => {
  console.log('오냐?');
  if (userId !== -1) return;
  const { errorMessage, timestamp } = payload;
  const latency = Date.now() - timestamp;
  console.log(
    `###Latency### ${errorMessage} 와의 총 왕복 시간${latency} / 평균 Latency ${latency / 2}`,
  );
};

export default latencyCheckHandler;
