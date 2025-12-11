const cron = require('node-cron');
const BorrowModel = require('./models/BorrowModel');
const User = require('./models/UserModel');
const sendEmail = require('./middlewares/emailSender');

const scheduleReminders = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Running daily reminder job at 8 AM');

    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + 3); // 3 days from today
    targetDate.setHours(0, 0, 0, 0);

    try {
      const upcomingReturns = await BorrowModel.find({
        status: 'approved',
        dueDate: {
          $gte: targetDate,
          $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
        }
      }).populate('fromUser').populate('book');

      for (const request of upcomingReturns) {
        const borrower = request.fromUser;
        const book = request.book;

        const subject = `⏳ Reminder: "${book.title}" is due in 3 days`;
        const text = `Hi ${borrower.name},\n\nJust a friendly reminder that "${book.title}" is due on ${request.dueDate.toDateString()}.\n\nPlease plan accordingly.`;

        await sendEmail(borrower.email, subject, text);
      }

      console.log(`📩 Sent ${upcomingReturns.length} reminder(s).`);
    } catch (error) {
      console.error('Error in scheduled reminder:', error);
    }
  });
};

module.exports = scheduleReminders;
