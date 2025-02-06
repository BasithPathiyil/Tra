const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "basithpathiyil007@gmail.com",
    pass: "capjtqddpthnmusf",
  },
});

const sendConsolidationsEmail = async (body, res) => {
  const { stocks } = body;
  const mailOptions = {
    from: "basithpathiyil007@gmail.com",
    to: "basithpathiyil7@gmail.com",
    subject: "Consolidation",
    text: `Stocks: ${stocks}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("error", error);
      return;
    }
    // res.status(200).send("Email sent: " + info.response);
  });
};

module.exports = {
  sendConsolidationsEmail,
};
