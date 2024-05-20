class Loadout {
    constructor(n,r) {
        this.name = n;
        this.relics = r;
    }

    getRelics() {
        return this.relics;
    }

    getName() {
        return this.name;
    }

    setRelics(r) {
        this.relics = r;
    }

    setName(n) {
        this.name = n;
    }
}

export default Loadout;