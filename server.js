const app = require('./index');
const { sequelize } = require('./db');
const seed = require('./db/seedFn');
const seedData = require('./db/seedData');

const { PORT = 4000 } = process.env;

app.listen(PORT, async () => {
  sequelize.sync({ force: false });
  // await seed();
  console.log(`Jokes are ready at http://localhost:${PORT}`);
});