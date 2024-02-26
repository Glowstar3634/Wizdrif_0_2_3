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
        const s1 = ['../constants/images/Relics/Wizdrif-Math-Relic-Singularity.png', '../constants/images/Relics/Wizdrif-Math-Relic-Blade-of-Sin.png', '../constants/images/Relics/Wizdrif-Math-Relic-i.png'];
        const s2 = ['../constants/images/Relics/Wizdrif-Science-Relic-Combustion.png', '../constants/images/Relics/Wizdrif-Science-Relic-Terminal-Velocity.png', '../constants/images/Relics/Wizdrif-Science-Relic-Neutralizer.png'];
        const s3 = ['../constants/images/Relics/Wizdrif-English-Relic-Analysis.png', '../constants/images/Relics/Wizdrif-English-Relic-Eraser.png', '../constants/images/Relics/Wizdrif-English-Relic-Fast-Reader.png'];
        const s4 = ['../constants/images/Relics/Wizdrif-Social-Studies-Relic-To-the-Battlefield.png', '../constants/images/Relics/Wizdrif-Social-Studies-Relic-Napoleons-Charge.png', '../constants/images/Relics/Wizdrif-Social-Studies-Relic-Tax.png'];
        const s5 = ['../constants/images/Relics/Wizdrif-BE-Relic-Bullisher.png', '../constants/images/Relics/Wizdrif-BE-Relic-Self-Promo.png', '../constants/images/Relics/Wizdrif-BE-Relic-Market-Crash.png', '../constants/images/Relics/Wizdrif-BE-Relic-Inflation.png'];
        const s6 = ['../constants/images/Relics/Wizdrif-Engineering-Relic-Robotic-Slam.png', '../constants/images/Relics/Wizdrif-Engineering-Relic-Design-Failure.png', '../constants/images/Relics/Wizdrif-Engineering-Relic-Wire-Shock.png'];
        const s7 = ['../constants/images/Relics/Wizdrif-Programming-Relic-AI-Takeover.png', '../constants/images/Relics/Wizdrif-Programming-Relic-Bugged-Out.png', '../constants/images/Relics/Wizdrif-Programming-Relic-Out-of-Bounds.png', '../constants/images/Relics/Wizdrif-Programming-Relic-Test-Script.png'];
        const s8 = ['../constants/images/Relics/Wizdrif-Special-Relic-Paralyze.png', '../constants/images/Relics/Wizdrif-Special-Relic-Headache.png'];
        const allRelicIcons = [s1, s2, s3, s4, s5, s6, s7, s8];
      
        const sub = parseInt(relicID.split('-')[0]) - 1;
        const num = parseInt(relicID.split('-')[1]) - 1;
      
        return allRelicIcons[sub][num];
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
