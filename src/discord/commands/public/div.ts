import { Command } from "#base";
import { ApplicationCommandType,  } from "discord.js";

new Command({
	name: "div", // Altere o nome do comando para "div"
	description: "Cria uma divisão entre os paragrafos", // Descrição atualizada
	type: ApplicationCommandType.ChatInput,
	async run(interaction){
		const messages = "————————————————————————————————————";

		interaction.reply({ 
			ephemeral: false, 
			content: messages, 
		});
	}
});
