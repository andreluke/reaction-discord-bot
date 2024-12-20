import { Client, GatewayIntentBits, Message } from "discord.js";

const TARGET_USER_ID = process.env.TARGET_USER_ID?.substring(0, 2);
const TARGET_USER_ID2 = process.env.TARGET_USER_ID2?.substring(0, 2);
const TARGET_CATEGORY_ID = process.env.TARGET_CATEGORY_ID;
const TARGET_CATEGORY_ID2 = process.env.TARGET_CATEGORY_ID2;


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

    if (
      messageAuthorIdStart === TARGET_USER_ID ||
      messageAuthorIdStart === TARGET_USER_ID2
    ) {
      const channel = message.channel;

      if (channel.isTextBased() && "parent" in channel) {
        // Tenta buscar uma versão atualizada do canal
        const guild = message.guild;
        const freshChannel = await guild?.channels.fetch(channel.id);
        const category = freshChannel?.parent;

        if (!category) {
          return;
        }

        if (category.id === TARGET_CATEGORY_ID || category.id === TARGET_CATEGORY_ID2) {
          try {
            await Promise.all([
              message.react("❤️"),
              message.react("💔"),
              message.react("🔁"),
              message.react("💬"),
            ]);
          } catch (error) {
            console.error("Erro ao adicionar reações:", error);
          }
        }
      }
    }
  }
});

const BOT_TOKEN = process.env.BOT_TOKEN;
client.login(BOT_TOKEN);
