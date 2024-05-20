class Match {
    constructor(settings = null, state = null, plays = null, completed = null) {
        this.settings = settings;
        this.state = state;
        this.plays = plays;
        this.completed = completed;
    }

    getSettings() {
        return this.settings;
    }

    getState() {
        return this.state;
    }

    getPlays() {
        return this.plays;
    }

    getCompleted() {
        return this.completed;
    }

    setSettings(value) {
        this.settings = value;
    }

    setState(value) {
        this.state = value;
    }

    setPlays(value) {
        this.plays = value;
    }

    setCompleted(value) {
        this.completed = value;
    }
}

export default Match;
