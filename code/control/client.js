import '../../libraries/array/array.js'
import '../../libraries/range/range.js'
import * as worldm from '../model/world.js'
import * as mapm from '../view/map.js'

export var world=new worldm.World()
export var map=new mapm.Map()

export function ready(){
  world.create()
  map.create()
}

if(import.meta.main) ready()
