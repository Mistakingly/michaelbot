const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const configPath = "./serverConfig.json";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setverifyrole")
    .setDescription("Set the verification role for newly verified members.")
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("Select the verification role")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const role = interaction.options.getRole("role");

    if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, "{}");
    const config = JSON.parse(fs.readFileSync(configPath));

    if (!config[interaction.guild.id]) config[interaction.guild.id] = {};
    config[interaction.guild.id].verifyRoleId = role.id;

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    await interaction.reply({
      content: `✅ Verification role set to <@&${role.id}>`,
      ephemeral: true,
    });
  },
};
