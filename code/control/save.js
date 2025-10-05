import * as clientm from '../control/client.js'

const SAVERS=new Map()//functions by text
const LOADERS=new Map()//functions by text

class Cycle {//https://stackoverflow.com/a/39439980/7195483
    static join(arr, separator = ":") {
        if (arr.length === 0)
            return "";
        return arr.reduce((v1, v2) => `${v1}${separator}${v2}`);
    }

    static check(object, serializationKeyStack = []) {
        Object.keys(object).forEach(key => {
            var value = object[key];
            var serializationKeyStackWithNewKey = serializationKeyStack.slice();
            serializationKeyStackWithNewKey.push(key);
            try {
                JSON.stringify(value);
                console.debug(`path "${Cycle.join(serializationKeyStack)}" is ok`);
            }
            catch (error) {
                console.debug(`path "${Cycle.join(serializationKeyStack)}" JSON.stringify results in error: ${error}`);
                var isCircularValue;
                var circularExcludingStringifyResult = "";
                try {
                    circularExcludingStringifyResult = JSON.stringify(value, Cycle.replace(value), 2);
                    isCircularValue = true;
                }
                catch (error) {
                    console.debug(`path "${Cycle.join(serializationKeyStack)}" is not the circular source`);
                    Cycle.check(value, serializationKeyStackWithNewKey);
                    isCircularValue = false;
                }
                if (isCircularValue) {
                    throw new Error(`Circular reference detected:\nCircularly referenced value is value under path "${Cycle.join(serializationKeyStackWithNewKey)}" of the given root object\n` +
                        `Calling stringify on this value but replacing itself with [Circular object --- fix me] ( <-- search for this string) results in:\n${circularExcludingStringifyResult}\n`);
                }
            }
        });
    }

    static replace(object) {
        var serializedObjectCounter = 0;
        return function (key, value) {
            if (serializedObjectCounter !== 0 && typeof (object) === 'object' && object === value) {
                Logger_1.Logger.error(`object serialization with key ${key} has circular reference to being stringified object`);
                return '[Circular object --- fix me]';
            }
            serializedObjectCounter++;
            return value;
        };
    }
}

export function write(text){
  let a=document.createElement('a')
  a.download='campaign.json'
  a.href=window.URL.createObjectURL(new Blob([text],{type:'text/plain'}))
  a.click()
}

export function save(){
  let data=new Map()
  for(let key of SAVERS.keys()) data.set(key,SAVERS.get(key).call(this))
  data=Object.fromEntries(data.entries())
  try{
    write(JSON.stringify(data))
  }catch(e){
    if(e.message!='cyclic object value') throw e
    console.log(Cycle.check(data))
  }
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

export function listen(key,savecall,loadcall){
  if(savecall) SAVERS.set(key,savecall)
  if(loadcall) LOADERS.set(key,loadcall)
}
