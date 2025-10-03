import * as rpgm from '../control/rpg.js'
import * as clientm from '../control/client.js'
import * as pointm from '../model/point.js'

const BIOMES=['Sea','Mix','Land']

class Cell{
  constructor(point){
    this.point=point
    this.region=false
  }

  expand(){
    let world=clientm.world
    return this.point.expand().filter((point)=>point.validate([0,world.width],[0,world.heigth]))
      .map((point)=>world.cells[point.x][point.y])
  }

  get x(){return this.point.x}

  get y(){return this.point.y}
}

class Region{
  constructor(){
    this.cells=[]
    this.biome=false
  }

  expand(){
    let cells=this.cells.map((cell)=>cell.expand()).flat().distinct()
    for(let cell of this.cells) cells.remove(cell)
    let near=[]
    for(let region of clientm.world.regions)
      if(region!=this&&region.cells.find((cell)=>cells.includes(cell))) near.push(region)
    return near
  }
}

export class World{
  constructor(width=5**3,heigth=5**3,nregions=5**2){
    this.width=width
    this.heigth=heigth
    this.regions=Array.create(nregions,()=>new Region())
    let cells=Array.create(width,()=>new Array(heigth))
    for(let point of pointm.iterate([0,width],[0,heigth]))
      cells[point.x][point.y]=new Cell(point)
    this.cells=cells
  }

  shape(){
    let cells=rpgm.shuffle(this.cells.flat())
    let regions=this.regions
    for(let region of regions) region.cells.push(cells.pop())
    cells=new Set(cells)
    let near=new Map()
    for(let region of regions) near.set(region,new Set(region.cells[0].expand()))
    while(cells.size){
      let region=rpgm.pick(regions)
      let pool=near.get(region)
      if(!pool.size) continue
      let cell=rpgm.pick(Array.from(pool))
      cells.delete(cell)
      for(let set of near.values()) set.delete(cell)
      region.cells.push(cell)
      for(let expanded of cell.expand()) if(cells.has(expanded)) pool.add(expanded)
    }
  }

  form(region,biome=false){
    if(region.biome) return
    biome=biome&&rpgm.chance(2)?biome:rpgm.pick(BIOMES)
    region.biome=biome
    for(let near of region.expand()) this.form(near,biome)
  }

  create(){
    this.shape()
    this.form(rpgm.pick(this.regions))
    for(let region of this.regions) for(let cell of region.cells) cell.region=region
  }
}
