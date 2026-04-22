const app = require('./src/app');
const sequelize = require('./src/config/database');
const env = require('./src/config/env');

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Sync models (don't alter/drop in production)
    await sequelize.sync({ alter: false });
    console.log('✓ Database models synchronized');

    // Start server
    const port = env.port;
    app.listen(port, () => {
      console.log(`✓ Server running on port ${port}`);
      console.log(`✓ API: http://localhost:${port}/api/v1`);
    });
  } catch (error) {
    console.error('✗ Server startup error:', error);
    process.exit(1);
  }
};

startServer();
