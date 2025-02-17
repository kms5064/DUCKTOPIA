import cluster from 'cluster';
import http from 'http';
import os from 'os';

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master process is running with PID ${process.pid}`);

  // 워커 프로세스를 코어 수만큼 포크
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // 워커가 죽었을 때 새로 포크
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  // 각 워커 프로세스가 동일한 포트에 서버를 실행
  const server = http.createServer((req, res) => {
    console.log(`process.pid :  ${process.pid}`);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Game Server is running : Worker(${process.pid})`);
  });

  // 마스터 프로세스가 포트에 바인딩하게 해야 한다
  server.listen(8080, () => {
    console.log(`Worker ${process.pid} started and listening on port 8080`);
  });
}
