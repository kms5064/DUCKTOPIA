const broadcast = (users, packet) => {
  if (Array.isArray(users)) {
    // user가 담긴 배열
    for (const user of users) {
      user.socket.write(packet);
    }
  } else if (users instanceof Map) {
    // Map 형식일 때
    for (const [socket, user] of users) {
      socket.write(packet);
    }
  }
};

export default broadcast;
