const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");
const fs = require("fs");
const configPath = "./serverConfig.json";

module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath));
    }

    const serverConfig = config[member.guild.id];
    if (!serverConfig || !serverConfig.verifyChannelId) return;

    const verifyChannel = member.guild.channels.cache.get(
      serverConfig.verifyChannelId
    );
    if (!verifyChannel) return console.error("Verification channel not found");

    const verifyEmbed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("Welcome to the server!")
      .setDescription("Click the button below to start verification.");

    const verifyButton = new ButtonBuilder()
      .setCustomId(`verify_${member.id}`)
      .setLabel("Verify")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(verifyButton);

    await verifyChannel.send({ embeds: [verifyEmbed], components: [row] });
  },
};
