class Orb {
    constructor(type) {
        this.type = type
    }

    static icon(type) {
        const s1 = require('../../constants/images/Orbs/Wizdrif-Math-Orb.png');
        const s2 = require('../../constants/images/Orbs/Wizdrif-Science-Orb.png');
        const s3 = require('../../constants/images/Orbs/Wizdrif-English-Orb.png');
        const s4 = require('../../constants/images/Orbs/Wizdrif-Social-Studies-Orb.png');
        const s5 = require('../../constants/images/Orbs/Wizdrif-BE-Orb.png');
        const s6 = require('../../constants/images/Orbs/Wizdrif-Engineering-Orb.png');
        const s7 = require('../../constants/images/Orbs/Wizdrif-Programming-Orb.png');
        const s8 = require('../../constants/images/Orbs/Wizdrif-Special-Orb.png');
        const allRelicIcons = [s1, s2, s3, s4, s5, s6, s7, s8];
      
        if (type == "0"){
            return require('../../constants/images/Orbs/Wizdrif-Mystery-Orb.png')
        }
      
        return allRelicIcons[type-1];
    }

    static frame(relicID) {
        const allRelicFrames = [require('../../constants/images/Orbs/Math-Orb-Frame.png'), require('../../constants/images/Orbs/Science-Orb-Frame.png'), require('../../constants/images/Orbs/English-Orb-Frame.png'), require('../../constants/images/Orbs/Social-Studies-Orb-Frame.png'), require('../../constants/images/Orbs/BE-Orb-Frame.png'), require('../../constants/images/Orbs/Engineering-Orb-Frame.png'), require('../../constants/images/Orbs/Programming-Orb-Frame.png'), require('../../constants/images/Orbs/Special-Orb-Frame.png')];
      
        const sub = parseInt(relicID.split('-')[0]) - 1;

        if (relicID == "0-0"){
            return require('../../constants/images/Orbs/Hidden-Frame.png')
        }
      
        return allRelicFrames[sub];
    }

    static name(type) {
        const names1 = "Math Orb";
        const names2 = "Science Orb";
        const names3 = "English Orb";
        const names4 = "Social Studies Orb";
        const names5 = "Economics Orb";
        const names6 = "Engineering Orb";
        const names7 = "Programming Orb";
        const names8 = "Special Orb";
    
        const allRelicNames = [names1, names2, names3, names4, names5, names6, names7, names8];
    
        if (type === "0") {
            return "";
        }
    
        return allRelicNames[type-1];
    }
    
    getType() {
        return this.type;
    }
}

export default Orb;
