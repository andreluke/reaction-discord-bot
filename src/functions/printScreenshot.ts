import puppeteer from "puppeteer";
import { mapName, filterContent, removeSymbol} from "#functions";

interface IMessage {
    authorAvatarUrl: string;
    authorName: string;
    content: string;
  }
  
  // Função de captura de tela
export async function printScreenshot(messages: IMessage[]) {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  
    const page = await browser.newPage();
  
    await page.setViewport({
      width: 600,
      height: 500 + messages.length * 100, // Ajuste a altura de acordo com o número de mensagens
    });
  
    const messageBlocks = messages
      .map((message: IMessage, index: number) => {
        const authorUsername = mapName(message.authorName);
  
        // Determina se é a primeira mensagem (que será maior) ou uma resposta
        const isFirstMessage = index === 0;
  
        const authorName = removeSymbol(message.authorName);
        let content = removeSymbol(message.content || ""); // Garantir que content nunca seja undefined
  
        content = filterContent(content);
  
        // Aplica a regex de resposta, caso a mensagem siga o padrão '> [Reply to] ...'
        const replyRegex = /^>\s*\[Reply to\].*\n>\s*(.*)\n([^\n]+)/s;
        const match = content.match(replyRegex);
    
        if (match) {
          content = match[2].trim(); // O "real conteúdo" da terceira linha em diante
        }
  
        return `
  <div class="tweet ${isFirstMessage ? "first-tweet" : "reply-tweet"}">
    <div class="tweet-header">
      <div class="avatar" style="background-image: url('${
        message.authorAvatarUrl
      }');"></div>
      <div class="user-info">
        <span class="name">${authorName}</span>
        <span class="username">@${authorUsername}</span>
      </div>
    </div>
    <div class="${isFirstMessage ? "first-tweet-content" : "reply-tweet-content"}">
      ${content}
    </div>
  </div>
      `;
      })
      .join("");
  
    await page.setContent(`
      <html>
    <head>
      <style>
        /* Estilo Geral */
        body {
          font-family: 'Arial', sans-serif;
          background-color: #15202b;
          color: #ffffff;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        .container {
          background-color: #1f2937;
          border-radius: 15px;
          padding: 20px;
          width: 90%;
          max-width: 800px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
          overflow-y: auto;
          height: 80%;
        }
        .tweet {
          display: flex;
          flex-direction: column;
          padding-left: 58px;
          margin-bottom: 20px;
          position: relative;
          background-color: #192734;
          border-radius: 10px;
          padding: 10px;
        }
  
        /* Primeira mensagem (Tweet original) */
        .first-tweet {
          font-size: 18px;
          line-height: 1.6;
          margin-bottom: 20px;
          border-left: 10px solid #1f2925;
          padding-left: 20px;
        }
  
        /* Respostas */
         .first-tweet-content {
          font-size: 18px;
          position: relative;
        }
        .reply-tweet {
          font-size: 14px;
          position: relative;
   
        }
        .reply-line {
          width: 2px;
          height: 100%;
          background-color: #38444d;
          position: absolute;
          left: 34px;
          top: 10px;
          z-index: -1;
        }
  
        /* Cabeçalho do tweet */
        .tweet-header {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        .avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: #657786;
          background-size: cover;
          background-position: center;
          margin-right: 15px;
          
        }
  
        /* Informações do usuário */
        .user-info {
          display: flex;
          flex-direction: column;
        }
        .name {
          font-weight: bold;
          font-size: 1.1em;
        }
        .username {
          color: #8899a6;
          font-size: 0.9em;
        }
  
        /* Conteúdo do tweet */
        .reply-tweet-content {
          font-size: 16px;
          line-height: 1.5;
          color: #d1d8e0;
          margin-left: 10px;
          max-width: 700px;
          word-wrap: break-word;
          margin-top: 5px;
          margin-bottom: 5px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${messageBlocks}
      </div>
    </body>
  </html>
  
    `);
  
    const screenshotPath = `screenshot-${Date.now()}.png`;
  
    await page.screenshot({ path: screenshotPath, fullPage: true });
  
    await browser.close();
    return screenshotPath;
  }