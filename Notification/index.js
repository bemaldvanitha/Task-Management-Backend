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
const Notification = require('./models/Notification');
const notificationRoutes = require("./routes/NotificationRoutes");

require('./Schedule/ScheduleNotifications');

dotenv.config();

const PORT = process.env.PORT || 3003;

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
    await Notification.sync();
}

//syncAllModels();

app.use('/', notificationRoutes);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});