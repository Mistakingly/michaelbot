const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const config = require("../config.json");

module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    try {
      const channel = member.guild.channels.cache.get(
        config.verificationChannelId
      );
      if (!channel) return console.error("Verification channel not found");

      // Create a verification message
      const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("Welcome to the server!")
        .setDescription(
          `Hello ${member.user}, please verify yourself by clicking the button below.`
        )
        .setFooter({ text: "Failure to verify may result in a ban." });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("verify_button")
          .setLabel("Verify")
          .setStyle(ButtonStyle.Primary)
      );

      // Send verification message
      const verificationMessage = await channel.send({
        content: `${member}`,
        embeds: [embed],
        components: [row],
      });

      // Store verification message ID
      member.verificationMessageId = verificationMessage.id;
    } catch (err) {
      console.error("Error sending verification message:", err);
    }
  },
};
