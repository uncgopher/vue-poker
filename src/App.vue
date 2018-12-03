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
#rebalance{
  margin:10px;
  display: inline-block;
  font-weight: 700;
}
#userContainer{
  margin: 20px 0;
}
#userManage,#placementList{
  text-align: left;
  background-color: #fff6eb;
  border: 1px solid #989898;
  padding: 8px;
  border-radius: 10px;
}
#addUserBtn{
  margin-left: 10px;
}
.userListItem{
  margin: 0 auto 15px auto;
}
.user_remove{
  float: right;
}
#userList,#newUser{margin-bottom: 20px;}
#newUserError{height:30px;padding-top:10px;}
.pokerTable{
  width: 100%;
  max-width: 200px;
  margin: 0px auto 30px auto;
  background-color: #dfffe1;
  border: 1px solid #989898;
  padding: 8px;
  border-radius: 10px;
}
.table_player{text-align: left;}
.user_table_remove{margin:-4px 10px 0 0;}
.placement{text-align: left;}
#endTournamentBtn{margin-left:20px;}
#explainer{
  margin: 50px auto 50px auto;
}
.btn-group-xs > .btn, .btn-xs {
  padding  : .4rem .6rem !important;
  font-size  : .875rem !important;
  line-height  : .5 !important;
  border-radius : .2rem !important;
}
</style>

<template>
  <div id="app">
    <h1>Poker Tournament Helper</h1>

    <div class="row">
      <div id="status" class="col-md-12">
        <span v-if="currentRound==0">Pending Setup</span>
        <span v-if="currentRound>0">Round #{{currentRound}}<br/>{{formatTimeRemaining}}</span>
      </div>
    </div>

    <div id="rebalance">
      <div class="alert alert-danger" v-if="playerMoved!=''">{{ playerMoved }}</div>
    </div>

    <div id="controls">
      <button id="startBtn" v-on:click="startTournament" class="btn btn-primary" v-if="currentRound==0 && this.tData.users.length>=2">Start Tournament</button>
      <button id="pauseBtn" v-on:click="pauseTournament" class="btn btn-secondary" v-if="currentRound>0 && paused==false && tournamentCompleted==false">Pause Timer</button>
      <button id="unpauseBtn" v-on:click="unpauseTournament" class="btn btn-info" v-if="currentRound>0 && paused==true && tournamentCompleted==false">Resume Timer</button>
      <button id="endTournamentBtn" v-on:click="endTournament" class="btn btn-danger" v-if="currentRound>0">End Tournament</button>
    </div>

    <div id="userContainer" class="row">
      <div id="userManage" class="col-md-3 col-sm-12">
        <h3>Current Players ({{ tData.users.length }})</h3>
        <div id="userList">
          <div v-for="(value, key) in tData.users" :key="key" v-bind:id="'user_item_'+key" class="userListItem">
            <button class="user_table_remove btn btn-xs btn-danger" v-on:click="removeUserFn(key)" v-if="currentRound==0">X</button> {{ value.name }}
          </div>
        </div>
        <div id="newUser">
          <input v-model.trim="addUser" style="padding-right:5px;" v-if="currentRound==0" type="text" placeholder="Add Player" @keyup.enter="addUserFn">
          <button id="addUserBtn" class="btn btn-sm btn-success" v-on:click="addUserFn" v-if="addUser">Add</button>
          <div id="newUserError">{{ newUserErrorMsg }}</div>
        </div>
        <div id="wipeUsers">
          <button id="clearUsersBtn" class="btn btn-danger" v-if="currentRound==0" v-on:click="clearUsersFn">Remove All Players</button>
        </div>
      </div>

      <div id="tableList" class="col-md-6 col-sm-12">
        <div v-for="(tableValue, tableKey, tableIndex) in tData.tables" :key="tableKey" class="pokerTable">
          <h3>Table #{{ tableIndex+1 }}</h3>
          <div v-for="(playerValue, playerKey) in tableValue.seated" :key="playerValue" class="table_player">
            <button class="user_table_remove btn btn-xs btn-dark" v-on:click="removeUserTableFn(tableKey, playerKey, playerValue)">X</button> {{ playerKey }}
          </div>
        </div>
      </div>

      <div class="col-md-3 col-sm-12">
        <div id="placementList" v-show="currentRound>0">
          <h3>Placement</h3>
          <div v-for="(tableValue, tableKey) in tData.placementList" :key="tableKey" class="placement">
            {{ tableKey+'. '+tableValue }}
          </div>
        </div>
      </div>
    </div>

    <div id="explainer">
      <h4>Instructions</h4>
      Start with the default players, add your own, or remove all to start from
      scratch. At least two players must be in the list to start the tournament.
      Players are automatically moved between tables to keep things balanced and
      at 5 players, everyone is moved to a single table.
      <br/><br/>
      Github: <a href='https://github.com/uncgopher/vue-poker'>https://github.com/uncgopher/vue-poker</a>
    </div>
  </div>
</template>

