class Profile {

    constructor(u, fn, ln, pw, e, a, g,acc,b,l,x,s,pf,f,p) {
        if(arguments.length == 0){
            this.username = null;
            this.firstName = null;
            this.lastName = null;
            this.password = null;
            this.email = null;
            this.age = null;
            this.grade = null;
            this.account = 0;
            this.bio = null;
            this.level = null;
            this.xp = null;
            this.strikes = 0;
            this.pfp = null;
            this.friends = [];
            this.posts = [];
        }
        else if(arguments.length == 7){
            this.username = u;
            this.firstName = fn;
            this.lastName = ln;
            this.password = p;
            this.email = e;
            this.age = a;
            this.grade = g;
            this.account = acc;
            this.bio = "";
            this.level = 0;
            this.xp = 0;
            this.strikes = 0;
            this.pfp = null;
            this.friends = [];
            this.posts = [];
        }
        else{
            this.username = u;
        this.firstName = fn;
        this.lastName = ln;
        this.password = pw;
        this.email = e;
        this.age = a;
        this.grade = g;
        this.account = acc;
        this.bio = b;
        this.level = l;
        this.xp = x;
        this.strikes = s;
        this.pfp = pf;
        this.friends = f;
        this.posts = p;
        }
    }

    setUsername(u) {
        this.username = u;
    }

    setLevel(level) {
        this.level = level;
    }

    setXp(xp) {
        this.xp = xp;
    }

    setAge(a) {
        this.age = a;
    }

    setAccount(account) {
        this.account = account;
    }

    setEmail(em) {
        this.email = em;
    }

    setPassword(pass) {
        this.password = pass;
    }

    setDistrict(district) {
        this.district = district;
    }

    setBio(b) {
        this.bio = b;
    }

    setFirstName(fn) {
        this.firstName = fn;
    }

    setLastName(ln) {
        this.lastName = ln;
    }

    setGrade(g) {
        this.grade = g;
    }

    setPfp(pfp) {
        this.pfp = pfp;
    }

    levelUp() {
        this.level++;
    }

    getUsername() {
        return this.username;
    }

    getFirstName() {
        return this.firstName;
    }

    getLastName() {
        return this.lastName;
    }

    getPassword() {
        return this.password;
    }

    getEmail() {
        return this.email;
    }

    getGrade() {
        return this.grade;
    }

    getAccount(){
        return this.account;
    }

    getStrikes() {
        return this.strikes;
    }

    getLevel() {
        return this.level;
    }

    getAge() {
        return this.age;
    }

    getXp() {
        return this.xp;
    }

    getDistrict() {
        return this.district;
    }

    getBio() {
        return this.bio;
    }

    getPfp() {
        return this.pfp;
    }

}

export default Profile;