const sgMail = require("@sendgrid/mail");

const sendEmail = (user, forgetCode, fingerprint) => {
  try {
    sgMail.setApiKey(
      "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"
    );
    const msg = {
      to: user.email, // Change to your recipient
      from: "info@99logitech.com", // Change to your verified sender
      subject: `Hi ${user.username} Please Reset Your Password`,
      text: "Here is your reset code , Enter this fo verify",
      html: `<strong>Your verification link is https://www.vyzmo.com/reset?value=${fingerprint}&generated=${user._id}&user=${forgetCode}</strong>`,
    };

    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error.response.body);
      });
  } catch (err) {
    console.log(err);
  }
};

const sendSignUpAuthToUser = async (userEmail, authURL) => {
  console.log("----- Sending Email -----");
  try {
    sgMail.setApiKey(
      "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"
    );
    const msg = {
      to: userEmail, // Change to your recipient
      from: "info@99logitech.com", // Change to your verified sender
      subject: `Hi ${userEmail} Confirm your email`,
      text: "Here is your reset code , Enter this fo verify",
      html: `<!DOCTYPE html>
<html>
<head>

  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <title>Email Confirmation</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">


</head>
<body style="background-color: #e9ecef;">



  <!-- start body -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%">

    <!-- start logo -->
    <tr>
      <td align="center" bgcolor="#e9ecef">

        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
          <tr>
            <td align="center" valign="top" style="padding: 36px 24px;">
              <a href="https://www.vyzmo.com" target="_blank" style="display: inline-block; color:#1a82e2 ;">
                <img src="https://www.ads.vyzmoer.com/static/media/logo.ecaf480c.png" alt="Logo" border="0" width="48" style="display: block; width: 48px; max-width: 48px; min-width: 48px;">
              </a>
            </td>
          </tr>
        </table>

      </td>
    </tr>
    <!-- end logo -->

    <!-- start hero -->
    <tr>
      <td align="center" bgcolor="#e9ecef">

        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
          <tr>
            <td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">Confirm Your Email Address</h1>
            </td>
          </tr>
        </table>

      </td>
    </tr>
    <!-- end hero -->

    <!-- start copy block -->
    <tr>
      <td align="center" bgcolor="#e9ecef">

        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">

          <!-- start copy -->
          <tr>
            <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
              <p style="margin: 0;">Tap the button below to confirm your email address. If you didn't create an account with <a href="https://Vyzmo.com" style="color:#1a82e2 ">Vyzmo</a>, you can safely delete this email.</p>
            </td>
          </tr>
          <!-- end copy -->

          <!-- start button -->
          <tr>
            <td align="left" bgcolor="#ffffff">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" bgcolor="#ffffff" style="padding: 12px;">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" bgcolor="#1a82e2" style="border-radius: 6px;">
                          <a href="${authURL}" target="_blank" style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;">Verify Email</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- end button -->

          <!-- start copy -->
          <tr>
            <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
              <p style="margin: 0;">If that doesn't work, copy and paste the following link in your browser:</p>
              <p style="margin: 0;"><a href="#" target="_blank" style="color: #1a82e2;">https://www.vyzmo.com/signup</a></p>
            </td>
          </tr>
          <!-- end copy -->

          <!-- start copy -->
          <tr>
            <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf">
              <p style="margin: 0;  ">Cheers,</p><br><a href="https://www.vyzmo.com" style="color: #1a82e2;" >Vyzmo</a>
            </td>
          </tr>
          <!-- end copy -->

        </table>

      </td>
    </tr>


        </table>

      </td>
    </tr>
    <!-- end footer -->

  </table>
  <!-- end body -->

</body>
</html>`,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("----- Verification Email is sent -----");
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (e) {
    console.trace(e);
  }
};

module.exports = { sendEmail, sendSignUpAuthToUser };

// sendSignUpAuthToUser("rishat.5081@gmail.com", "sadksa");
