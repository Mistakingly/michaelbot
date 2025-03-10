const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const configPath = "./serverConfig.json";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setverifychannel")
    .setDescription("Set the verification channel")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel for user verification")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
      return interaction.reply({
        content: "❌ You need admin permissions to use this command.",
        ephemeral: true,
      });
    }

    const channel = interaction.options.getChannel("channel");

    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath));
    }

    if (!config[interaction.guild.id]) config[interaction.guild.id] = {};
    config[interaction.guild.id].verifyChannelId = channel.id;

    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

    interaction.reply({
      content: `✅ Verification channel set to <#${channel.id}>`,
      ephemeral: true,
    });
  },
};
