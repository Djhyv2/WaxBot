The bot is designed to assist with the online game Runescape. Within the game each day you can craft a certain amount of Vis Wax using a variety of different runes. Each of these runes has a different cost on the market and the amount of wax they produce also changes each day. Me and a group of friends find out which runes create how much wax each day, but needed a tool to ease the task of hand calculating which is the optimal profit for the day. The following link has more information on Vis Wax and what is going on in the game: [Rune Goldberg Machine](https://runescape.wiki/w/Rune_Goldberg_Machine)

The bot takes an input message that is 4 lines long and each line is a set of comma seperate values in the format of (rune) (wax amount)  
For example, the runes for September 13, 2019 would be input to the bot as follows:
>Astral 30, Earth 24, Air 27, Chaos 25  
>Blood 30, Body 27, Chaos 25, Air 23  
>Mud 30, Mind 24, Chaos 22, Water 26  
>Fire 30, Air 24, Water 26  

There is also 10 test cases I used located [here](tests.txt)