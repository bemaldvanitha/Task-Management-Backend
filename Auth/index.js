const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const sequelize = require('./db/db');
const User = require('./models/User');
const UserType = require('./models/UserType');
const authRoutes = require("./routes/AuthRoute");

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json({ strict: false }));

app.use(cors());

app.use(cookieParser());

const syncAllModels = async () => {
    await sequelize.sync();
    await User.sync();
    await UserType.sync();
}

//syncAllModels();

app.use('/', authRoutes);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});