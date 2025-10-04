const LAST={
  enumerable:false,
  configurable:false,
  get(){return this[this.length-1]}
}
const PROTOTYPE=Array.prototype
const FILTER=PROTOTYPE.filter

function remove(item){
  let i=this.indexOf(item)
  if(i<0) return false
  this.splice(i,1)[0]
  return true
}

function filter(call,self){
  if(!call) call=(item)=>Boolean(item)
  return FILTER.call(this,call,self)
}

function create(size,call){
  let array=new Array(size)
  for(let i=0;i<size;i+=1) array[i]=call.call(this,i)
  return array
}

function clear(){this.splice(0,this.length)}

function distinct(){return Array.from(new Set(this))}

PROTOTYPE.remove=remove
Object.defineProperty(PROTOTYPE,'last',LAST)
PROTOTYPE.filter=filter
PROTOTYPE.clear=clear
Array.create=create
PROTOTYPE.distinct=distinct

if(import.meta.main){
  let list=[1,2,3]
  if(!list.remove(2)||list[0]!=1||list[1]!=3) throw `Wrong removed-item!`
  if(list[0]!=1||list[1]!=3) throw `Wrong removed-list state!`
  if(list.last!=3) throw `Wrong last element!`
  if([list,list].flat().distinct().length!=2) throw 'Did not filter unique items!'
  console.log('OK')
}
