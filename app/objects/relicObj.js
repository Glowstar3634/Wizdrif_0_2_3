class Relic {
    constructor(relicID, name, desc, damage, heal, manaCost, strength, hardness, duration, hidden, ability) {
        this.relicID = relicID;
        this.name = name;
        this.desc = desc;
        this.damage = damage;
        this.heal = heal;
        this.manaCost = manaCost;
        this.strength = strength;
        this.hardness = hardness;
        this.duration = duration;
        this.hidden = hidden;
        this.ability = ability;
    }

    static icon(relicID) {
        const s1 = [require('../../constants/images/Relics/Wizdrif-Math-Relic-Singularity.png'), require('../../constants/images/Relics/Wizdrif-Math-Relic-Blade-of-Sin.png'), require('../../constants/images/Relics/Wizdrif-Math-Relic-i.png')];
        const s2 = [require('../../constants/images/Relics/Wizdrif-Science-Relic-Combustion.png'), require('../../constants/images/Relics/Wizdrif-Science-Relic-Terminal-Velocity.png'), require('../../constants/images/Relics/Wizdrif-Science-Relic-Neutralizer.png')];
        const s3 = [require('../../constants/images/Relics/Wizdrif-English-Relic-Analysis.png'), require('../../constants/images/Relics/Wizdrif-English-Relic-Eraser.png'), require('../../constants/images/Relics/Wizdrif-English-Relic-Fast-Reader.png')];
        const s4 = [require('../../constants/images/Relics/Wizdrif-Social-Studies-Relic-To-the-Battlefield.png'), require('../../constants/images/Relics/Wizdrif-Social-Studies-Relic-Napoleons-Charge.png'), require('../../constants/images/Relics/Wizdrif-Social-Studies-Relic-Tax.png')];
        const s5 = [require('../../constants/images/Relics/Wizdrif-BE-Relic-Bullisher.png'), require('../../constants/images/Relics/Wizdrif-BE-Relic-Self-Promo.png'), require('../../constants/images/Relics/Wizdrif-BE-Relic-Market-Crash.png'), require('../../constants/images/Relics/Wizdrif-BE-Relic-Inflation.png')];
        const s6 = [require('../../constants/images/Relics/Wizdrif-Engineering-Relic-Robotic-Slam.png'), require('../../constants/images/Relics/Wizdrif-Engineering-Relic-Design-Failure.png'), require('../../constants/images/Relics/Wizdrif-Engineering-Relic-Wire-Shock.png')];
        const s7 = [require('../../constants/images/Relics/Wizdrif-Programming-Relic-AI-Takeover.png'), require('../../constants/images/Relics/Wizdrif-Programming-Relic-Bugged-Out.png'), require('../../constants/images/Relics/Wizdrif-Programming-Relic-Out-of-Bounds.png'), require('../../constants/images/Relics/Wizdrif-Programming-Relic-Test-Script.png')];
        const s8 = [require('../../constants/images/Relics/Wizdrif-Special-Relic-Paralyze.png'), require('../../constants/images/Relics/Wizdrif-Special-Relic-Headache.png')];
        const allRelicIcons = [s1, s2, s3, s4, s5, s6, s7, s8];
      
        const sub = parseInt(relicID.split('-')[0]) - 1;
        const num = parseInt(relicID.split('-')[1]) - 1;

        if (relicID == "0-0"){
            return require('../../constants/images/Relics/Hidden-Relic.png')
        }
      
        return allRelicIcons[sub][num];
    }

    static frame(relicID) {
        const allRelicFrames = [require('../../constants/images/Orbs/Math-Orb-Frame.png'), require('../../constants/images/Orbs/Science-Orb-Frame.png'), require('../../constants/images/Orbs/English-Orb-Frame.png'), require('../../constants/images/Orbs/Social-Studies-Orb-Frame.png'), require('../../constants/images/Orbs/BE-Orb-Frame.png'), require('../../constants/images/Orbs/Engineering-Orb-Frame.png'), require('../../constants/images/Orbs/Programming-Orb-Frame.png'), require('../../constants/images/Orbs/Special-Orb-Frame.png')];
      
        const sub = parseInt(relicID.split('-')[0]) - 1;

        if (relicID == "0-0"){
            return require('../../constants/images/Orbs/Hidden-Frame.png')
        }
      
        return allRelicFrames[sub];
    }

    static name(relicID) {
        const names1 = ["Singularity", "Blade of Sin", "i"];
        const names2 = ["Combustion", "Terminal Velocity", "Neutralizer"];
        const names3 = ["Analysis", "Eraser", "Fast Reader"];
        const names4 = ["To the Battlefield", "Napoleon's Charge", "Tax"];
        const names5 = ["Bullisher", "Self Promo", "Market Crash", "Inflation"];
        const names6 = ["Robotic Slam", "Design Failure", "Wire Shock"];
        const names7 = ["AI Takeover", "Bugged Out", "Out of Bounds", "Test Script"];
        const names8 = ["Paralyze", "Headache"];
    
        const allRelicNames = [names1, names2, names3, names4, names5, names6, names7, names8];
    
        const sub = parseInt(relicID.split('-')[0]) - 1;
        const num = parseInt(relicID.split('-')[1]) - 1;
    
        if (relicID === "0-0") {
            return "";
        }
    
        return allRelicNames[sub][num];
    }

    static cool(relicID) {
        const names1 = [4, 3, 4];
        const names2 = [1, 0, 2];
        const names3 = [0, 0, 0];
        const names4 = [1, 2, 2];
        const names5 = [2, 3, 2, 2];
        const names6 = [1, 3, 3];
        const names7 = [1, 2, 2, 0];
        const names8 = [6, 6];
    
        const allRelicNames = [names1, names2, names3, names4, names5, names6, names7, names8];
    
        const sub = parseInt(relicID.split('-')[0]) - 1;
        const num = parseInt(relicID.split('-')[1]) - 1;
    
        if (relicID === "0-0") {
            return 0;
        }
    
        return allRelicNames[sub][num];
    }

    static mana(relicID) {
        const names1 = [64, 25, 49];
        const names2 = [30, 20, 15];
        const names3 = [10, 18, 20];
        const names4 = [20, 10, 30];
        const names5 = [15, 15, 25, 25];
        const names6 = [30, 25, 30];
        const names7 = [18, 21, 15, 16];
        const names8 = [30, 30];
    
        const allRelicNames = [names1, names2, names3, names4, names5, names6, names7, names8];
    
        const sub = parseInt(relicID.split('-')[0]) - 1;
        const num = parseInt(relicID.split('-')[1]) - 1;
    
        if (relicID === "0-0") {
            return 0;
        }
    
        return allRelicNames[sub][num];
    }

    static desc(relicID) {
        const names1 = ["Math relic. Gives the opponent no solution, and skips their next turn. They will also take 12 damage.", "Math relic. Oscillates your damage by 30% for this, and your next three turns (+,-,+,-)", "Math relic. User can use the imaginary axis to evade attacks."];
        const names2 = ["Science relic. Causes a fiery blast that deals 25 damage to the opponent.", "Science relic. Crashes the opponent into the ground dealing 18 damage.", "Science relic. Decreases the user’s debuffs by 50%."];
        const names3 = ["English relic. You can now see your opponent’s relic loadout. Can only use one per match.", "English relic. You can switch out two relics from your inventory and loadout. Can only be used once.", "English relic. Increases mana regen by 8. Can only be used once."];
        const names4 = ["Social Studies relic. Lose 20 hp, but increase damage by 20% on this and the next turn.", "Social Studies relic. Decreases your mana by 65%(after cost), but increases the damage of your next turn by 65%.", "Social Studies relic. Steal 15 hp from your opponent."];
        const names5 = ["Business and Economics relic. Regenerates the user's health by 15", "Business and economics relic. Strengthens the user, they now take 10% less damage from all sources.", "Business and Economics relic. Damages the opponent over the span of 3 turns. 10 hp per turn.", "Business and Economics relic. Increases the mana cost for your opponent’s next move by 25%."];
        const names6 = ["Engineering relic. Slams the ground and deals 25 damage to the opponent.", "Engineering relic. Weakens the opponent, they now take 10% more damage from all sources.", "Engineering relic. Deals 20 damage to your opponent, and gives them only two relic slots on their next turn."];
        const names7 = ["Lets you use an extra, random relic from your opponent on your next turn.", "Programming relic. 75% chance of one of your opponent’s next relics to have no effect.", "Programming relic. Reflects damage exceeding 12 from your opponents next turn back to them.", "Deals a random amount of damage ranging from 5-30."];
        const names8 = ["Removes 70% of your opponents mana, and gives them only two relic slots on their next turn.", "Headache - Deals a maximum of 80 damage, minus the damage your opponent dealt to you on their previous turn and minus 50% their missing mana."];
    
        const allRelicNames = [names1, names2, names3, names4, names5, names6, names7, names8];
    
        const sub = parseInt(relicID.split('-')[0]) - 1;
        const num = parseInt(relicID.split('-')[1]) - 1;
    
        if (relicID === "0-0") {
            return "";
        }
    
        return allRelicNames[sub][num];
    }
    
    getRelicID() {
        return this.relicID;
    }

    getName() {
        return this.name;
    }

    getDesc() {
        return this.desc;
    }

    getDamage() {
        return this.damage;
    }

    getHeal() {
        return this.heal;
    }

    getManaCost() {
        return this.manaCost;
    }

    getStrength() {
        return this.strength;
    }

    getHardness() {
        return this.hardness;
    }

    getDuration() {
        return this.duration;
    }

    isHidden() {
        return this.hidden;
    }

    isAbility() {
        return this.ability;
    }
}

export default Relic;
