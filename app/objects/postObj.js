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

    like() {
        this.likes++;
    }

    unlike() {
        this.likes--;
    }

    setPics(pics) {
        this.pics = pics;
    }

    setTags(tag) {
        this.tags = tag;
    }

    setPrivate(priv) {
        this.private = priv;
    }
}

export default Post;