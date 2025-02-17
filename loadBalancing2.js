import cluster from 'cluster';
import http from 'http';
import os from 'os';

const numCPUs = os.cpus().length; //25
let currentWorkerIndex = 0;
const workers = [];

if (cluster.isMaster) {
  console.log(`Master process is running with PID ${process.pid}`);

  // 워커 프로세스를 CPU 수만큼 포크
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    workers.push(worker);
  }

  // 워커가 죽었을 때 새로운 워커를 포크
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    const newWorker = cluster.fork();
    workers.push(newWorker);
  });

  // HTTP 서버는 마스터가 아닌 워커가 처리하도록 분배
  http
    .createServer((req, res) => {
      console.log('## 1');
      // 순차적으로 워커에게 요청을 분배
      const worker = workers[currentWorkerIndex];
      currentWorkerIndex = (currentWorkerIndex + 1) % numCPUs; // 순차적으로 분배

      // 워커에게 전달할 데이터만 선별하여 전송
      const message = {
        url: req.url,
        method: req.method,
        headers: req.headers,
      };

      // 워커에게 요청 정보만 전달 (res는 포함하지 않음)
      worker.send({ message });
      console.log('## 1-1');
      // 워커에게 응답 처리 위임
      worker.on('message', (response) => {
        console.log('## 1-2');
        res.writeHead(response.statusCode, response.headers);
        res.end(response.body);
      });
    })
    .listen(8080);
} else {
  console.log('## 2');
  // 각 워커 프로세스가 HTTP 서버를 처리
  process.on('message', (message) => {
    console.log('## 2-1');
    const { message: requestData } = message;

    // 요청 처리 로직
    const response = {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: `Game Server is running : Worker(${process.pid}), Request URL: ${requestData.url}`,
    };
    console.log('## 2-3');
    // 마스터에게 응답 정보 전송
    process.send(response);
  });

  console.log(`Worker ${process.pid} started`);
}
