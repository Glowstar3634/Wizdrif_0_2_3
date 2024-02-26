class Post {
    constructor(p, st, d, t, pt, tp) {
        this.poster = p;
        this.subjectText = st;
        this.description = d;
        this.title = t;
        this.postType = pt;
        this.topic = tp;
        this.views = 0;
        this.pics = 0;
        this.postID = ''; // Initialize with an empty string or null
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

    getDescription() {
        return this.description;
    }

    getViews() {
        return this.views;
    }

    getPostID() {
        return this.postID;
    }

    getPics() {
        return this.pics;
    }

    setPostID(postID) {
        this.postID = postID;
    }

    setViews(views) {
        this.views = views;
    }

    setPics(pics) {
        this.pics = pics;
    }
}
