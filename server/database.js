import 'dotenv/config'
import { MongoClient, ServerApiVersion } from 'mongodb';

class Database {
  constructor(dburl) {
    // we use an in-memory "database"; this isn't persistent but is easy
    // default user
    this.dburl = dburl;
  }

  async connect() {
    this.client = new MongoClient(this.dburl, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true, 
      }
    });
    await this.client.connect();
    this.db = this.client.db('auth');
    this.users = this.db.collection('timestamps_users');
  }

  async close() {
    this.client.close()
  }

  // Returns true iff the user exists.
  async findUser(username) {
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
    const userFound = await this.findUser(name);
    if (userFound !== false) {
      return false;
    }
    else {
      await this.users.insertOne({name: name, pwd: pwd});
      return true;
    }
  }
}

const DB = new Database(process.env.DATABASE_URL);
await DB.connect();

export default DB;