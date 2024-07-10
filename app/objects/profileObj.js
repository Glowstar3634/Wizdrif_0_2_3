class Profile {

    constructor(u, fn, ln, pw, e, a, g,acc,b,l,x,s,pf,f,p,r,d) {
        if(arguments.length == 0){
            this.username = null;
            this.firstName = null;
            this.lastName = null;
            this.password = null;
            this.email = null;
            this.age = null;
            this.grade = null;
            this.account = 0;
            this.bio = "This person hasn't created a bio yet!";
            this.level = 0;
            this.xp = 0;
            this.strikes = 0;
            this.district = {
                "name": "Rogue Student",
                "description": "This user has not joined a district",
                "tags": [],
                "owner": "",
                "settings": {
                    "private": false,
                    "maxMembers": -1,
                    "allowedAccounts": [],
                    "levelReq": 0,
                    "official": false,
                    "verified": false,
                    "inviteOnly": false
                },
                "members": [],
                "admins": [],
                "districtID": "",
                "hasIcon": false,
                "level": 0,
                "xp": 0
              };
            this.pfp = null;
            this.friends = [];
            this.posts = [];
            this.relics = [];
        }
        else if(arguments.length == 1){
            this.username = u.username;
            this.firstName = u.firstName;
            this.lastName = u.lastName;
            this.password = u.password;
            this.email = u.email;
            this.age = u.age;
            this.grade = u.grade;
            this.account = u.account;
            this.bio = u.bio;
            this.level = u.level;
            this.xp = u.xp;
            this.strikes = u.strikes;
            this.district = u.district;
            this.pfp = u.pfp;
            this.friends = u.friends;
            this.posts = u.posts;
            this.relics = u.relics;
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
            this.bio = "This person hasn't created a bio yet!";
            this.level = 0;
            this.xp = 0;
            this.strikes = 0;
            this.district = {
                "name": "Rogue Student",
                "description": "This user has not joined a district",
                "tags": [],
                "owner": "",
                "settings": {
                    "private": false,
                    "maxMembers": -1,
                    "allowedAccounts": [],
                    "levelReq": 0,
                    "official": false,
                    "verified": false,
                    "inviteOnly": false
                },
                "members": [],
                "admins": [],
                "districtID": "",
                "hasIcon": false,
                "level": 0,
                "xp": 0
              };
            this.pfp = null;
            this.friends = [];
            this.posts = [];
            this.relics = [];
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
        this.district = d;
        this.pfp = pf;
        this.friends = f;
        this.posts = p;
        this.relics = r;
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

    getRelics(){
        return this.relics;
    }

    getPosts(){
        return this.posts;
    }

    getFriends(){
        return this.friends;
    }

}

export default Profile;