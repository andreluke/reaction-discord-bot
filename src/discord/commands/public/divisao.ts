import { Client, GatewayIntentBits, Message } from "discord.js";

const TARGET_CATEGORY_ID = process.env.TARGET_CATEGORY_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on("messageCreate", async (message: Message) => {
  if (message.guild) {
    if (message.content.trim() === "DIV") {
      const channel = message.channel;
      
      if (channel.isTextBased() && "parent" in channel) {
        const category = channel.parent;

        if (category && category.id === TARGET_CATEGORY_ID) {
          try {
            await message.delete(); // Apaga a mensagem original
            await channel.send("———————————————————————————————————"); // Envia a nova mensagem
      
          } catch (error) {
            console.error("Erro ao apagar mensagem ou enviar nova mensagem:", error);
          }
        } else {
          console.log(`Canal ${channel.id} pertence à categoria ${category ? category.name : "sem categoria"} (ID: ${category?.id}), não à categoria alvo.`);
        }
      }
    }
  }
});

const BOT_TOKEN = process.env.BOT_TOKEN;
client.login(BOT_TOKEN);
