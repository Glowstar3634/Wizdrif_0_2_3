class Post {
    constructor(p, st, d, t, pt, tp) {
        this.poster = p;
        this.subjectText = st;
        this.description = d;
        this.title = t;
        this.postType = pt;
        this.topic = tp;
        this.likes = 0;
        this.pics = 0;
        this.postID = '';
        this.private = false;
        this.tags = [];
        this.images = [];

    }

    getPoster() {
        return this.poster;
    }

    getTitle() {
        return this.title;
    }

    getPostType() {
        return this.postType;
    }

    getSubjectText() {
        return this.subjectText;
    }

    getTopic() {
        return this.topic;
    }

    getTags() {
        return this.tags;
    }

    getDescription() {
        return this.description;
    }

    getImages() {
        return this.images;
    }

    getLikes() {
        return this.likes;
    }

    getPostID() {
        return this.postID;
    }

    getPics() {
        return this.pics;
    }

    getPrivate() {
        return this.private;
    }

    setPostID(postID) {
        this.postID = postID;
    }

    setLikes(like){
        this.likes = like;
    }

    like() {
        this.likes++;
    }

    unlike() {
        this.likes--;
    }

    setPics(pics) {
        this.pics = pics;
    }

    setPoster(p){
        this.poster = p;
    }

    setTags(tag) {
        this.tags = tag;
    }

    setImages(img) {
        this.images = img;
    }

    addImages(img) {
        (this.images).push(img);
    }

    addTags(tag) {
        (this.tags).push(tag);
    }

    setPrivate(priv) {
        this.private = priv;
    }
}

export default Post;