The bot is designed to assist with the online game Runescape. Within the game each day you can craft a certain amount of Vis Wax using a variety of different runes. Each of these runes has a different cost on the market and the amount of wax they produce also changes each day. This tool aids the task of hand calculating which is the optimal profit for the day. More information on Vis Wax and what is going on in the game can be found [on the Runescape Wiki](https://runescape.wiki/w/Rune_Goldberg_Machine)

The bot takes an input message in a specified Discord channel that is 4 lines long and each line is a set of comma seperate values in the format of (rune) (wax amount).
For example, the runes for September 13, 2019 would be input to the bot as follows:
>Astral 30, Earth 24, Air 27, Chaos 25  
>Blood 30, Body 27, Chaos 25, Air 23  
>Mud 30, Mind 24, Chaos 22, Water 26  
>Fire 30, Air 24, Water 26  

The bot also supports a slash command to calculate the alts for the current date considering all values for all Runes in Slot 1 and Slot 2.
> /alts
This command can optionally take an offset parameter that will tell you the alts for a given date offset from today.
> /alts -1

The bot will also post the alts to configured channels every day at midnight UTC and delete prior messages by the bot. If the bot has permissions and is posting to an announcement channel, it will publish the mssage.

## Configuring the Bot

The bot will read configuration from the `auth.js` file. An `example_auth.js` file has been included to show how this file should be formatted.

A bot must be created from the Discord Developer Portal in order to acquire a token and clientId. Documenation on this can be found on the [Discord.js documentation](https://discordjs.guide/preparations/setting-up-a-bot-application.html). The bot must be given permissions to read messages, send messages, and register slash commands. GuildIds and ChannelIds can be found when running Discord in Developer mode.

## Running the Bot

Run the following commands after configuring the bot.
>npm i  
>npm run start  


### Running the Bot in Production

Run the following commands to start the bot such that it will restart once daily, after crashes, and after any system restart.
> npm i  
> npm run start-prod  

## Tests

Run the following commands
> npm i  
> npm run test  

## Lint

Run the following commands
> npm i  
> npm run lint

Optionally to auto-correct linting
> npm run lint -- --fix  

# Credit

Credit to Cook#2222 on Discord/ /u/cookmeplox on Reddit for Discovering the Rune Goldberg Algorithm and implementing it into Javascript

Credit to doge#2526 on Discord for making the waxy boy bot which inspired Wax Bot

Credit to Sir Azder#8638 on Discord / /u/KhalRS3 on Reddit for designing the Vis Wax Logo

# Required Documents

## Terms of Service

Wax Bot is a Discord Bot that calculates optimal profit of crafting Vis Wax in the online game Runescape  
Copyright (C) 2019 Dustin Hengel

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but without any warranty; without even the implied warranty of merchantability or fitness for a particular purpose. See the GNU General Public License for more details.

See https://www.gnu.org/licenses/.

As a user with Manage Server permissions on a Discord Server, by adding the Wax Bot to your server, you agree to the Privacy Policy.

## Privacy Policy

The deployed instance of Wax Bot managed and owned by the "Vis Wax!" Discord Server has permission to read all messages sent in all Discord Servers the bot is a member in.  
The Wax Bot reads and processes all chat messages sent to the following channels:  
* #secretwaxroom chat channel of the "Vis Wax!" Discord Server  
* #general chat channel of the "TestServer" Discord Server operated by MindArkantos

The Wax Bot does not persist any data, store any data, or send any data to external sources. Contents of messages are only used to determine optimal combinations of Vis Wax based on the contents of specifically formatted CSV messages.  