<script>
function shuffle(arrSize) {
  // build array
  var array = [];
  for(var i=0;i<arrSize;i++) array.push(i);
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
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
    tableSize: 0,
    finishedPlace: null,
    placementList: {}
  },
  playersToTables(){
    // setup
    var users = this.state.users;
    var playerCount = users.length;
    this.state.finishedPlace = playerCount;
    var tables = this.state.tables;


    // get shuffled order
    var shuffled = shuffle(playerCount);

    // sort by size
    if(playerCount < 8){
      // undersized
      this.state.tableSize = 1;
      tables['table_1'] = {seated:{},count:0};
      for(var i=0;i<playerCount;i++){
        tables['table_1']['seated'][users[shuffled[i]].name] = i;
        tables['table_1']['count']++;
      }
    }else{
      // determine number of tables
      var tableCount = Math.ceil(playerCount/5);
      this.state.tableSize = tableCount;
      for(var i=1;i<=tableCount;i++) tables['table_'+i] = {seated:{},count:0};

      // deploy players
      var curTable = 1;
      for(var i=0;i<playerCount;i++){
        tables['table_'+curTable]['seated'][users[shuffled[i]].name] = i;
        tables['table_'+curTable]['count']++;
        curTable++;
        if(curTable > tableCount) curTable = 1;
      }
    }
  },
  resetTables(){
    this.state.tables = {};
    this.state.tableSize = 0;
    this.state.placementList = {};
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
    this.state.placementList[this.state.finishedPlace] = playerIndex;
    this.state.finishedPlace--;

    // remove user from table
    delete this.state.tables[tableIndex]['seated'][playerIndex];
    this.state.tables[tableIndex]['count']--;

    // check for rebalance
    var minLength = null, minLengthTable = null,
      maxLength = null, maxLengthTable = null,
      playersLeft = 0, tablesOpen = 0;
    for(var i=1;i<=this.state.tableSize;i++){
      var curLength = this.state.tables['table_'+i].count;
      playersLeft = playersLeft + curLength;

      // skip empty tables
      if(curLength == 0) continue;
      tablesOpen++;

      // first table hit
      if(minLength == null){
        minLength = curLength;
        minLengthTable = 'table_'+i;
        maxLength = curLength;
        maxLengthTable = 'table_'+i;
      }

      // check for new min/max
      if(curLength < minLength){
        minLength = curLength;
        minLengthTable = 'table_'+i;
      }
      if(curLength > maxLength){
        maxLength = curLength;
        maxLengthTable = 'table_'+i;
      }
    }

    // if 1 person remaining, they win
    if(playersLeft == 1){
      // find remaining player
      for(var prop in this.state.tables[maxLengthTable]['seated']) {
        // move to first place
        var finalPlayerOrgKey = this.state.tables[maxLengthTable]['seated'][prop];
        this.state.users[finalPlayerOrgKey].finishedPosition = this.state.finishedPlace;
        this.state.placementList[this.state.finishedPlace] = prop;
        this.state.finishedPlace--;

        // remove user from table
        delete this.state.tables[maxLengthTable]['seated'][prop];
        this.state.tables[maxLengthTable]['count']--;
        return {rebalance: true, type: 'completed', player: prop};
      }
    }else if(playersLeft <= 5 && tablesOpen > 1){
      // if 5 people or less remaining, combine to one table
      for(var i=1;i<=this.state.tableSize;i++){
        if('table_'+i != maxLengthTable){
          // move player
          for(var prop in this.state.tables['table_'+i]['seated']) {
            // add player to new table
            this.state.tables[maxLengthTable]['seated'][prop] = this.state.tables['table_'+i]['seated'][prop];
            this.state.tables[maxLengthTable]['count']++;

            // remove user from table
            delete this.state.tables['table_'+i]['seated'][prop];
            this.state.tables['table_'+i]['count']--;
          }
        }
      }

      // notify
      return {rebalance: true, type: 'table'};
    }else{
      // compare table sizes
      if(maxLength > minLength + 1 || minLength == 1){
        // for a table size of one, you move to the largest if it's size 2
        if(minLength == 1 && maxLength == 2){
          // swap the tables
          var tempHolder = maxLengthTable;
          maxLengthTable = minLengthTable;
          minLengthTable = tempHolder;
        }

        // run rebalance - get player to move
        var playerToMove, playerToMovePos = 0;
        for(var prop in this.state.tables[maxLengthTable]['seated']) {
          playerToMove = prop;
          playerToMovePos = this.state.tables[maxLengthTable]['seated'][playerToMove];
          break;
        }

        // remove user from table
        delete this.state.tables[maxLengthTable]['seated'][playerToMove];
        this.state.tables[maxLengthTable]['count']--;

        // add player to new table
        this.state.tables[minLengthTable]['seated'][playerToMove] = playerToMovePos;
        this.state.tables[minLengthTable]['count']++;

        // return info
        return {rebalance: true, type: 'single', player: playerToMove, newTable: minLengthTable};
      }else{
        // no rebalance needed
        return {rebalance: false};
      }
    }
  },
  setRoundTime(newTime){
    newTime = Math.round(newTime);
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
      tournamentTicker: null,
      playerMoved: '',
      tournamentCompleted: false
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
      var result = store.removeUserFromTable(tableKey, playerIndex, orgKey);
      if(result.rebalance){
        // alert for a rebalance
        if(result.type == 'single'){
          this.playerMoved = result.player+' => Table #'+result.newTable.replace("table_", "");
        }else if(result.type == 'table'){
          this.playerMoved = 'Combine All Tables';
        }else if(result.type == 'completed'){
          this.playerMoved = result.player+' Wins!';
          this.tournamentCompleted = true;
        }
      }else{
        // remove rebalance notice
        this.playerMoved = '';
      }
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
        // setup
        this.currentRound = 1;
        this.tournamentCompleted = false;
        this.paused = false;
        this.playerMoved = '';

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
      if(this.timeRemaining && this.timeRemaining > 0 && this.tournamentCompleted == false){
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
