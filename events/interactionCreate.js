const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (interaction.isButton() && interaction.customId === "verify_button") {
      await interaction.reply({
        content: "Please type your desired nickname in this channel.",
        ephemeral: true,
      });

      const filter = (msg) => msg.author.id === interaction.user.id;
      const collector = interaction.channel.createMessageCollector({
        filter,
        time: 60000,
        max: 1,
      });

      collector.on("collect", async (message) => {
        const newNickname = message.content;
        try {
          // Notify admins about the new nickname request
          const logChannel = interaction.guild.channels.cache.get(
            config.logChannelId
          );
          if (logChannel) {
            const logEmbed = new EmbedBuilder()
              .setColor("#FAA61A")
              .setTitle("Nickname Verification Request")
              .setDescription(
                `**User:** ${interaction.user.tag} (${interaction.user.id})\n**Requested Nickname:** ${newNickname}`
              )
              .setTimestamp();
            await logChannel.send({ embeds: [logEmbed] });
          }

          await message.reply(
            `✅ Your nickname request has been sent to the admins for verification.`
          );
        } catch (err) {
          console.error("Error sending nickname request:", err);
          await message.reply(
            "⚠ I couldn't send your nickname request. Please try again later."
          );
        }
      });

      collector.on("end", (collected) => {
        if (collected.size === 0) {
          interaction.followUp({
            content:
              "❌ You didn't provide a nickname in time. Please try again.",
            ephemeral: true,
          });
        }
      });
    }

    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  },
};
