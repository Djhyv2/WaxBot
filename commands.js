const Discord = require('discord.js');
const RuneGoldberg = require('./rune-goldberg');
const Print = require('./print');
const Alts = require('./alts');

const commandName = 'alts';
const optionName = 'runedate_offset';

module.exports = class Commands
{
    /**
     * Creates Array of JSON strings needed to register Slash commands with Discord
     * @returns {Array.<String>} Array of JSON strings needed to register Slash commands with Discord
     */
    static registrationArray()
    {
        return [new Discord.SlashCommandBuilder()
            .setName(commandName)
            .setDescription('Calculates alts for Runedate')
            .addIntegerOption((option) => option
                .setName(optionName)
                .setDescription('Offset of today to calculate alts for.')
                .setRequired(false))
            .toJSON()];
    }

    /**
     * Calculates and Prints Alts for applicable Discord Interactions/Slash Commands
     * @param {Discord.Interaction} interaction Discord Interaction Object
     */
    static async handleSlashCommand(interaction)
    {
        if (interaction.isChatInputCommand() && commandName === interaction.commandName)
        {
            try
            {
                await interaction.deferReply();
                const runeWaxValues = RuneGoldberg.parseAllRunes(interaction.options.getInteger(optionName));
                const {
                    combination, alts, ironAlts, notableRunes,
                } = await Alts.calculateAlts(runeWaxValues);
                interaction.editReply(Print.generateMessage(combination, alts, ironAlts, notableRunes, interaction.client.emojis.cache, interaction.options.getInteger(optionName)));
            }
            catch (error)
            {
                interaction.editReply(error.message);
            }
        }
    }
};
