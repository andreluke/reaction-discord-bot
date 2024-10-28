/* eslint-disable @typescript-eslint/await-thenable */
// @ts-ignore
import { Client, GatewayIntentBits } from "discord.js"; 

const TARGET_USER_ID = "12"; // Use um valor de exemplo
const TARGET_CATEGORY_ID = "category-id"; // Use um valor de exemplo

// @ts-ignore
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

// Simulação do método de login para evitar realmente conectar ao Discord durante os testes.
client.login = jest.fn() as jest.MockedFunction<typeof client.login>;
// ...restante do código...

client.on("messageCreate", async (message) => {
  if (message.guild) {
    const messageAuthorIdStart = message.author.id.substring(0, 2);

    if (messageAuthorIdStart === TARGET_USER_ID || messageAuthorIdStart === "13") {
      const channel = message.channel;

      if (channel.isTextBased() && "parent" in channel) {
        const guild = message.guild;

        // Simulando a busca de canal
        const freshChannel = await guild.channels.fetch(channel.id);
        const category = freshChannel?.parent;

        if (!category) {
          return;
        }

        if (category.id === TARGET_CATEGORY_ID) {
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


// Testes
describe("Função de reação", () => {
  it("Deve reagir a uma mensagem na categoria correta e com o user correto", async () => {
    const message = {
      guild: {
        channels: {
          fetch: jest.fn().mockResolvedValue({
            parent: {
              id: TARGET_CATEGORY_ID, // Simulando a categoria correta
            },
          }),
        },
      },
      author: { id: "123456789" }, // Começa com '12'
      channel: {
        parent: TARGET_CATEGORY_ID,
        isTextBased: jest.fn().mockReturnValue(true), // Canal é baseado em texto
        id: "channel-id",
      },
      react: jest.fn().mockResolvedValue(Promise.resolve()), // Mock do método react
    };

    // Emitir a mensagem
    await client.emit("messageCreate", message as any);

    // Verificar se as reações foram chamadas
    expect(message.react).toHaveBeenCalledTimes(4); // Deve chamar react 4 vezes
    expect(message.react).toHaveBeenNthCalledWith(1, "❤️");
    expect(message.react).toHaveBeenNthCalledWith(2, "💔");
    expect(message.react).toHaveBeenNthCalledWith(3, "🔁");
    expect(message.react).toHaveBeenNthCalledWith(4, "💬");
  });

  it("Deve reagir a uma mensagem na categoria correta e com o user correto, mesmo iniciando com 13", async () => {
    const message = {
      guild: {
        channels: {
          fetch: jest.fn().mockResolvedValue({
            parent: {
              id: TARGET_CATEGORY_ID, // Simulando a categoria correta
            },
          }),
        },
      },
      author: { id: "134456789" }, // Começa com '12'
      channel: {
        parent: TARGET_CATEGORY_ID,
        isTextBased: jest.fn().mockReturnValue(true), // Canal é baseado em texto
        id: "channel-id",
      },
      react: jest.fn().mockResolvedValue(Promise.resolve()), // Mock do método react
    };

    // Emitir a mensagem
    await client.emit("messageCreate", message as any);

    // Verificar se as reações foram chamadas
    expect(message.react).toHaveBeenCalledTimes(4); // Deve chamar react 4 vezes
    expect(message.react).toHaveBeenNthCalledWith(1, "❤️");
    expect(message.react).toHaveBeenNthCalledWith(2, "💔");
    expect(message.react).toHaveBeenNthCalledWith(3, "🔁");
    expect(message.react).toHaveBeenNthCalledWith(4, "💬");
  });

  it("Não deve reagir se a categoria não for a certa", async () => {
    const message = {
      guild: {
        channels: {
          fetch: jest.fn().mockResolvedValue({
            parent: {
              id: "wrongID", // Categoria errada
            },
          }),
        },
      },
      author: { id: "123456789" }, // Começa com '12'
      channel: {
        parent: "wrongID",
        isTextBased: jest.fn().mockReturnValue(true), // Canal é baseado em texto
        id: "channel-id",
      },
      react: jest.fn(), // Mock do método react
    };

    // Emitir a mensagem
    client.emit("messageCreate", message as any);

    // Verificar que o método react não foi chamado
    expect(message.react).not.toHaveBeenCalled(); // Não deve ter chamado react
  });

  it("Não deve reagir se o autor estiver errado", async () => {
    const message = {
      guild: {
        channels: {
          fetch: jest.fn().mockResolvedValue({
            parent: {
              id: TARGET_CATEGORY_ID, // Categoria correta
            },
          }),
        },
      },
      author: { id: "987654321" }, // Não começa com '12' ou '13'
      channel: {
        parent: TARGET_CATEGORY_ID,
        isTextBased: jest.fn().mockReturnValue(true), // Canal é baseado em texto
        id: "channel-id",
      },
      react: jest.fn(), // Mock do método react
    };

    // Emitir a mensagem
    client.emit("messageCreate", message as any);

    // Verificar que o método react não foi chamado
    expect(message.react).not.toHaveBeenCalled(); // Não deve ter chamado react
  });
});
