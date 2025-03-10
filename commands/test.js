const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Checks if the bot is working."),

  async execute(interaction) {
    await interaction.reply("✅ The bot is working!");
  },
};
