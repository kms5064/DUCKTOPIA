const InitServer = async () => {
  try {
    await loadGameAssets();
    // await loadProtos();
  } catch (err) {
    console.error(err);
  }
};

export default InitServer;