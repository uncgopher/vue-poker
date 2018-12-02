<template>
  <div id="app">
    <h1>Poker Tournament Helper</h1>
    <div id="userList">
      <h3>Current Players</h3>
      <div v-for="user in gData.users" class="userListItem">{{ user.name }}</div>
      <input v-model="addUser" type="text"> <button id="addUserBtn" v-on:click="addUserFn">Add Player</button>
    </div>

  </div>
</template>

<script>
export default {
  name: 'app',
  components: {

  },
  props: ['gameData'],
  data(){
    return {
      addUser: null,
      gData: this.$parent.gameData
    }
  },
  methods: {
    addUserFn: function() {
      console.log(this.addUser)
    }
  },
  mounted: function(){
    this.$nextTick(function(){
      console.log('data: ')
    })
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
#userList{
  max-width: 200px;
  float: left;
}
.userListItem{
  margin: 0 auto 15px auto;
}
</style>
