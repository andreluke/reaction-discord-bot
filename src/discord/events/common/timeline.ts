import { Event } from "#base";
import { Client, EmbedBuilder, GatewayIntentBits, NewsChannel, TextChannel } from "discord.js";
import fs from "fs";
import puppeteer from "puppeteer";

const TARGET_USER_ID = process.env.TARGET_USER_ID?.substring(0, 2);
const TARGET_USER_ID2 = process.env.TARGET_USER_ID2?.substring(0, 2);
const TARGET_CATEGORY_ID = process.env.TARGET_CATEGORY_ID;
const TARGET_CATEGORY_ID2 = process.env.TARGET_CATEGORY_ID2;
const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID;
const privateAcc: string[] = ["🔐 [PRIV ACC]", "[🔒]", "[ priv ]", "🔒 "];
const BOT_TOKEN = process.env.BOT_TOKEN;
const REJECTED_USERNAMES = ["testBot", "ReactionBot", "twitter"];

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

const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessageReactions,
    ],
  });

  client.login(BOT_TOKEN);

new Event({
    name: "Timeline",
    event: "messageCreate",
    async run(message) {
        if (message.guild) {
            const messageAuthorIdStart = message.author.id.substring(0, 2);
        
            if (
                (messageAuthorIdStart === TARGET_USER_ID || messageAuthorIdStart === TARGET_USER_ID2) &&
                !REJECTED_USERNAMES.includes(message.author.username)
              ) {
              const channel = message.channel;
        
              if (channel.isTextBased() && "parent" in channel) {
                const guild = message.guild;
                const freshChannel = await guild.channels.fetch(channel.id);
                const category = freshChannel?.parent;
        
                if (!category) {
                  return;
                }
        
                if (category.id === TARGET_CATEGORY_ID || category.id === TARGET_CATEGORY_ID2) {
                  setTimeout(async () => {
                    
                    const targetChannel = client.channels.cache.get(TARGET_CHANNEL_ID);
                
                    if (
                      targetChannel instanceof TextChannel ||
                      targetChannel instanceof NewsChannel
                    ) {
                      const userAvatarURL = message.author.displayAvatarURL();
                      const userName = message.author.username;
                      let content = message.content;
        
                      const replyRegex = /^>\s*\[Reply to\].*\n>\s*(.*)\n([^\n]+)/s; // Captura o que vier na linha após o segundo '>' e a terceira linha em diante
                      const match = content.match(replyRegex);
                      let secondArrow: string | null = null;
        
                      if (match) {
                        secondArrow = match[1].trim(); // O conteúdo imediatamente após o segundo '>'
                        content = match[2].trim(); // O "real conteúdo" da terceira linha em diante
                      } 
        
                      const messageLink = `https://discord.com/channels/${message.guild?.id}/${message.channel.id}/${message.id}`;
        
                      const embed = new EmbedBuilder()
                        .setColor("#8b8176")
                        .setAuthor({ name: `${userName}`, iconURL: userAvatarURL })
                        .setTitle("📢 Acabou de postar!")
                        .setDescription(
                          `**${userName}** acabou de postar: \n\n${content}\n\n[Ir para a postagem](${messageLink})\n\n`
                        )
                        .setTimestamp();
        
                      let mediaUrl: string | undefined;
                      const gifLinks: string[] = [];
        
                      const attachments: (string | null)[] = [];
                      if (message.attachments.size > 0) {
                        message.attachments.forEach((attachment) => {
                          const fileType =
                            attachment.contentType || attachment.name?.split(".").pop();
        
                          if (fileType?.startsWith("image")) {
                            embed.setImage(attachment.url);
                            attachments.push(attachment.url);
                          } else if (
                            fileType?.startsWith("video") ||
                            fileType === "gif"
                          ) {
                            embed.addFields({
                              name: "⬇️",
                              value: "⬇️",
                              inline: false,
                            });
                            embed.addFields({
                              name: "📹  Vídeo",
                              value: `[Anexo abaixo](${attachment.url})`,
                              inline: false,
                            });
                            mediaUrl = attachment.url;
                          }
                        });
                      }
        
                      const gifPattern =
                        /(https?:\/\/(?:tenor|giphy)\.com\/view\/[^\s]+)/g;
                      const foundGifLinks = content.match(gifPattern);
        
                      if (foundGifLinks) {
                        gifLinks.push(...foundGifLinks);
                      }
                      try {
                        const messages = await message.channel.messages.fetch({
                          limit: 2,
                        });
        
                        // Pega a segunda mensagem (anterior) e a primeira (atual)
                        const previousMessage = messages.last();
                        const currentMessage = messages.first();
        
                        const previousDate = previousMessage?.createdAt;
                        const currentDate = currentMessage?.createdAt;
        
                        const isSameDay =
                          previousDate?.getFullYear() === currentDate?.getFullYear() &&
                          previousDate?.getMonth() === currentDate?.getMonth() &&
                          previousDate?.getDate() === currentDate?.getDate();
        
                        // Verifica se a mensagem anterior é uma mensagem encaminhada (tem uma referência)
                        if (
                          previousMessage &&
                          previousMessage.reference?.messageId &&
                          currentMessage &&
                          isSameDay
                        ) {
                          const referencedMessageId =
                            previousMessage.reference.messageId;
                          const referencedChannelId =
                            previousMessage.reference.channelId || message.channel.id; // Canal da mensagem referenciada ou o atual
        
                          // Tenta buscar o canal da mensagem referenciada
                          const referencedChannel = await message.guild?.channels.fetch(
                            referencedChannelId
                          );
        
                          if (referencedChannel?.isTextBased()) {
                            try {
                              // Tenta buscar a mensagem referenciada no canal correto
                              const fetchedMessage =
                                await referencedChannel.messages.fetch(
                                  referencedMessageId
                                );
        
                              if (fetchedMessage) {
                                let isPrivateQuote:boolean = false;
                                if (
                                  privateAcc.some((acc) =>
                                    currentMessage.content.startsWith(acc)
                                  )
                                ) {
                                  isPrivateQuote = true;
                                  fetchedMessage.react("🔒");
                                }
        
                                // Coleta informações da mensagem anterior (fetchedMessage)
                                let previousImageUrl = null;
                                if (fetchedMessage.attachments.size > 0) {
                                  const attachment = fetchedMessage.attachments.first();
                                  if (attachment?.contentType?.startsWith("image/")) {
                                    previousImageUrl = attachment.url; // URL da imagem da mensagem anterior
                                  }
                                }
        
                                const previousProfileImageUrl =
                                  fetchedMessage.author.displayAvatarURL({
                                    extension: "png",
                                  });
        
                                // Coleta informações da mensagem atual (currentMessage)
                                let currentImageUrl = null;
                                if (currentMessage.attachments.size > 0) {
                                  const attachment = currentMessage.attachments.first();
                                  if (attachment?.contentType?.startsWith("image/")) {
                                    currentImageUrl = attachment.url; // URL da imagem da mensagem atual
                                  }
                                }
        
                                const currentProfileImageUrl =
                                  currentMessage.author.displayAvatarURL({
                                    extension: "png",
                                  });
        
                                const replyRegex =
                                  /^>\s*\[Reply to\].*\n>\s*(.*)\n(.*)/s; // Captura o que vier na linha após o segundo '>' e a terceira linha em diante
                                const match = fetchedMessage.content.match(replyRegex);
                                let newMessage: string = fetchedMessage.content;
        
                                if (match) {
                                  newMessage = match[2].trim(); // O "real conteúdo" da terceira linha em diante
                                }
        
                                // Chama a função takeScreenshot passando os dados de ambas as mensagens
                                console.log(
                                  "Tirando screenshot de ambas as mensagens..."
                                );
                                const screenshotPath = await takeScreenshot(
                                  newMessage, // conteúdo da mensagem anterior
                                  fetchedMessage.author.username, // nome do autor da mensagem anterior
                                  currentMessage.content, // conteúdo da mensagem atual
                                  currentMessage.author.username, // nome do autor da mensagem atual
                                  previousImageUrl, // URL da imagem da mensagem anterior
                                  previousProfileImageUrl, // URL do avatar da mensagem anterior
                                  currentImageUrl, // URL da imagem da mensagem atual
                                  currentProfileImageUrl, // URL do avatar da mensagem atual
                                  isPrivateQuote
                                );
        
                                // console.log("Screenshot tirada:", screenshotPath);
        
                                // Envia o embed e o screenshot gerado
                                await targetChannel.send({ embeds: [embed] });
                                await targetChannel.send({
                                  files: [screenshotPath],
                                });
        
                                fs.unlink(screenshotPath, (err) => {
                                  if (err) {
                                    console.error(
                                      `Erro ao deletar o arquivo de screenshot: ${err}`
                                    );
                                  } else {
                                    console.log("Screenshot deletado com sucesso!");
                                  }
                                });
                              }
                            } catch (err) {
                              console.error(
                                `Erro ao buscar a mensagem referenciada: ${err}`
                              );
                              // Se a mensagem referenciada não for encontrada, apenas envia o embed sem o screenshot
                              await targetChannel.send({ embeds: [embed] });
                            }
                          }
                        } else {
                          // Se a mensagem anterior não for uma mensagem encaminhada, apenas envia o embed sem o screenshot
                          await targetChannel.send({ embeds: [embed] });
                        }
                      } catch (error) {
                        console.error(
                          "Erro ao buscar a mensagem anterior ou a mensagem encaminhada:",
                          error
                        );
                        await targetChannel.send({ embeds: [embed] });
                      }
                      // Verifica se a mensagem anterior é uma mensagem encaminhada (tem uma referência)
                      if (secondArrow) {
                        try {
                          // Chama a função takeScreenshot passando os dados de ambas as mensagens
                          console.log("Tirando screenshot com ambas as mensagens...");
                          const screenshotPath = await takeScreenshot(
                            secondArrow, // conteúdo da mensagem anterior
                            userName, // nome do autor da mensagem anterior
                            content, // conteúdo da mensagem atual
                            userName, // nome do autor da mensagem atual
                            null, // URL da imagem da mensagem anterior
                            userAvatarURL, // URL do avatar da mensagem anterior
                            attachments[0], // URL da imagem da mensagem atual (apenas a primeira, se houver)
                            userAvatarURL // URL do avatar da mensagem atual
                          );
        
                          // Envia o embed e o screenshot gerado
                          // await targetChannel.send({ embeds: [embed] });
                          await targetChannel.send({ files: [screenshotPath] });
        
                          // Deleta o arquivo de screenshot após enviá-lo
                          fs.unlink(screenshotPath, (err) => {
                            if (err) {
                              console.error(
                                `Erro ao deletar o arquivo de screenshot: ${err}`
                              );
                            } else {
                              console.log("Screenshot deletado com sucesso!");
                            }
                          });
                        } catch (err) {
                          console.error(
                            `Erro ao buscar a mensagem referenciada: ${err}`
                          );
                        }
                      }
        
                      // Se houver mídia (vídeo ou GIF) anexada, envia o link fora do embed
                      if (mediaUrl) {
                        await targetChannel.send(mediaUrl);
                      }
        
                      // Se houver GIFs no conteúdo da mensagem, envia-os fora do embed
                      for (const gifLink of gifLinks) {
                        await targetChannel.send(gifLink);
                      }
        
                      console.log(`Mensagem enviada para o canal ${TARGET_CHANNEL_ID}`);
                    } else {
                      console.log("O canal de destino não é um canal de texto.");
                    }
                  }, 500);
                }
              }
            }
          }
    },
});