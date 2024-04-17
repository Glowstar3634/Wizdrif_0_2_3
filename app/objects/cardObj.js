class Card {
    constructor(cardID, poster, subject, topic, title, answer1, answer2, answer3, answer4, correct, hasPic, views) {
        this.cardID = cardID;
        this.poster = poster;
        this.subject = subject;
        this.topic = topic;
        this.title = title;
        this.answer1 = answer1;
        this.answer2 = answer2;
        this.answer3 = answer3;
        this.answer4 = answer4;
        this.correct = correct;
        this.hasPic = hasPic;
        this.views = views;
        this.private = false;
        this.tags = [];
        this.image = [];
    }

    getCardID() {
        return this.cardID;
    }
    setCardID(cardID) {
        this.cardID = cardID;
    }

    getTags() {
        return this.tags;
    }
    setTags(tag) {
        this.tags = tag;
    }

    getPrivate(){
        return this.private
    }
    setPrivate(pri){
        this.private = pri;
    }

    getPoster() {
        return this.poster;
    }
    setPoster(poster) {
        this.poster = poster;
    }

    getSubject() {
        return this.subject;
    }
    setSubject(subject) {
        this.subject = subject;
    }

    getTopic() {
        return this.topic;
    }
    setTopic(topic) {
        this.topic = topic;
    }

    getTitle() {
        return this.title;
    }
    setTitle(title) {
        this.title = title;
    }

    getAnswer1() {
        return this.answer1;
    }
    setAnswer1(answer1) {
        this.answer1 = answer1;
    }

    getAnswer2() {
        return this.answer2;
    }
    setAnswer2(answer2) {
        this.answer2 = answer2;
    }

    getAnswer3() {
        return this.answer3;
    }
    setAnswer3(answer3) {
        this.answer3 = answer3;
    }

    getAnswer4() {
        return this.answer4;
    }
    setAnswer4(answer4) {
        this.answer4 = answer4;
    }

    getCorrect() {
        return this.correct;
    }
    setCorrect(correct) {
        this.correct = correct;
    }

    getHasPic() {
        return this.hasPic;
    }
    setHasPic(hasPic) {
        this.hasPic = hasPic;
    }

    getImage(){
        return this.image;
    }

    setImage(img){
        this.image = img;
    }

    getViews() {
        return this.views;
    }
    setViews(views) {
        this.views = views;
    }
}
export default Card;