class DuelState {
    constructor(
        hostHP = 100,
        hostMP = 100,
        hostMPR = 15,
        hostDmg = 1,
        hostDef = 1,
        guestHP = 100,
        guestMP = 100,
        guestMPR = 15,
        guestDmg = 1,
        guestDef = 1,
        hostTurn = true,
        relicSlots = 3
    ) {
        this.hostHP = hostHP;
        this.hostMP = hostMP;
        this.hostMPR = hostMPR;
        this.hostDmg = hostDmg;
        this.hostDef = hostDef;

        this.guestHP = guestHP;
        this.guestMP = guestMP;
        this.guestMPR = guestMPR;
        this.guestDmg = guestDmg;
        this.guestDef = guestDef;

        this.hostTurn = hostTurn
        this.relicSlots = relicSlots
    }

    // Getters
    getHostHP() {
        return this.hostHP;
    }

    getHostMP() {
        return this.hostMP;
    }

    getHostMPR() {
        return this.hostMPR;
    }

    getHostDmg() {
        return this.hostDmg;
    }

    getHostDef() {
        return this.hostDef;
    }

    getGuestHP() {
        return this.guestHP;
    }

    getGuestMP() {
        return this.guestMP;
    }

    getGuestMPR() {
        return this.guestMPR;
    }

    getGuestDmg() {
        return this.guestDmg;
    }

    getGuestDef() {
        return this.guestDef;
    }

    getHostTurn() {
        return this.hostTurn;
    }

    getRelicSlots() {
        return this.relicSlots;
    }

    // Setters
    setHostHP(value) {
        this.hostHP = value;
    }

    setHostMP(value) {
        this.hostMP = value;
    }

    setHostMPR(value) {
        this.hostMPR = value;
    }

    setHostDmg(value) {
        this.hostDmg = value;
    }

    setHostDef(value) {
        this.hostDef = value;
    }

    setGuestHP(value) {
        this.guestHP = value;
    }

    setGuestMP(value) {
        this.guestMP = value;
    }

    setGuestMPR(value) {
        this.guestMPR = value;
    }

    setGuestDmg(value) {
        this.guestDmg = value;
    }

    setGuestDef(value) {
        this.guestDef = value;
    }

    setHostTurn(value) {
        this.hostTurn = value;
    }

    setRelicSlots(value) {
        this.relicSlots = value;
    }
}

export default DuelState;
