import 'dotenv/config'
import { MongoClient, ServerApiVersion } from 'mongodb';

class Database {
  constructor(dburl) {
    // we use an in-memory "database"; this isn't persistent but is easy
    // default user
    this.dburl = dburl;
  }

  async connect() {
    console.log(`${(process.pid)}: DB connecting`);
    this.client = new MongoClient(this.dburl, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true, 
      }
    });
    await this.client.connect();
    console.log(`Connection successful`);
    this.db = this.client.db('auth');
    this.users = this.db.collection('timestamps_users');
    this.jobs = this.db.collection('jobs');
  }

  async close() {
    console.log(`${(process.pid)}: DB closing`);
    this.client.close()
  }

  // Returns true iff the user exists.
  async findUser(username) {
    console.log(`${(process.pid)}: DB finding user`);
    const user = await this.users.findOne({ name: username });
    if (user === null) {
      console.log("USER NOT FOUND", user);
      return false; // User not found
    } else {
      return user; // User found
    }
  }

  // Returns true iff the password is the one we have stored (in plaintext = bad
  // but easy).
  async validatePassword(name, pwd) {
    console.log(`${(process.pid)}: DB validating pwd`);
    const userFound = await this.findUser(name);
    if (userFound === false) {
      return false;
    }
    if (userFound.pwd !== pwd) {
      return false;
    }
    return true;
  }

  // Add a user to the "database".
  async addUser(name, pwd) {
    console.log(`${(process.pid)}: DB adding user`);
    const userFound = await this.findUser(name);
    if (userFound !== false) {
      return false;
    }
    else {
      await this.users.insertOne({name: name, pwd: pwd});
      return true;
    }
  }

  // Add a job to the "database".
  async addJob(body, res) {
    console.log(`${(process.pid)}: DB adding job`);
    try {
      await this.jobs.insertOne(body);
      res.status(200).end();
    }
    catch(error) {
      console.error(error);
      res.status(500).end()
    }
    return true;
  }
}

const DB = new Database(process.env.DATABASE_URL);
await DB.connect();

export default DB;