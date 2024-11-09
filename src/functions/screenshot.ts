import puppeteer from "puppeteer";

export default async function takeScreenshot(
    previousMessageContent: string,
    previousUserName: string,
    currentMessageContent: string,
    currentUserName: string,
    previousImageUrl: string | null,
    previousProfileImageUrl: string,
    currentImageUrl: string | null,
    currentProfileImageUrl: string,
    isPrivateQuote?: boolean
  ) {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  
    const page = await browser.newPage();
  
    await page.setViewport({
      width: 600,
      height: 400,
    });
  
    await page.setContent(`
      <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              padding: 20px;
              background-color: #15202b;
              color: #ffffff;
              display: flex;
              align-items: center;
            }
            .tweet-container {
              width: 600px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #38444d;
              border-radius: 10px;
              background-color: #192734;
            }
            .tweet-header {
              display: flex;
              align-items: center;
              margin-bottom: 10px;
            }
            .avatar {
              width: 48px;
              height: 48px;
              border-radius: 50%;
              margin-right: 10px;
              background-color: #657786;
              background-size: cover;
              background-position: center;
            }
            .tweet-content {
              font-size: 18px;
              line-height: 1.5;
              margin-bottom: 10px;
            }
            .tweet-footer {
              display: flex;
              justify-content: space-between;
              color: #8899a6;
            }
            .tweet-image {
              margin-top: 10px;
              margin-bottom: 10px;
              width: 100%;
              height: auto; /* Mantém a proporção da imagem */
              border-radius: 10px;
            }
            .quote-container {
              margin-top: 15px;
              padding: 15px;
              border: 1px solid #38444d;
              border-radius: 10px;
              background-color: #253341;
              margin-bottom: 10px
            }
            .quote-header {
              display: flex;
              align-items: center;
              margin-bottom: 10px;
            }
            .quote-avatar {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              margin-right: 10px;
              background-color: #657786;
              background-size: cover;
              background-position: center;
            }
            .quote-content {
              font-size: 16px;
            }
            .user-info{
            display: flex;
            flex-direction: row;
            align-items: center;
            }
            .private{
            font-size: 25;
            color: yellow;
            margin-left: 8
            }
          </style>
        </head>
        <body>
          <div class="tweet-container">
            <div class="tweet-header">
              <div class="avatar" style="background-image: url('${currentProfileImageUrl}');"></div>
              <div class="user-info">
                <span class="name">${currentUserName}</span>
                ${
              isPrivateQuote
                // eslint-disable-next-line quotes
                ? `<span class="private">☆</span>`
                : ""
            }
              </div>
            </div>
            <div class="tweet-content">
              ${currentMessageContent}
            </div>
            ${
              currentImageUrl
                ? `<img class="tweet-image" src="${currentImageUrl}" alt="Imagem da mensagem atual" />`
                : ""
            }
  
            <div class="quote-container">
              <div class="quote-header">
                <div class="quote-avatar" style="background-image: url('${previousProfileImageUrl}');"></div>
                <div class="user-info">
                  <span class="name">${previousUserName}</span>
                </div>
              </div>
              <div class="quote-content">
                ${previousMessageContent}
              </div>
              ${
                previousImageUrl
                  ? `<img class="tweet-image" src="${previousImageUrl}" alt="Imagem da mensagem citada" />`
                  : ""
              }
            </div>
  
            <div class="tweet-footer">
              <span>${new Date().toLocaleTimeString()} · ${new Date().toLocaleDateString()}</span>
              <span>Twitter Web App</span>
            </div>
          </div>
        </body>
      </html>
    `);
  
    const screenshotPath = `screenshot-${Date.now()}.png`;
  
    await page.screenshot({ path: screenshotPath, fullPage: true });
  
    await browser.close();
    return screenshotPath;
  }