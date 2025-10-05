import * as clientm from '../control/client.js'

const SAVERS=new Map()//functions by text
const LOADERS=new Map()//functions by text

export function write(text){
  let a=document.createElement('a')
  a.download='campaign.json'
  a.href=window.URL.createObjectURL(new Blob([text],{type:'text/plain'}))
  a.click()
}

export function save(){
  let data=new Map()
  for(let key of SAVERS.keys()) data.set(key,SAVERS.get(key).call(this))
  write(JSON.stringify(Object.fromEntries(data.entries())))
}

export function read(event){
  let file=document.querySelector('input[type="file"]').files[0]
  if(!file) return
  let reader=new FileReader()
  reader.onload=()=>load(reader.result)
  reader.readAsText(file)
}

export function load(text){
  let data=new Map(Object.entries(JSON.parse(text)))
  for(let key of data.keys()){
    let call=LOADERS.get(key)
    if(call) call.call(this,data.get(key))
  }
}

export function ready(){
  document.querySelector('button.save').onclick=()=>save()
  document.querySelector('input[type="file"]').onchange=()=>read()
}

export function add(key,savecall,loadcall){
  if(savecall) SAVERS.set(key,savecall)
  if(loadcall) LOADERS.set(key,loadcall)
}
