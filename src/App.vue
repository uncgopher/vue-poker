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
#userContainer{
  width: 100%;
  display: table;
  margin-bottom: 20px;
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
#tableList{
  float: left;
  margin-left: 50px;
  min-width: 300px;
}
.table{
  width: 100%;
  max-width: 300px;
}
.table_player{text-align: left;}
.user_table_remove{float: right;}
#endTournamentBtn{margin-left:20px;}
</style>

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

    <div id="userContainer">
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
      <div id="tableList">
        <div v-for="(tableValue, tableKey, tableIndex) in tData.tables" :key="tableKey" class="table">
          <h3>Table #{{ tableIndex+1 }}</h3>
          <div v-for="(playerValue, playerKey, playerIndex) in tableValue" :key="playerValue" class="table_player">
            {{ playerKey }} <span class="user_table_remove" v-on:click="removeUserTableFn(tableKey, playerKey, playerValue)">Knocked Out</span>
          </div>
        </div>
      </div>
    </div>

    <div>
      {{ tData.users }}
    </div>
  </div>
</template>

<script>
var store = {
  state: {
    users: [
      {
        name: 'Mark',        
        finishedPosition: null
      },
      {
        name: 'Joshua',
        finishedPosition: null
      },
      {
        name: 'Spencer',
        finishedPosition: null
      },
      {
        name: 'Doug',
        finishedPosition: null
      },
      {
        name: 'Hao',
        finishedPosition: null
      },
      {
        name: 'Terry',
        finishedPosition: null
      },
      {
        name: 'Levi',
        finishedPosition: null
      },
      {
        name: 'Will',
        finishedPosition: null
      },
      {
        name: 'Anthony',
        finishedPosition: null
      },
      {
        name: 'Prescott',
        finishedPosition: null
      },
      {
        name: 'Alex',
        finishedPosition: null
      },
      {
        name: 'Thomas',
        finishedPosition: null
      },
      {
        name: 'Nate',
        finishedPosition: null
      }
    ],
    blindStart: 100,
    blindIncrease: 100,
    roundTime: 1,
    tables: {},
    finishedPlace: null
  },
  playersToTables(){
    // setup
    var users = this.state.users;
    var playerCount = users.length;
    var tables = this.state.tables;
    this.state.finishedPlace = playerCount;

    // sort by size
    if(playerCount < 8){
      // undersized
      tables['table_1'] = [];
      for(var i=0;i<playerCount;i++){
        var tempUser = users[i].name;
        tables['table_1'].push({tempUser: i})
      }
    }else{
      // determine number of tables
      var tableCount = Math.ceil(playerCount/5);
      for(var i=1;i<=tableCount;i++) tables['table_'+i] = {};

      // deploy players
      var curTable = 1;
      for(var i=0;i<playerCount;i++){
        var obj = {};
        tables['table_'+curTable][users[i].name] = i;
        curTable++;
        if(curTable > tableCount) curTable = 1;
      }
    }
  },
  resetTables(){
    this.state.tables = {};
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

      finishedPosition: null,

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
  removeUserFromTable(tableIndex, playerIndex, orgKey){
    // update player's finishing position
    this.state.users[orgKey].finishedPosition = this.state.finishedPlace;
    this.state.finishedPlace--;

    // remove user from table
    delete this.state.tables[tableIndex][playerIndex];
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
      paused: false,
      tournamentTicker: null
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
    removeUserTableFn: function(tableKey, playerIndex, orgKey){
      store.removeUserFromTable(tableKey, playerIndex, orgKey);
    },
    pauseTournament: function(){
      if(this.paused == false){
        clearInterval(this.tournamentTicker);
        this.paused = true;
      }
    },
    unpauseTournament: function(){
      if(this.paused == true){
        this.tournamentTicker = setInterval(() => {
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
        store.playersToTables();

        // kick off timer
        this.startTime = new Date();
        this.timeRemaining = this.tData.roundTime * 60;
        this.timerUpdate();
        this.tournamentTicker = setInterval(() => {
            this.timerUpdate();
        }, 1000);
      }
    },
    endTournament: function(){
      clearInterval(this.tournamentTicker);
      this.currentRound = 0;
      store.resetTables();
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
        clearInterval(this.tournamentTicker);

        // proceed to next round?
        var noneRemaining = store.noPlayersRemaining();
        if(this.currentRound > 0 && this.timeRemaining == 0 && noneRemaining == false){
          this.currentRound++;
          this.timeRemaining = this.tData.roundTime * 60;
          this.timerUpdate();
          this.tournamentTicker = setInterval(() => {
              this.timerUpdate();
          }, 1000);
        }
      }
    }
  }
}
</script>
