module.exports = class Printing
{
    static capitalizeFirst(string)
    {
        return string.charAt(0).toUpperCase() + string.slice(1);//Capitalize first letter of string
    }

    static printSlot(slot, printRestricted = false, ironAlts = [])
    {
        let string = '';
        string += `${this.capitalizeFirst(slot[0].rune)} `;
        if (1 < slot.length)
        {
            string += '(';
        }
        for (let i = 1; i < slot.length; i += 1)
        {
            //Restricts slot to only first 2 alts, main rune or iron alt
            if (printRestricted)
            {
                if (4 < i && !ironAlts.includes(slot[i].rune) && slot[i].rune !== slot[0].rune)
                {
                    continue;
                }
            }
            string += `${this.capitalizeFirst(slot[i].rune)} ${slot[i].wax}`;
            if (!printRestricted && i + 1 < slot.length)
            {
                string += ', ';
            }
            if (printRestricted && i + 1 < slot.length && (4 < i + 1 || ironAlts.includes(slot[i].rune) || slot[i].rune === slot[0].rune))
            {
                string += ', ';
            }
        }
        if (1 < slot.length)
        {
            string += ')';
        }
        return string;
    }//Converts array of rune and wax into string

    //Creates readable version of alts
    static createMessage(computedData, alts, ironAlts, printRestricted = false)
    {
        const date = new Date().toLocaleDateString(
            'en-US',
            {
                timeZone: 'UTC',
                month: 'short',
                day: '2-digit',
                year: 'numeric',
            },
        );//Gets current date

        const slot1IronAlts = [ironAlts[0].rune];
        if (ironAlts[1])
        {
            slot1IronAlts.push(ironAlts[2].rune);
        }
        const responseMessage = `${date}\nSlot 1:\n\t${this.printSlot(computedData[0], printRestricted, slot1IronAlts)}\n
        Slot 2:\n\t${this.printSlot(computedData[1], printRestricted, [ironAlts[2].rune])}\n\t${this.printSlot(computedData[2], printRestricted, [ironAlts[3].rune])}\n\t${this.printSlot(computedData[3], printRestricted, [ironAlts[4].rune])}\nAlts: ${this.capitalizeFirst(alts[0].rune)}${null != alts[1] ? `/${this.capitalizeFirst(alts[1].rune)}` : ''} ${this.capitalizeFirst(alts[2].rune)} ${this.capitalizeFirst(alts[3].rune)} ${this.capitalizeFirst(alts[4].rune)} \nIron Alts: ${this.capitalizeFirst(ironAlts[0].rune)}${null != ironAlts[1] ? `/${this.capitalizeFirst(ironAlts[1].rune)}` : ''} ${this.capitalizeFirst(ironAlts[2].rune)} ${this.capitalizeFirst(ironAlts[3].rune)} ${this.capitalizeFirst(ironAlts[4].rune)} `;
        return responseMessage;
    }
};
