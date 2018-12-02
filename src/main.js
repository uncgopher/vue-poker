import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

var store = {
  debug: true,
  state: {
    users: [
      {
        name: 'Test',
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
    active: false,
    roundTime: 1,
    startBlind: 100,
    blindIncrease: 100
  },
  addUser (newUser) {
    this.state.useres.push({
      name: newUser,
      playing: false,
      finishedPosition: null,
      table: null
    })
  },
  clearUsers () {
    this.state.users = []
  }
}

new Vue({
  render: h => h(App),
  data: {
    gameData: store.state
  }
}).$mount('#app')
