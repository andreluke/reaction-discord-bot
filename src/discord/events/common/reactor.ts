import { Event } from "#base";

const TARGET_USER_ID = process.env.TARGET_USER_ID?.substring(0, 2);
const TARGET_USER_ID2 = process.env.TARGET_USER_ID2?.substring(0, 2);
const TARGET_CATEGORY_ID = process.env.TARGET_CATEGORY_ID;
const TARGET_CATEGORY_ID2 = process.env.TARGET_CATEGORY_ID2;
const REJECTED_USERNAMES = ["testBot", "ReactionBot", "twitter"];


new Event({
    name: "Reage a mensagens",
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
    },
});