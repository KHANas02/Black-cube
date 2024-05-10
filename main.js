const interval = 1000 / 60 // fps
const noiseStr = 10
const row = 15

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const simplex = new SimplexNoise()
const grids = []

function init() {
  for (let index = 0; index < Math.pow(row, 2); index++) {
    const grid = new Grid(index, row)
    grids.push(grid)
  }
}

function render() {
  let now, delta
  let then = Date.now()
  function frame(timestamp) {
    requestAnimationFrame(frame)
    now = Date.now()
    delta = now - then
    if (delta < interval) return
    then = now - (delta % interval)

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.save()
    ctx.translate(canvas.width, canvas.height)
    ctx.rotate(Math.PI)

    grids.forEach(grid => {
      grid.resize(canvas.width, canvas.height)
      grid.update(simplex, noiseStr, timestamp * 0.001)
      grid.draw(ctx)
    })

    ctx.restore()
  }
  requestAnimationFrame(frame)
}

function resize() {
  canvas.width = canvas.height = Math.min(innerWidth, innerHeight)
}

window.addEventListener('resize', resize)
window.addEventListener('DOMContentLoaded', () => {
  init()
  resize()
  render()
})

class Grid {
  constructor(index, rowCount) {
    this.index = index
    this.rowCount = rowCount

    this.ex = this.index % this.rowCount
    this.ey = Math.floor(this.index / this.rowCount)
  }
  resize(canvasWidth, canvasHeight) {
    const minSize = Math.min(canvasWidth, canvasHeight)
    this.size = minSize / this.rowCount
    this.boxSize = this.size * (0.3 + 0.7 * this.noise)

    this.sx = canvasWidth / 2 - minSize / 2
    this.sy = canvasHeight / 2 - minSize / 2

    this.x = this.sx + this.ex * this.size
    this.y = this.sy + this.ey * this.size
  }
  update(simplex, noiseStr, time) {
    this.noise = (simplex.noise3D(this.ex / noiseStr, this.ey / noiseStr, time) + 1) / 2
    this.sizePercent = 0.1 + 0.89 * this.noise
    this.boxSize = this.size * this.sizePercent
  }
  draw(ctx) {
    ctx.lineWidth = 1
    ctx.strokeStyle = '#f1f1f1'
    ctx.fillStyle = '#191919'
    ctx.fillRect(this.x, this.y, this.size, this.size)
    ctx.strokeRect(this.x, this.y, this.size, this.size)

    ctx.fillStyle = `rgba(241, 241, 241, ${this.sizePercent})`
    ctx.fillRect(this.x, this.y, this.boxSize, this.boxSize)
  }
}