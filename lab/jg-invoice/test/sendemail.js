var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ardhi.rofi@gmail.com',
    pass: 'passwrodna naon cik'
  }
});

var mailOptions = {
  from: 'ardhi.rofi@gmail.com',
  to: 'ardhi.rofi@gmail.com', //'myfriend@yahoo.com, myotherfriend@yahoo.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!' //could send html html: '<h1> welcome</h1>'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
  transporter.close();
});
