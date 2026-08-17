module.exports = {
  apps: [
    {
      name: "millwal-web",
      script: "pnpm",
      args: "--filter @kiralama/web start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "millwal-api",
      script: "pnpm",
      args: "--filter @kiralama/api start",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    }
  ],
};
