import * as rpgm from '../control/rpg.js'
import * as clientm from '../control/client.js'
import * as pointm from '../model/point.js'
import * as savem from '../control/save.js'

const BIOMES=['Sea','Mix','Land']

class Cell{
  constructor(point){
    this.point=point
    this.region=false
  }

  expand(){
    let world=clientm.world
    return this.point.expand().filter((point)=>point.validate([0,world.width],[0,world.height]))
      .map((point)=>world.cells[point.x][point.y])
  }

  get x(){return this.point.x}

  get y(){return this.point.y}

  distance(cell){return this.point.distance(cell.point)}
}

class Region{
  constructor(){
    this.cells=[]
    this.biome=false
    this.border=[]
    this.center=false
  }

  expand(){
    let cells=this.cells.map((cell)=>cell.expand()).flat().distinct()
    for(let cell of this.cells) cells.remove(cell)
    let near=[]
    for(let region of clientm.world.regions)
      if(region!=this&&region.cells.find((cell)=>cells.includes(cell))) near.push(region)
    return near
  }

  close(){
    let cells=this.cells
    let world=clientm.world
    let border=this.border
    for(let cell of cells){
      let exterior=cell.point.expand().filter(((point)=>point.validate([0,world.width],[0,world.height])))
        .map((point)=>world.cells[point.x][point.y]).filter((cell2)=>!cells.includes(cell2))
      if(exterior.length>3) border.push(cell)
    }
    for(let cell of Array.from(border)){
      let near=cell.expand().filter((cell2)=>border.includes(cell2))
      if(near.length>2) border.remove(cell)
    }
  }

  seed(cell){
    this.center=cell
    this.cells.push(cell)
  }

  distance(region){return this.center.distance(region.center)}

  recenter(){
    let x=[]
    let y=[]
    let cells=this.cells
    for(let cell of cells){
      x.push(cell.x)
      y.push(cell.y)
    }
    for(let axis of [x,y]) axis.sort((number1,number2)=>number1-number2)
    let center=new pointm.Point(x[Math.floor(x.length/2)],y[Math.floor(y.length/2)])
    this.center=cells.reduce((cell1,cell2)=>cell1.point.distance(center)<cell2.point.distance(center)?cell1:cell2)
  }
}

export class World{
  constructor(width=5**3,height=5**3,nregions=100){
    this.width=width
    this.height=height
    this.regions=Array.create(nregions,()=>new Region())
    let cells=Array.create(width,()=>new Array(height))
    for(let point of pointm.iterate([0,width],[0,height]))
      cells[point.x][point.y]=new Cell(point)
    this.cells=cells
  }

  shape(){
    let cells=rpgm.shuffle(this.cells.flat())
    let regions=this.regions
    for(let region of regions) region.seed(cells.pop())
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

  collapse(nregions=10){
    let regions=this.regions
    for(let region of regions) region.recenter()
    while(regions.length>nregions){
      let region=regions.reduce((region1,region2)=>region1.cells.length<region2.cells.length?region1:region2)
      let annex=region.expand().reduce((region1,region2)=>region1.distance(region)<region2.distance(region)?region1:region2)
      regions.remove(annex)
      region.cells.push(...annex.cells)
    }
  }

  create(){
    performance.mark('world1')
    this.shape()
    this.form(rpgm.pick(this.regions))
    this.collapse()
    for(let region of this.regions){
      region.close()
      for(let cell of region.cells) cell.region=region
    }
    performance.mark('world2')
    console.log('World creation',performance.measure('world','world1','world2').duration/1_000)
    console.log('Most near-bys',Math.max(...this.regions.map((region)=>region.expand().length)))
  }
}

export function ready(){
  let save=()=>clientm.world
  let load=(world)=>alert(world)
  savem.listen('world',save,load)
}
