import config from '../data/config'
import SpeachBubble from './SpeachBubble'
export default class Talk extends Phaser.GameObjects.Container {
  constructor (scene, events, callback) {
    super(scene)
    this.scene = scene
    this.events = events
    this.callback = callback
    this.index = 0
    scene.add.existing(this)
    const npc = this.events.filter(v => v && typeof v.chara !== 'string').map(v => v.chara)
    npc.forEach(c => {
      c.setR(c.angleTo(this.scene.gameScene.player))
    })
    const averageX = Math.average(...npc.map(c => c.x), this.scene.gameScene.player.x)
    this.events.filter(v => v).reduce((prev, v) => {
      v.position = this.getChara(v).x < averageX ? -1 : 1
      if (prev && prev.chara !== v.chara && prev.position === v.position) {
        v.position *= -1
      }
      return v
    }, null)
    this.scene.time.delayedCall(1, () => scene.scene.pause('Game'))
    this.tapArea = this.scene.add.rectangle(0, 0, config.WIDTH, config.HEIGHT).setOrigin(0, 0)
    this.tapArea.setInteractive().on('pointerdown', this.next.bind(this))
    this.add(this.tapArea)
    this.next()
  }
  getChara (event) {
    return typeof event.chara === 'string' ? this.scene.gameScene.player : event.chara
  }
  get current () {
    return this.events[this.index]
  }
  get prev () {
    if (!this.index) return null
    return this.events[this.index - 1]
  }
  get sameSpeakerAsBefore () {
    return this.current && this.prev && this.current.chara === this.prev.chara
  }
  get currentPosition () {
    return this.prev && this.current.position === this.prev.position ? -this.current.position : this.current.position
  }
  next () {
    if (!this.current) return this.end()
    if (this.sameSpeakerAsBefore) {
      this.bubble.setText(this.current.text)
    } else {
      this.deleteBubble()
      const isPlayer = (typeof this.current.chara === 'string')
      const chara = isPlayer ? this.scene.gameScene.player : this.current.chara
      const displayName = isPlayer ? this.current.chara.upperCase : chara.displayName || 'No name'
      const imageKey = isPlayer ? this.current.chara : chara.faceKey
      const camera = this.scene.gameScene.camera
      const x = chara.x - camera.scrollX + this.currentPosition * 30
      const y = chara.y - camera.scrollY - 100
      this.bubble = new SpeachBubble(this.scene, x, y, displayName, imageKey, this.current.text, this.currentPosition)
      const resultX = this.bubble.x
      const resultY = this.bubble.y
      this.bubble.setScale(0, 0).setPosition(resultX, resultY + 100).setAlpha(0)
      this.scene.add.tween({ targets: this.bubble, scaleX: 1, scaleY: 1, y: resultY, alpha: 1, duration: 150, ease: 'Power2' })
    }
    this.index++
  }
  end () {
    if (this.current === null) {
      this.tapArea.destroy()
    } else {
      this.scene.scene.resume('Game')
      this.destroy()
    }
    if (this.callback) this.callback(this)
  }
  deleteBubble () {
    if (!this.bubble) return
    this.scene.add.tween({ targets: this.bubble, scaleX: 0, scaleY: 0, alpha: 0, duration: 150, ease: 'Power2', onComplete: this.bubble.destroy })
  }
  destroy () {
    this.deleteBubble()
    super.destroy()
  }
}
