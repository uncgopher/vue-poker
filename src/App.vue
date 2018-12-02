<template>
  <div id="app">
    <h1>Poker Tournament Helper</h1>

    <div id="status">
      <span v-if="currentRound==0">Pending Setup</span>
      <span v-if="currentRound>0">Round #{{currentRound}}<br/>{{formatTimeRemaining}}</span>
    </div>

    <div id="controls">
      <button id="startBtn" v-on:click="startTournament" v-if="currentRound==0">Start Tournament</button>
      <button id="pauseBtn" v-on:click="pauseTournament" v-if="currentRound>0 && paused==false">Pause Timer</button>
      <button id="unpauseBtn" v-on:click="unpauseTournament" v-if="currentRound>0 && paused==true">Resume Timer</button>
      <button id="endTournamentBtn" v-on:click="endTournament" v-if="currentRound>0">End Tournament</button>
    </div>

    <div id="userManage">
      <h3>Current Players ({{ tData.users.length }})</h3>
      <div id="userList">
        <div v-for="(value, key) in tData.users" :key="key" v-bind:id="'user_item_'+key" class="userListItem">
          {{ value.name }} <span class="user_remove" v-on:click="removeUserFn(key)" v-if="currentRound==0">Remove</span>
        </div>
      </div>
      <div id="newUser">
        <input v-model="addUser" type="text" placeholder="Add Player" @keyup.enter="addUserFn">
        <button id="addUserBtn" v-on:click="addUserFn" v-show="addUser">Add Player</button>
        <div id="newUserError">{{ newUserErrorMsg }}</div>
      </div>
      <div id="wipeUsers">
        <button id='clearUsersBtn' v-on:click="clearUsersFn">Remove All Players</button>
      </div>
    </div>


  </div>
</template>

<script>
var store = {
  state: {
    users: [
      {
        name: 'Tester',
        playing: false,
        finishedPosition: null,
        table: null
      },
      {
        name: 'Joshua',
        playing: false,
        finishedPosition: null,
        table: null
      }
    ],
    blindStart: 100,
    blindIncrease: 100,
    roundTime: .1
  },
  addUser (newUser) {
    // must not be blank
    if(newUser == '' || newUser == null) return {success: false, error: 'User cannot be blank'};

    // check for existing user
    var noDuplicate = this.state.users.every(function(user){
      return user.name != newUser
    })
    if(!noDuplicate) return {success: false, error: 'User already exists'};

    // add user
    this.state.users.push({
      name: newUser,
      playing: false,
      finishedPosition: null,
      table: null
    })

    // return success
    return {success: true};
  },
  clearUsers () {
    this.state.users = []
  },
  clearUser (key){
    this.state.users.splice(key, 1);
  },
  setRoundTime(newTime){
    newTime = round(newTime);
    if(newTime > 0 && newTime <= 180){
      this.state.roundTime = newTime;
      return {success: true};
    }else{
      return {success: false, error: 'Invalid Round Time'};
    }
  },
  noPlayersRemaining(){
    var remaining = this.state.users.every(function(player){
      return player.finishedPosition != null
    })
    return remaining;
  }
}



export default {
  name: 'app',
  components: {

  },
  props: ['gameData'],
  data(){
    return {
      addUser: null,
      newUserErrorMsg: '',
      tData: store.state,
      currentBlind: store.state.blindStart,
      currentRound: 0,
      startTime: null,
      endTime: null,
      timeRemaining: null,
      formatTimeRemaining: null,
      paused: false
    }
  },
  computed: {

  },
  methods: {
    addUserFn: function() {
      var result = store.addUser(this.addUser);
      this.addUser = '';
      (result.success ? this.newUserErrorMsg = '' : this.newUserErrorMsg = result.error)
    },
    removeUserFn: function(userKey){
      store.clearUser(userKey);
    },
    clearUsersFn: function(){
      store.clearUsers();
    },
    pauseTournament: function(){
      if(this.paused == false){
        clearInterval(this.interval);
        this.paused = true;
      }
    },
    unpauseTournament: function(){
      if(this.paused == true){
        this.interval = setInterval(() => {
            this.timerUpdate();
        }, 1000);
        this.paused = false;
      }
    },
    startTournament: function(){
      // must have at least 2 players
      if(this.tData.users.length >= 2){
        // set round
        this.currentRound = 1;

        // sort players in to tables

        // kick off timer
        this.startTime = new Date();
        this.timeRemaining = this.tData.roundTime * 60;
        this.timerUpdate();
        this.interval = setInterval(() => {
            this.timerUpdate();
        }, 1000);
      }
    },
    endTournament: function(){
      clearInterval(this.interval);
      this.currentRound = 0;
    },
    timerUpdate: function(){
      if(this.timeRemaining && this.timeRemaining > 0){
        var sec_num = parseInt(this.timeRemaining, 10)
        var hours   = Math.floor(sec_num / 3600) % 24
        var minutes = Math.floor(sec_num / 60) % 60
        var seconds = sec_num % 60
        this.formatTimeRemaining = [hours,minutes,seconds]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v,i) => v !== "00" || i > 0)
            .join(":")
        this.timeRemaining--;
      }else{
        clearInterval(this.interval);

        // proceed to next round?
        var noneRemaining = store.noPlayersRemaining();
        if(this.currentRound > 0 && this.timeRemaining == 0 && noneRemaining == false){
          this.currentRound++;
          this.timeRemaining = this.tData.roundTime * 60;
          this.timerUpdate();
          this.interval = setInterval(() => {
              this.timerUpdate();
          }, 1000);
        }
      }
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  max-width: 90%;
  margin: 30px auto 0 auto;
}
#status,#controls{
  height:50px;
  vertical-align: middle;
}
#userManage{
  width: 100%;
  border: 1px solid #ddd;
  padding: 5px;
  max-width: 300px;
  float: left;
  text-align: left;
}
.userListItem{
  margin: 0 auto 15px auto;
}
.user_remove{
  float: right;
}
#userList,#newUser{margin-bottom: 20px;}
#newUserError{height:30px;padding-top:10px;}
#endTournamentBtn{margin-left:20px;}
</style>
