
const Axios = require('axios');
const Discord = require('discord.js');
const Messages = require('./messages');
const Commands = require('./commands');

describe('integration', () =>
{
    const emojiCache = new Discord.Collection(new Map([
        [1, { name: 'Air_rune' }],
        [2, { name: 'Water_rune' }],
        [3, { name: 'Earth_rune' }],
        [4, { name: 'Fire_rune' }],
        [5, { name: 'Dust_rune' }],
        [6, { name: 'Lava_rune' }],
        [7, { name: 'Mist_rune' }],
        [8, { name: 'Mud_rune' }],
        [9, { name: 'Smoke_rune' }],
        [10, { name: 'Steam_rune' }],
        [11, { name: 'Mind_rune' }],
        [12, { name: 'Body_rune' }],
        [13, { name: 'Cosmic_rune' }],
        [14, { name: 'Chaos_rune' }],
        [15, { name: 'Nature_rune' }],
        [16, { name: 'Law_rune' }],
        [17, { name: 'Death_rune' }],
        [18, { name: 'Astral_rune' }],
        [19, { name: 'Blood_rune' }],
        [20, { name: 'Soul_rune' }]]));
    const runePrices = {
        data: {
            556: { price: 29 },
            555: { price: 203 },
            557: { price: 27 },
            554: { price: 124 },
            4696: { price: 2467 },
            4699: { price: 523 },
            4695: { price: 2543 },
            4698: { price: 1629 },
            4697: { price: 423 },
            4694: { price: 1397 },
            558: { price: 19 },
            559: { price: 28 },
            564: { price: 325 },
            562: { price: 155 },
            561: { price: 923 },
            563: { price: 293 },
            560: { price: 376 },
            9075: { price: 618 },
            565: { price: 1645 },
            566: { price: 3056 },
        },

    };
    const waxPrices = { data: { 32092: { price: 20372 } } };

    beforeAll(() =>
    {
        emojiCache.forEach((value, key, map) =>
        {
            map.get(key).toString = () => `:${value.name}:`;
        });
        jest.useFakeTimers().setSystemTime(new Date('2023-03-05'));
    });
    beforeEach(() =>
    {
        Axios.get = jest.fn().mockResolvedValueOnce(runePrices).mockResolvedValueOnce(waxPrices);
    });

    describe('Message Input', () =>
    {
        let mockMessage;
        beforeEach(() =>
        {
            mockMessage = { client: { emojis: { cache: emojiCache } }, channel: { send: jest.fn() } };
        });

        describe('Alt Calculations', () =>
        {
            test('No conflicting Runes', async () =>
            {
                mockMessage.content = 'fire 30\nwater 30\nearth 30\nair 30';
                await Messages.handleMessage(mockMessage);
                expect(mockMessage.channel.send).toHaveBeenCalledWith(`Mar 05, 2023
Slot 1:
    :Fire_rune: Fire (Fire 30)
Slot 2:
    :Water_rune: Water (Water 30)
    :Earth_rune: Earth (Earth 30)
    :Air_rune: Air (Air 30)
Alts: Fire Water Earth Air
Iron Alts: Fire Water Earth Air`);
            });

            test('Use 2nd Best Slot 1 for all 3 Slot 2', async () =>
            {
                mockMessage.content = 'air 30, earth 20\nsteam 30, air 27\nblood 30, air 28\nair 30, mist 29';
                await Messages.handleMessage(mockMessage);
                expect(mockMessage.channel.send).toHaveBeenCalledWith(`Mar 05, 2023
Slot 1:
    :Air_rune: Air (Air 30, Earth 20)
Slot 2:
    :Steam_rune: Steam (Air 27, Steam 30)
    :Blood_rune: Blood (Air 28, Blood 30)
    :Air_rune: Air (Air 30, Mist 29)
Alts: Earth Air Air Air
Iron Alts: Air/Earth Air Blood Air`);
            });

            test('Use 2nd Best Slot 1 for some Slot 2', async () =>
            {
                mockMessage.content = 'air 30, earth 20\nmind 30, air 27\nblood 30, air 28\nair 30, mist 29';
                await Messages.handleMessage(mockMessage);
                expect(mockMessage.channel.send).toHaveBeenCalledWith(`Mar 05, 2023
Slot 1:
    :Air_rune: Air (Air 30, Earth 20)
Slot 2:
    :Mind_rune: Mind (Mind 30, Air 27)
    :Blood_rune: Blood (Air 28, Blood 30)
    :Air_rune: Air (Air 30, Mist 29)
Alts: Air/Earth Mind Air Air
Iron Alts: Air/Earth Mind Blood Air`);
            });

            test('Use 2nd Best Slot 2 for some Slot 2', async () =>
            {
                mockMessage.content = 'air 30, earth 20\nmind 30, air 27\nblood 30, air 28\nair 30, earth 25';
                await Messages.handleMessage(mockMessage);
                expect(mockMessage.channel.send).toHaveBeenCalledWith(`Mar 05, 2023
Slot 1:
    :Air_rune: Air (Air 30, Earth 20)
Slot 2:
    :Mind_rune: Mind (Mind 30, Air 27)
    :Blood_rune: Blood (Air 28, Blood 30)
    :Air_rune: Air (Air 30, Earth 25)
Alts: Air/Earth Mind Air Earth
Iron Alts: Air Mind Blood Earth`);
            });

            test('No Alternatives for Slot 1', async () =>
            {
                mockMessage.content = 'air 30\nmind 30, air 27\nblood 30, air 28\nair 30, earth 25';
                await Messages.handleMessage(mockMessage);
                expect(mockMessage.channel.send).toHaveBeenCalledWith(`Mar 05, 2023
Slot 1:
    :Air_rune: Air (Air 30)
Slot 2:
    :Mind_rune: Mind (Mind 30, Air 27)
    :Blood_rune: Blood (Air 28, Blood 30)
    :Air_rune: Air (Air 30, Earth 25)
Alts: Air Mind Blood Earth
Iron Alts: Air Mind Blood Earth`);
            });

            test('No Alternatives for Slot 2', async () =>
            {
                mockMessage.content = 'air 30, earth 20\nmind 30\nblood 30\nair 30';
                await Messages.handleMessage(mockMessage);
                expect(mockMessage.channel.send).toHaveBeenCalledWith(`Mar 05, 2023
Slot 1:
    :Air_rune: Air (Air 30, Earth 20)
Slot 2:
    :Mind_rune: Mind (Mind 30)
    :Blood_rune: Blood (Blood 30)
    :Air_rune: Air (Air 30)
Alts: Air/Earth Mind Blood Air
Iron Alts: Air/Earth Mind Blood Air`);
            });

            test('Uses shop prices for Ironmen', async () =>
            {
                mockMessage.content = 'water 30, earth 29\nmud 30, nature 20\nblood 30\nair 30';
                await Messages.handleMessage(mockMessage);
                expect(mockMessage.channel.send).toHaveBeenCalledWith(`Mar 05, 2023
Slot 1:
    :Water_rune: Water (Earth 29, Water 30)
Slot 2:
    :Mud_rune: Mud (Mud 30, Nature 20)
    :Blood_rune: Blood (Blood 30)
    :Air_rune: Air (Air 30)
Alts: Earth Mud Blood Air
Iron Alts: Water Nature Blood Air`);
            });
        });
        describe('Error Handling', () =>
        {
            test('No Alternatives for Either Slot', async () =>
            {
                mockMessage.content = 'air 30\nair 30\nair 30, earth 29\nair 30, earth 29';
                await Messages.handleMessage(mockMessage);
                expect(mockMessage.channel.send).toHaveBeenCalledWith('Unable to Calculate Alts - Slot 1 and Slot 2 are the same with no other options');
            });
            test('No Commas', async () =>
            {
                mockMessage.content = 'water 30 earth 29\nmud 30 nature 20\nblood 30\nair 30';
                await Messages.handleMessage(mockMessage);
                expect(mockMessage.channel.send).toHaveBeenCalledWith('Invalid Format - Are you missing any commas or spaces?');
            });
            test('No Spaces', async () =>
            {
                mockMessage.content = 'water30, earth29\nmud 30,nature20\nblood 30\nair 30';
                await Messages.handleMessage(mockMessage);
                expect(mockMessage.channel.send).toHaveBeenCalledWith('Invalid Format - Are you missing any commas or spaces?');
            });
            test('Extra Spaces', async () =>
            {
                mockMessage.content = 'water    30, earth 29\nmud 30, nature 20   \nblood 30 \n    air   30 ';
                await Messages.handleMessage(mockMessage);
                expect(mockMessage.channel.send).toHaveBeenCalledWith(`Mar 05, 2023
Slot 1:
    :Water_rune: Water (Earth 29, Water 30)
Slot 2:
    :Mud_rune: Mud (Mud 30, Nature 20)
    :Blood_rune: Blood (Blood 30)
    :Air_rune: Air (Air 30)
Alts: Earth Mud Blood Air
Iron Alts: Water Nature Blood Air`);
            });
            test('Mispelled Rune', async () =>
            {
                mockMessage.content = 'wate 30, earth 29\nmud 30,nature 20\nblood 30\nair 30';
                await Messages.handleMessage(mockMessage);
                expect(mockMessage.channel.send).toHaveBeenCalledWith('Invalid Format - Did you misspell a rune?');
            });
            test('Capitalized Rune', async () =>
            {
                mockMessage.content = 'WATER 30, earTh 29\nmud 30,nature 20\nblood 30\nair 30';
                await Messages.handleMessage(mockMessage);
                expect(mockMessage.channel.send).toHaveBeenCalledWith(`Mar 05, 2023
Slot 1:
    :Water_rune: Water (Earth 29, Water 30)
Slot 2:
    :Mud_rune: Mud (Mud 30, Nature 20)
    :Blood_rune: Blood (Blood 30)
    :Air_rune: Air (Air 30)
Alts: Earth Mud Blood Air
Iron Alts: Water Nature Blood Air`);
            });
            test('Missing Amount', async () =>
            {
                mockMessage.content = 'water, earth 29\nmud 30,nature 20\nblood 30\nair 30';
                await Messages.handleMessage(mockMessage);
                expect(mockMessage.channel.send).toHaveBeenCalledWith('Invalid Format - Are you missing any commas or spaces?');
            });
            test('Non Numeric Amount', async () =>
            {
                mockMessage.content = 'water f, earth 29\nmud 30,nature 20\nblood 30\nair 30';
                await Messages.handleMessage(mockMessage);
                expect(mockMessage.channel.send).toHaveBeenCalledWith('Invalid Format - Did you mistype an amount of wax?');
            });
            test('Message Less than 4 Lines', async () =>
            {
                mockMessage.content = 'water 30, earth 29\nmud 30,nature 20\nblood 30';
                await Messages.handleMessage(mockMessage);
                expect(mockMessage.channel.send).toHaveBeenCalledTimes(0);
            });
            test('Message More than 4 Lines', async () =>
            {
                mockMessage.content = 'water 30, earth 29\nmud 30,nature 20\nblood 30\nair 30\nmist 30';
                await Messages.handleMessage(mockMessage);
                expect(mockMessage.channel.send).toHaveBeenCalledTimes(0);
            });
            test('Unable to fetch Rune prices', async () =>
            {
                mockMessage.content = 'water 30, earth 29\nmud 30,nature 20\nblood 30\nair 30';
                Axios.get.mockReset().mockRejectedValue(new Error('Unable to fetch prices'));
                await Messages.handleMessage(mockMessage);
                expect(mockMessage.channel.send).toHaveBeenCalledWith('Unable to reach GE Server');
            });
            test('Unable to fetch Wax prices', async () =>
            {
                mockMessage.content = 'water 30, earth 29\nmud 30,nature 20\nblood 30\nair 30';
                Axios.get.mockReset().mockReturnValueOnce(runePrices).mockRejectedValue(new Error('Unable to fetch prices'));
                await Messages.handleMessage(mockMessage);
                expect(mockMessage.channel.send).toHaveBeenCalledWith('Unable to reach GE Server');
            });
        });
        describe('Notable Runes', () =>
        {
            test('Iron Alt is Primary Rune', async () =>
            {
                mockMessage.content = 'water 30, lava 29, mist 28, mud 27, steam 26, smoke 25, dust 24\nnature 30\nastral 30\nblood 30';
                await Messages.handleMessage(mockMessage);
                expect(mockMessage.channel.send).toHaveBeenCalledWith(`Mar 05, 2023
Slot 1:
    :Water_rune: Water (Water 30, Lava 29, Smoke 25, Mud 27)
Slot 2:
    :Nature_rune: Nature (Nature 30)
    :Astral_rune: Astral (Astral 30)
    :Blood_rune: Blood (Blood 30)
Alts: Water Nature Astral Blood
Iron Alts: Water Nature Astral Blood`);
            });
            test('Iron Alt is in Top 3 Alts', async () =>
            {
                mockMessage.content = 'lava 30, mist 27, mud 26, steam 25, smoke 24, dust 23, water 29, fire 28\nnature 30\nastral 30\nblood 30';
                await Messages.handleMessage(mockMessage);
                expect(mockMessage.channel.send).toHaveBeenCalledWith(`Mar 05, 2023
Slot 1:
    :Lava_rune: Lava (Fire 28, Water 29, Lava 30, Smoke 24)
Slot 2:
    :Nature_rune: Nature (Nature 30)
    :Astral_rune: Astral (Astral 30)
    :Blood_rune: Blood (Blood 30)
Alts: Fire Nature Astral Blood
Iron Alts: Water Nature Astral Blood`);
            });
            test('Iron Alt is not Primary or Top 2 Alt', async () =>
            {
                mockMessage.content = 'mist 30, water 29, fire 28, law 27, chaos 26, body 25, mind 24, earth 23, air 22\nnature 30\nastral 30\nblood 30';
                await Messages.handleMessage(mockMessage);
                expect(mockMessage.channel.send).toHaveBeenCalledWith(`Mar 05, 2023
Slot 1:
    :Mist_rune: Mist (Law 27, Body 25, Water 29, Mist 30)
Slot 2:
    :Nature_rune: Nature (Nature 30)
    :Astral_rune: Astral (Astral 30)
    :Blood_rune: Blood (Blood 30)
Alts: Law Nature Astral Blood
Iron Alts: Water Nature Astral Blood`);
            });
            test('5 Runes displayed when multiple Iron Alts not Primary or Top 2 Alts', async () =>
            {
                mockMessage.content = 'mist 30, water 29, fire 28, law 27, chaos 26, body 25, mind 24, earth 23, air 22\nwater 30\nastral 30\nblood 30';
                await Messages.handleMessage(mockMessage);
                expect(mockMessage.channel.send).toHaveBeenCalledWith(`Mar 05, 2023
Slot 1:
    :Mist_rune: Mist (Law 27, Body 25, Fire 28, Water 29, Mist 30)
Slot 2:
    :Water_rune: Water (Water 30)
    :Astral_rune: Astral (Astral 30)
    :Blood_rune: Blood (Blood 30)
Alts: Law Water Astral Blood
Iron Alts: Water/Fire Water Astral Blood`);
            });
            test('Multiple Iron Alts One is Primary', async () =>
            {
                mockMessage.content = 'water 30, fire 28, law 27, chaos 26, body 25, mind 24, earth 23, air 22\nwater 30\nastral 30\nblood 30';
                await Messages.handleMessage(mockMessage);
                expect(mockMessage.channel.send).toHaveBeenCalledWith(`Mar 05, 2023
Slot 1:
    :Water_rune: Water (Law 27, Body 25, Fire 28, Water 30)
Slot 2:
    :Water_rune: Water (Water 30)
    :Astral_rune: Astral (Astral 30)
    :Blood_rune: Blood (Blood 30)
Alts: Law Water Astral Blood
Iron Alts: Water/Fire Water Astral Blood`);
            });
            test('Multiple Iron Alts One is Top 2 Alt', async () =>
            {
                mockMessage.content = 'mist 30, lava 29, fire 3, astral 2, water 1\nwater 30\nfire 30\nblood 30';
                await Messages.handleMessage(mockMessage);
                expect(mockMessage.channel.send).toHaveBeenCalledWith(`Mar 05, 2023
Slot 1:
    :Mist_rune: Mist (Lava 29, Fire 3, Water 1, Mist 30)
Slot 2:
    :Water_rune: Water (Water 30)
    :Fire_rune: Fire (Fire 30)
    :Blood_rune: Blood (Blood 30)
Alts: Lava Water Fire Blood
Iron Alts: Fire/Water Water Fire Blood`);
            });
        });
    });

    describe('Slash Command Input', () =>
    {
        let mockInteraction;
        beforeEach(() =>
        {
            mockInteraction = {
                commandName: 'alts', deferReply: jest.fn(), options: { getInteger: jest.fn() }, client: { emojis: { cache: emojiCache } }, editReply: jest.fn(),
            };
            mockInteraction.options.getInteger.mockReturnValue(null);
        });
        test('Invalid Slash Command', async () =>
        {
            mockInteraction.commandName = 'invalid_command_name';
            await Commands.handleSlashCommand(mockInteraction);
            expect(mockInteraction.editReply).toHaveBeenCalledTimes(0);
        });
        test('Error during Alt Calculation', async () =>
        {
            Axios.get.mockReset().mockRejectedValue(new Error('Unable to fetch prices'));
            await Commands.handleSlashCommand(mockInteraction);
            expect(mockInteraction.editReply).toHaveBeenCalledWith('Unable to reach GE Server');
        });
        test('Calculates todays alts by default', async () =>
        {
            await Commands.handleSlashCommand(mockInteraction);
            expect(mockInteraction.editReply).toHaveBeenCalledWith(`Mar 05, 2023
Slot 1:
    :Death_rune: Death (Death 30, Chaos 24, Astral 27)
Slot 2:
    :Lava_rune: Lava (Law 26, Death 27, Body 22, Lava 30)
    :Astral_rune: Astral (Chaos 28, Astral 30, Mind 18, Law 17)
    :Chaos_rune: Chaos (Chaos 30, Mind 25, Law 27, Water 26)
Alts: Death Law Chaos Chaos
Iron Alts: Death/Astral Death Astral Chaos`);
        });
        test('Calculates date with negative offset', async () =>
        {
            mockInteraction.options.getInteger.mockReturnValue(-1);
            await Commands.handleSlashCommand(mockInteraction);
            expect(mockInteraction.editReply).toHaveBeenCalledWith(`Mar 04, 2023
Slot 1:
    :Earth_rune: Earth (Earth 30, Smoke 28, Chaos 21, Fire 20)
Slot 2:
    :Body_rune: Body (Body 30, Cosmic 29, Mind 21, Chaos 22)
    :Fire_rune: Fire (Fire 30, Body 26, Mind 25, Cosmic 27)
    :Astral_rune: Astral (Air 25, Astral 30, Earth 20, Water 28)
Alts: Earth Body Fire Air
Iron Alts: Earth Body Fire Water`);
        });
        test('Calculates date with positive offset', async () =>
        {
            mockInteraction.options.getInteger.mockReturnValue(1);
            await Commands.handleSlashCommand(mockInteraction);
            expect(mockInteraction.editReply).toHaveBeenCalledWith(`Mar 06, 2023
Slot 1:
    :Law_rune: Law (Law 30, Body 28, Fire 23, Smoke 25)
Slot 2:
    :Mind_rune: Mind (Mind 30, Chaos 26, Earth 22, Fire 24)
    :Water_rune: Water (Air 22, Water 30, Cosmic 24, Lava 28)
    :Steam_rune: Steam (Mind 29, Cosmic 21, Water 23, Steam 30)
Alts: Law Mind Air Mind
Iron Alts: Body Mind Water Mind`);
        });
    });
});
