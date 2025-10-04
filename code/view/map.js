import * as tiem from '../view/tie.js'
import * as clientm from '../control/client.js'

export class Cell extends tiem.Clone{
  static size=0

  constructor(x,y){
    super('template.cell')
    let world=clientm.world
    this.model=world.cells[x][y]
  }

  create(parent=false){
    super.create(parent)
    let root=this.root
    let style=root.style
    let size=`${Cell.size}px`
    style['width']=size
    style['height']=size
    let region=this.model.region
    root.classList.add(region.border.includes(this.model)?'border':region.biome.toLowerCase())
    root.addEventListener('mouseenter',()=>this.enter())
    root.addEventListener('mouseleave',()=>this.leave())
    return this
  }

  enter(){
    for(let cell of this.model.region.cells)
      clientm.map.cells[cell.x][cell.y].root.classList.add('light')
  }

  leave(){
    for(let cell of this.model.region.cells)
      clientm.map.cells[cell.x][cell.y].root.classList.remove('light')
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
