import * as tiem from '../view/tie.js'
import * as clientm from '../control/client.js'

export class Cell extends tiem.Clone{
  static size=0

  constructor(x,y){
    super('template.cell')
    this.x=x
    this.y=y
  }

  create(parent=false){
    super.create(parent)
    let root=this.root
    let style=root.style
    let size=`${Cell.size}px`
    style['width']=size
    style['height']=size
    let world=clientm.world
    root.classList.add(world.cells[this.x][this.y].region.biome.toLowerCase())
  }
}

export class Map extends tiem.Clone{
  constructor(){
    super('template.map')
    this.cells=[]
  }

  create(parent=false){
    super.create(parent)
    let world=clientm.world
    let width=world.width
    this.root.style['grid-template-columns']=`repeat(${width},auto)`
    let height=world.heigth
    Cell.size=Math.floor(Math.min(window.innerWidth,innerHeight)/Math.max(width,height))
    let cells=Array.create(width,()=>new Array(height))
    for(let x of Math.step(0,width)) for(let y of Math.step(0,height))
      cells[x][y]=new Cell(x,y).create()
    this.cells=cells
  }
}
