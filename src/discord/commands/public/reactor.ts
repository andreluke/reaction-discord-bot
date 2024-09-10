import { Client, GatewayIntentBits, Message } from "discord.js";

const TARGET_USER_ID = process.env.TARGET_USER_ID?.substring(0, 4);
const TARGET_CATEGORY_ID = process.env.TARGET_CATEGORY_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions 
  ]
});

client.once("ready", () => {
  console.log(`Bot online! Logado como ${client.user?.tag}`);
});

client.on("messageCreate", async (message: Message) => {
  if (message.guild) {
    const messageAuthorIdStart = message.author.id.substring(0, 4);
    
    if (messageAuthorIdStart === TARGET_USER_ID) {
      const channel = message.channel;
      console.log(`Mensagem recebida de ${message.author.tag} no canal ${channel.id}`);

      if (channel.isTextBased() && "parent" in channel) {
        // Tenta buscar uma versão atualizada do canal
        const guild = message.guild;
        const freshChannel = await guild?.channels.fetch(channel.id);
        const category = freshChannel?.parent;
        const name = freshChannel?.name;

        console.log(`Canal ${name} (ID: ${channel.id}), Categoria: ${category ? category.name : "sem categoria"}`);

        if (!category) {
          console.log(`Erro: Categoria do canal ${channel.name} não encontrada.`);
          return;
        }

        if (category.id === TARGET_CATEGORY_ID) {
          console.log(`Mensagem no canal pertencente à categoria: ${category.name}`);
          message.react("❤️")
            .then(() => message.react("🔁"))
            .then(() => message.react("💬"))
            .then(() => console.log(`Reagiu à mensagem de ${message.author.tag} no canal ${name}`))
            .catch(console.error);
        } else {
          console.log(`Canal ${channel.id} pertence à categoria ${category.name} (ID: ${category.id}), não à categoria alvo.`);
        }
      }
    }
  }
});

const BOT_TOKEN = process.env.BOT_TOKEN;
client.login(BOT_TOKEN);
