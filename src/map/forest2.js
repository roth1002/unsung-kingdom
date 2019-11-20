import { dogEventHunter } from '../event/dogEvent'
export default {
  area: {
    key: 'forest',
    x: 750, y: 780
  },
  enemyLevel: 1,
  enemyGroups: [
    ['slime', 'slime'],
    ['bee', 'bee2']
  ],
  create (scene) {
    const hunter = scene.map.getObjectById(4).setR('left').setRandomWalk(true)
    dogEventHunter(scene, hunter)
  }
}
