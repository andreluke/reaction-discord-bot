import {
  Client,
  GatewayIntentBits,
  Message,
  EmbedBuilder,
  TextChannel,
  NewsChannel,
} from "discord.js";

const TARGET_USER_ID = process.env.TARGET_USER_ID?.substring(0, 2);
const TARGET_CATEGORY_ID = process.env.TARGET_CATEGORY_ID;
const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID;
const BOT_TOKEN = process.env.BOT_TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.once("ready", () => {
  console.log(`Bot online! Logado como ${client.user?.tag}`);
});

client.on("messageCreate", async (message: Message) => {
  if (message.guild) {
    const messageAuthorIdStart = message.author.id.substring(0, 2);

    if (messageAuthorIdStart === TARGET_USER_ID) {
      const channel = message.channel;

      if (channel.isTextBased() && "parent" in channel) {
        const guild = message.guild;
        const freshChannel = await guild?.channels.fetch(channel.id);
        const category = freshChannel?.parent;

        if (!category) {
          return;
        }

        if (category.id === TARGET_CATEGORY_ID) {
          setTimeout(async () => {
            const targetChannel = client.channels.cache.get(TARGET_CHANNEL_ID);
            if (
              targetChannel instanceof TextChannel ||
              targetChannel instanceof NewsChannel
            ) {
              const userAvatarURL = message.author.displayAvatarURL();
              const userName = message.author.username;
              const content = message.content;

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

              if (message.attachments.size > 0) {
                message.attachments.forEach((attachment) => {
                  const fileType =
                    attachment.contentType || attachment.name?.split(".").pop(); // Verifica o tipo de arquivo

                  if (fileType?.startsWith("image")) {
                    embed.setImage(attachment.url); // Exibe imagens diretamente no embed
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
                    mediaUrl = attachment.url; // Salva o link do vídeo ou GIF
                  }
                });
              }

              // Procura links de GIFs no conteúdo da mensagem (ex.: Tenor ou Giphy)
              const gifPattern =
                /(https?:\/\/(?:tenor|giphy)\.com\/view\/[^\s]+)/g;
              const foundGifLinks = content.match(gifPattern);

              if (foundGifLinks) {
                gifLinks.push(...foundGifLinks);
              }

              // Envia o embed primeiro
              await targetChannel.send({ embeds: [embed] });

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
          }, 1000);
        } 
      }
    }
  }
});

client.login(BOT_TOKEN);
