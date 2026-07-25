export const templeteString =  (email: string, code: number) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Binance Activation Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #000;
            padding: 20px;
            text-align: center;
        }
        .header img {
            max-width: 150px;
        }
        .content {
            padding: 20px;
        }
        .content h1 {
            font-size: 20px;
            color: #000;
        }
        .content p {
            color: #555;
            line-height: 1.6;
        }
        .activation-code {
            font-size: 26px;
            font-weight: bold;
            color: #2d8a37;
            text-align: center;
            margin: 20px 0;
        }
        .security-tips ul {
            padding-left: 20px;
        }
        .security-tips li {
            margin: 10px 0;
            font-size: 14px;
            color: #333;
        }
        .footer {
            background-color: #f4f4f4;
            padding: 10px 20px;
            text-align: center;
            font-size: 12px;
            color: #777;
        }
        a {
            color: #007bff;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://i.ibb.co.com/SBRSc82/storage-emulated-0-Pictures-Canva-IMG-20241015-213158.png" alt="rumble Logo">
        </div>
        <div class="content">
            <h1>Dear ${email} </h1>
            <p>Thnaks for choosing rumble 😇. Confirm your registration by using the activation code below.</p>
            <div class="activation-code">${code}</div>
            <div class="security-tips">
                <h2>Security Tips:</h2>
                <ul>
                    <li>Never give your password to anyone.</li>
                    <li>Never call any phone number from someone claiming to be Rumble Customer Support.</li>
                    <li>Never send any money to anyone claiming to be a member of the Rumble team.</li>
                    <li>Enable <a href="#">Google Two-Factor Authentication</a>.</li>
                    <li>Set up your <a href="#">anti-phishing code</a> to add an extra layer of security to your account.</li>
                </ul>
            </div>
            <p>If you don’t recognize this activity, please <a href="#">reset your password</a> and contact <a href="#">customer support</a> immediately.</p>
            <p>This is an automated message, please do not reply.</p>
        </div>
        <div class="footer">
            <p>Stay connected!</p>
        </div>
    </div>
</body>
</html>`
}