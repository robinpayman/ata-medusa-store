module.exports = {
  apps: [
    {
      name: "medusa-backend",
      cwd: "./apps/backend",
      script: "npm",
      args: "run dev",
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
      },
      error_file: "../logs/medusa-error.log",
      out_file: "../logs/medusa-out.log",
      log_file: "../logs/medusa-combined.log",
      time: true,
    },
    {
      name: "storefront",
      cwd: "./apps/storefront",
      script: "npm",
      args: "run dev",
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
      },
      error_file: "../logs/storefront-error.log",
      out_file: "../logs/storefront-out.log",
      log_file: "../logs/storefront-combined.log",
      time: true,
    },
  ],
};
