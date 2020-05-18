const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        from: 'monikasahai03@gmail.com',
        to: email,
        subject: 'Welcome to Task Manager App.',
        text: `Welcome to the Task Manager App, ${name}. Thanks for signing up.`
    });
};

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        from: 'monikasahai03@gmail.com',
        to: email,
        subject: 'We are sad to see you go!',
        text: `Hi ${name}, \nYou have been successfully unsubscribed from Task Manager app. Please let us know what can we do to improve.`
    });
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
};