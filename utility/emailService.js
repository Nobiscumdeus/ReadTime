

/*
const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
require('dotenv').config();


console.log('[DEBUG] MailerSend API Key:', process.env.MAILERSEND_API_KEY ? 'Exists' : 'MISSING');
console.log('[DEBUG] From Email:', process.env.MAILERSEND_FROM_EMAIL || 'Not set');
console.log('[DEBUG] Client URL:', process.env.CLIENT_URL || 'Not set');

const mailersend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY
});
*/


/*
exports.sendVerificationEmail = async (email, verificationToken) => {
  console.log('\n[DEBUG] Attempting to send verification email to:', email);
  
  try {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    console.log('[DEBUG] Verification URL:', verificationUrl);

    const sentFrom = new Sender(
      process.env.MAILERSEND_FROM_EMAIL,
      process.env.MAILERSEND_FROM_NAME
    );
    console.log('[DEBUG] Sender configured:', sentFrom);

    const recipients = [new Recipient(email, "ReadTime User")];
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject("Verify Your Email - ReadTime")
      .setHtml(`<p>Test verification link: <a href="${verificationUrl}">Verify</a></p>`)
      .setText(`Verify: ${verificationUrl}`);

    console.log('[DEBUG] Sending email...');
    const response = await mailersend.email.send(emailParams);
    console.log('[DEBUG] MailerSend response:', response);
    
    return true;
  } catch (error) {
    console.error('[ERROR] MailerSend error:', error.response?.data || error.message);
    return false;
  }
};

/*
const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
require('dotenv').config();

const mailersend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY // Note: apiKey (not api_key)
});

exports.sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
  
  // Create sender (from address)
  const sentFrom = new Sender(
    process.env.MAILERSEND_FROM_EMAIL || "noreply@yourdomain.com",
    process.env.MAILERSEND_FROM_NAME || "ReadTime"
  );

  // Create recipients
  const recipients = [
    new Recipient(email, "ReadTime User")
  ];

  // Email content
  const htmlContent = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #4285f4; text-align: center;">Verify Your Email Address</h2>
      <p>Thank you for registering with ReadTime. Please verify your email:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #4285f4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Verify Email</a>
      </div>
      <p>Or paste this link in your browser:</p>
      <p style="word-break: break-all; color: #4285f4;">${verificationUrl}</p>
      <p>Link expires in 24 hours.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #777; text-align: center;">© ${new Date().getFullYear()} ReadTime</p>
    </div>
  `;

  const textContent = `Verify your email: ${verificationUrl}`;

  // Build email parameters
  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject("Verify Your Email - ReadTime")
    .setHtml(htmlContent)
    .setText(textContent);

  try {
    await mailersend.email.send(emailParams); // Note: mailersend.email.send()
    return true;
  } catch (error) {
    console.error('MailerSend error:', error);
    return false;
  }
};

*/
/*

exports.sendVerificationEmail = async (email, verificationToken, maxRetries = 3) => {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    let attempt = 0;
    let lastError = null;
  
    // Log initial attempt
    console.log(`[EMAIL] Attempting to send verification to ${email}`, {
      attempt: attempt + 1,
      maxRetries,
      verificationUrl
    });
  
    while (attempt < maxRetries) {
      attempt++;
      try {
        const sentFrom = new Sender(
          process.env.MAILERSEND_FROM_EMAIL,
          process.env.MAILERSEND_FROM_NAME
        );
  
        const recipients = [new Recipient(email, "ReadTime User")];
        const emailParams = new EmailParams()
          .setFrom(sentFrom)
          .setTo(recipients)
          .setSubject("Verify Your Email - ReadTime")
          .setHtml(`
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Verify Your Email</h2>
              <p>Click the link below to verify your email address:</p>
              <a href="${verificationUrl}" 
                 style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 4px;">
                Verify Email
              </a>
              <p style="margin-top: 20px; color: #6b7280;">
                Or copy this link: ${verificationUrl}
              </p>
            </div>
          `)
          .setText(`Please verify your email by visiting: ${verificationUrl}`);
  
        console.log(`[EMAIL] Sending attempt ${attempt}...`);
        const response = await mailersend.email.send(emailParams);
        
        console.log('[EMAIL] Send successful', {
          messageId: response?.headers?.['x-message-id'],
          status: response?.status
        });
        return true;
  
      } catch (error) {
        lastError = error;
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
        
        console.error(`[EMAIL] Attempt ${attempt} failed`, {
          error: error.message,
          response: error.response?.data,
          retryIn: `${waitTime/1000}s`
        });
  
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, waitTime));
          console.log(`[EMAIL] Retrying (${attempt + 1}/${maxRetries})...`);
        }
      }
    }
  
    console.error('[EMAIL] All attempts failed', {
      email,
      lastError: lastError?.message,
      responseData: lastError?.response?.data
    });
    return false;
  };

  */
 /*
  exports.sendVerificationEmail = async (email, verificationToken, maxRetries = 3) => {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    let attempt = 0;
    let lastError = null;
  
    // Validate essential configuration first
    if (!process.env.MAILERSEND_API_KEY) {
      console.error('[EMAIL] Missing MailerSend API key');
      return false;
    }
  
    if (!process.env.MAILERSEND_FROM_EMAIL) {
      console.error('[EMAIL] Missing sender email address');
      return false;
    }
  
    while (attempt < maxRetries) {
      attempt++;
      try {
        console.log(`[EMAIL] Attempt ${attempt}/${maxRetries} to ${email}`);
  
        const sentFrom = new Sender(
          process.env.MAILERSEND_FROM_EMAIL,
          process.env.MAILERSEND_FROM_NAME || 'ReadTime'
        );
  
        const recipients = [new Recipient(email, "ReadTime User")];
        const emailParams = new EmailParams()
          .setFrom(sentFrom)
          .setTo(recipients)
          .setSubject("Verify Your Email - ReadTime")
          .setHtml(`<p>Verify: <a href="${verificationUrl}">${verificationUrl}</a></p>`)
          .setText(`Verify: ${verificationUrl}`);
  
        // Add timeout to the request
        const response = await mailersend.email.send(emailParams, { timeout: 5000 });
        
        console.log('[EMAIL] Send successful', {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
        return true;
  
      } catch (error) {
        lastError = error;
        
        // Enhanced error logging
        console.error(`[EMAIL] Attempt ${attempt} failed`, {
          error: {
            message: error.message,
            code: error.code,
            stack: error.stack
          },
          response: {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers
          },
          config: {
            url: error.config?.url,
            method: error.config?.method
          }
        });
  
        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000;
          console.log(`[EMAIL] Waiting ${waitTime/1000}s before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
  
    console.error('[EMAIL] All attempts failed', {
      email,
      lastError: lastError ? {
        message: lastError.message,
        code: lastError.code,
        stack: lastError.stack
      } : 'Unknown error - no error object captured'
    });
  
    return false;
  };
  */



