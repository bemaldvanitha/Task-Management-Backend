const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const sequelize = require('./db/db');
const User = require('./models/User');
const UserType = require('./models/UserType');
const Task = require('./models/Task');
const AuditLog = require('./models/AuditLog');
const Action = require('./models/Action');
const Status = require('./models/Status');
const Priority = require('./models/Priority');
const AuditLogDetail = require('./models/AuditLogDetail');
const Field = require('./models/Field');
const adminRoutes = require("./routes/AdminRoutes");

dotenv.config();

const PORT = process.env.PORT || 3002;

const app = express();

app.use(express.json({ strict: false }));

app.use(cors());

app.use(cookieParser());

const syncAllModels = async () => {
    await sequelize.sync();
    await User.sync();
    await UserType.sync();
    await Priority.sync();
    await Action.sync();
    await Status.sync();
    await Task.sync();
    await AuditLog.sync();
    await Field.sync();
    await AuditLogDetail.sync();
}

//syncAllModels();

app.use('/', adminRoutes);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});