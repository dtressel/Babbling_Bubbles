import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";

/** API Class.
 *
 * Static class tying together methods used to get/send to to the API.
 * There shouldn't be any frontend-specific stuff here, and there shouldn't
 * be any API-aware stuff elsewhere in the frontend.
 *
 */

class ApiLink {
  // the token for interactive with the API will be stored here.
  static token = null;

  static async request(endpoint, data = {}, method = "get") {
    console.debug("API Call:", endpoint, data, method);

    //there are multiple ways to pass an authorization token, this is how you pass it in the header.
    const url = `${BASE_URL}/${endpoint}`;
    const headers = { Authorization: `Bearer ${ApiLink.token}` };
    const params = (method === "get")
        ? data
        : {};

    try {
      return (await axios({ url, method, data, params, headers })).data;
    } catch (err) {
      console.error("API Error:", err.response);
      let message = err.response.data.error.message;
      throw Array.isArray(message) ? message : [message];
    }
  }

  // Individual API routes

  /* Register user */
    static async signupUser(signupInfo) {
      const data = await this.request(`auth/register`, signupInfo, "post");
      return data;
    }
  
  /* Login user */
    static async loginUser(loginInfo) {
      const data = await this.request(`auth/login`, loginInfo, "post");
      return data;
    }

  /* Get details on a user by user id */
  static async getUser(userId) {
    const data = await this.request(`users/${userId}`);
    return data.user;
  }

  /* Get details on a user by username */
  static async getUserByUsername(username) {
    const data = await this.request(`users/${username}/username`);
    return data.user;
  }

  /* Update information for a particular user */
  static async updateUserInfo(userId, updateInfo) {
    const data = await this.request(`users/${userId}`, updateInfo, "patch");
    return data.user;
  }

  /* 
    Create new play at user start of single game 
    newPlayData: { userId, gameType(optional), gameId(optional) }
  */
  static async startSoloPlay(userId, gameType) {
    const data = await this.request(`solo-plays/${userId}`, { gameType }, "post");
    return data.playData;
  }

  /* Update data for finished play */
  static async updateSoloPlay(playId, updateInfo) {
    const data = await this.request(`solo-plays/${playId}`, updateInfo, "patch");
    return data.stats;
  }

  /* Get leaderboard data */
  static async getLeaderboards(gameType) {
    const data = await this.request('leaderboards', { gameTypes: gameType });
    return data.leaderboards;
  }

  /* Get more stats for user */
  static async getMoreStats(userId) {
    const data = await this.request(`users/${userId}/profile-data`);
    return data;
  }
}

// for now, put token ("testuser" / "password" on class)
// ApiLink.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZ" +
//     "SI6InRlc3R1c2VyIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTU5ODE1OTI1OX0." +
//     "FtrMwBQwe6Ue-glIFgz_Nf8XxRT2YecFCiSpYL0fCXc";

export default ApiLink;