/*
//-------------------------------------------------------------second -------------------------

  const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
require('dotenv').config();

// Initialize MailerSend - NOTE THE CASE SENSITIVITY
const mailersend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY // MUST be "apiKey" (not api_key)
});

exports.sendVerificationEmail = async (email, verificationToken, maxRetries = 3) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
  
  // Validate configuration
  if (!process.env.MAILERSEND_API_KEY) {
    console.error('[EMAIL] Missing MailerSend API key');
    return false;
  }

  if (!process.env.MAILERSEND_FROM_EMAIL) {
    console.error('[EMAIL] Missing sender email address');
    return false;
  }

  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    try {
      console.log(`[EMAIL] Attempt ${attempt}/${maxRetries} to ${email}`);

      // Create email parameters - NOTE THE NEW SYNTAX
      const emailParams = new EmailParams()
        .setFrom(new Sender(process.env.MAILERSEND_FROM_EMAIL, process.env.MAILERSEND_FROM_NAME))
        .setTo([new Recipient(email)])
        .setSubject("Verify Your Email - ReadTime")
        .setHtml(`<p>Click to verify: <a href="${verificationUrl}">Verify Email</a></p>`)
        .setText(`Verify your email: ${verificationUrl}`);

      // Send email - NOTE THE METHOD CHANGE
      const response = await mailersend.email.send(emailParams);
      
      console.log('[EMAIL] Send successful', response);
      return true;

    } catch (error) {
      console.error(`[EMAIL] Attempt ${attempt} failed`, {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  console.error('[EMAIL] All attempts failed');
  return false;
};


*/


const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
require('dotenv').config();

const mailersend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY
});

exports.sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
  const maxRetries = 2; // Retry twice (total 3 attempts)
  let attempt = 0;

  while (attempt <= maxRetries) {
    attempt++;
    try {
      console.log(`[EMAIL] Attempt ${attempt} to ${email}`);
      
      /*
      const emailParams = new EmailParams()
        .setFrom(new Sender(
          process.env.MAILERSEND_FROM_EMAIL,
          process.env.MAILERSEND_FROM_NAME || 'ReadTime App'
        ))
        .setTo([new Recipient(email)])
        .setSubject("Verify Your Email")
        .setHtml(`<p>Click to verify: <a href="${verificationUrl}">Verify Email</a></p>`)
        .setText(`Verify: ${verificationUrl}`);
        */
        const emailParams = new EmailParams()
        .setFrom(new Sender(
          process.env.MAILERSEND_FROM_EMAIL,
          process.env.MAILERSEND_FROM_NAME || 'ReadTime App'
        ))
        .setTo([new Recipient(email)])
        .setSubject("Complete Your ReadTime Account Verification")
        .setHtml(`
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to ReadTime!</h2>
            <p>Thank you for registering. Please verify your email address to complete your account setup.</p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #4CAF50; 
                        color: white; 
                        padding: 12px 24px; 
                        text-decoration: none; 
                        border-radius: 4px;
                        font-weight: bold;
                        display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${verificationUrl}</p>
            
            <p>If you didn't request this, please ignore this email.</p>
            
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #777;">
              © ${new Date().getFullYear()} ReadTime App. All rights reserved.
            </p>
          </div>
        `)
        .setText(`
          Welcome to ReadTime!
          
          Please verify your email address by visiting this link:
          ${verificationUrl}
          
          If you didn't request this, please ignore this email.
          
          © ${new Date().getFullYear()} ReadTime App
        `);



      const response = await mailersend.email.send(emailParams, { timeout: 8000 });
      
      console.log('[EMAIL] Sent successfully');
      return true;

    } catch (error) {
      console.error(`[EMAIL] Attempt ${attempt} failed:`, error.message);
      
      if (attempt <= maxRetries) {
        const delay = 1000 * attempt; // 1s, then 2s delay
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error; // Throw after final attempt
    }
  }
};