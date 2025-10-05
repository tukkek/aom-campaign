import '../../libraries/array.js'
import '../../libraries/range.js'
import * as savem from '../control/save.js'
import * as worldm from '../model/world.js'
import * as mapm from '../view/map.js'

const MODULES=[savem,worldm]

export var world=new worldm.World()
export var map=new mapm.Map()

export function ready(){
  for(let module of MODULES) module.ready()
  world.create()
  map.create()
}

if(import.meta.main) ready()
