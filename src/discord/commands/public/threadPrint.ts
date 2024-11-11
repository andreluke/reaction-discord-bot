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
  ],
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
      const amount = options.getInteger("quantidade") || 2;

      // Função para extrair o ID da thread do link, se necessário
      const extractThreadId = (input) => {
        const threadLinkRegex = /\/([^/]+)$/;
        const match = input.match(threadLinkRegex);
        if (match) {
          return match[1];
        }
        return input;
      };

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

      const isTargetUser = (userId) => {
        const userIdPrefix = userId.substring(0, 2);
        return (
          userIdPrefix === TARGET_USER_ID || userIdPrefix === TARGET_USER_ID2
        );
      };

      const validStarterMessage = isTargetUser(starterMessage.author.id);
      const allMessages = await thread.messages.fetch({ limit: 100 });
      const validMessages = allMessages.filter((msg) =>
        isTargetUser(msg.author.id)
      );

      const sortedMessages = Array.from(validMessages.values()).sort(
        (a, b) => a.createdTimestamp - b.createdTimestamp
      );

      const messagesToDisplay = sortedMessages.slice(0, amount - 1);

      const messagesWithCorrectOrder = [
        ...(validStarterMessage
          ? [
              {
                content: starterMessage.content,
                authorName: starterMessage.author.username,
                authorAvatarUrl: starterMessage.author.displayAvatarURL(),
                imageUrl: starterMessage.attachments.first()
                  ? starterMessage.attachments.first().url
                  : null,
              },
            ]
          : []),
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
