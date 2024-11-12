import { Command } from "#base";
import { printScreenshot as takeScreenshot } from "#functions";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord.js";
import fs from "fs";
import path from "path";

const TARGET_USER_ID = process.env.TARGET_USER_ID?.substring(0, 2);
const TARGET_USER_ID2 = process.env.TARGET_USER_ID2?.substring(0, 2);

const extractThreadId = (input: string) => {
  const threadLinkRegex = /\/([^/]+)$/;
  const match = input.match(threadLinkRegex);
  if (match) {
    return match[1];
  }
  return input;
};

const isTargetUser = (userId: string) => {
  const userIdPrefix = userId.substring(0, 2);
  return (
    userIdPrefix === TARGET_USER_ID || userIdPrefix === TARGET_USER_ID2
  );
};

new Command({
  name: "thread",
  description: "Comando para tirar print de um canal",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "conversa",
      description: "ID ou link da thread para tirar o print",
      type: ApplicationCommandOptionType.String,
      required: true,
      minLength: 19,
    },
    {
      name: "quantidade",
      description: "Quantas mensagens devem ser printadas",
      type: ApplicationCommandOptionType.Integer,
      maxValue: 10,
    },
    {
      name: "inicio",
      description: "Escolha o número da mensagem inicial ou parte do conteúdo dela",
      type: ApplicationCommandOptionType.String,
      required: false,
      autocomplete: true, // Habilita o autocomplete para esta opção
    },
  ],
  async autocomplete(interaction) {
    const { options, guild } = interaction;
    const input = options.getString("conversa");

    if (!input) return;

    const threadId = extractThreadId(input);
    const thread = await guild?.channels.fetch(threadId);

    if (!thread || !thread.isThread()) {
      return interaction.respond([]);
    }

    const allMessages = await thread.messages.fetch({ limit: 100 });
    const filteredMessages = Array.from(allMessages.values())
      .filter((msg) => isTargetUser(msg.author.id))
      .map((msg) => ({
        name: msg.content.slice(0, 100), // Mostra os primeiros 100 caracteres da mensagem no autocomplete
        value: msg.id,
      }));

    return interaction.respond(filteredMessages.slice(0, 25)); // Limita o autocomplete a 25 resultados
  },
  async run(interaction) {
    try {
      const { options, channel, guild } = interaction;

      await interaction.deferReply({ ephemeral: false });

      if (!channel?.isTextBased()) {
        return interaction.editReply({                                  
          content: "Não é possível executar esse comando nesse canal",
        });
      }

      const input = options.getString("conversa");
      const startMessageId = options.getString("inicio");
      const amount = options.getInteger("quantidade") || (startMessageId ? 2 : 1);

      const threadId = extractThreadId(input);
      const thread = await guild?.channels.fetch(threadId);

      if (!thread || !thread.isThread()) {
        return interaction.editReply({
          content: "Thread não encontrada ou inválida.",
        });
      }

      const starterMessage = await thread.fetchStarterMessage();

      if (!starterMessage) {
        return interaction.editReply({
          content:
            "Não foi possível encontrar a mensagem que iniciou a thread.",
        });
      }

      const allMessages = await thread.messages.fetch({ limit: 100 });
      const validMessages = allMessages.filter((msg) =>
        isTargetUser(msg.author.id)
      );

      const sortedMessages = Array.from(validMessages.values()).sort(
        (a, b) => a.createdTimestamp - b.createdTimestamp
      );

      let startIndex = 0;
      const initialMessages = [];

      if (startMessageId) {
        // Se o usuário escolheu uma mensagem inicial no autocomplete, use essa
        startIndex = sortedMessages.findIndex((msg) => msg.id === startMessageId);
        if (startIndex === -1) {
          return interaction.editReply({
            content: "Mensagem de início não encontrada.",
          });
        }
      } else {
        // Caso não tenha escolhido, usa a mensagem que iniciou a thread
        const validStarterMessage = isTargetUser(starterMessage.author.id);
        if (validStarterMessage) {
          initialMessages.push({
            content: starterMessage.content,
            authorName: starterMessage.author.username,
            authorAvatarUrl: starterMessage.author.displayAvatarURL(),
            imageUrl: starterMessage.attachments.first()
              ? starterMessage.attachments.first().url
              : null,
          });
        }
      }

      const messagesToDisplay = sortedMessages.slice(
        startIndex, 
        startIndex + amount
      );

      const messagesWithCorrectOrder = [
        ...initialMessages,
        ...messagesToDisplay.map((msg) => ({
          content: msg.content,
          authorName: msg.author.username,
          authorAvatarUrl: msg.author.displayAvatarURL(),
          imageUrl: msg.attachments.first()
            ? msg.attachments.first().url
            : null,
        })),
      ];

      const screenshotPath = await takeScreenshot(messagesWithCorrectOrder);

      await interaction.editReply({
        content: "Print da conversa:",
        files: [{ attachment: screenshotPath }],
      });

      fs.unlinkSync(path.resolve(screenshotPath));
      return console.log("Sucesso no print!!");
    } catch (error) {
      console.error("Erro ao processar o comando:", error);
      await interaction.editReply({
        content:
          "Ocorreu um erro ao processar o comando. Tente novamente mais tarde.",
      });
    }
  },
});
