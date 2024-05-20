class DuelQueue {
    constructor(host = null, guest = null, ranked = null, wager = null, matched = null, hostLoad = null, guestLoad = null, ready = null) {
        this.host = host;
        this.guest = guest;
        this.ranked = ranked;
        this.wager = wager;
        this.matched = matched;
        this.hostLoad = hostLoad;
        this.guestLoad = guestLoad;
        this.ready = ready;
    }

    // Getters
    getHost() {
        return this.host;
    }

    getGuest() {
        return this.guest;
    }

    getRanked() {
        return this.ranked;
    }

    getWager() {
        return this.wager;
    }

    getMatched() {
        return this.matched;
    }

    getHostLoad() {
        return this.hostLoad;
    }

    getGuestLoad() {
        return this.guestLoad;
    }

    getReady() {
        return this.ready;
    }

    // Setters
    setHost(value) {
        this.host = value;
    }

    setGuest(value) {
        this.guest = value;
    }

    setRanked(value) {
        this.ranked = value;
    }

    setWager(value) {
        this.wager = value;
    }

    setMatched(value) {
        this.matched = value;
    }

    setHostLoad(value) {
        this.hostLoad = value;
    }

    setGuestLoad(value) {
        this.guestLoad = value;
    }

    setReady(value) {
        this.ready = value;
    }
}

export default DuelQueue;
