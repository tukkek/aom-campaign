var rng=Math.random

// returns a random integer between two inclusive values
export function roll(min=1,max=6){return Math.floor(rng()*(max-min+1))+min}

// returns a random element from an array
export function pick(array){return array[roll(0,array.length-1)]}

// returns the highest of two roll() results
export function high(min,max){return Math.max(roll(min,max),roll(min,max))}

// returns the mid of three roll() results
export function mid(min,max){return Array.from(new Array(3),()=>roll(min,max)).sort()[1]}

// returns the lowest of two roll() results
export function low(min,max){return Math.min(roll(min,max),roll(min,max))}

// rolls a number of dice of a number of sides then returns their sum (as in "2D6" notation)
export function rolldice(ndice,sides=6){
  return Array.from(new Array(ndice),()=>roll(1,sides)).reduce((a,b)=>a+b,0)
}

// returns true on "a chance in X" ("a chance in 2" is 50%)
export function chance(n){return n>=1&&roll(1,n)==n}

// shuffles and returns an array or a copy of the array
export function shuffle(array,clone=false){
  if(clone) array=Array.from(array)
  let last=array.length-1
  for(let i=0;i<last;i++){
    let j=roll(i,last)
    let a=array[i]
    let b=array[j]
    array[i]=b
    array[j]=a
  }
  return array
}

// returns true on a percent-based chance (0.00 to 1.00)
export function random(chance){return rng()<chance}

// seed PRNG with a string (see read-me)
export function seed(s){rng=new alea(s)}

// rounds to most-significant digit (1,234 to 1,000)
export function round(number){
  let digits=1
  while(number>10){
    number/=10
    digits*=10
  }
  return Math.floor(number)*digits
}

// forces value to be within [low,high]
export function bind(low,value,high){
  if(value>high) return high
  if(value>low) return value
  return low
}

// 2/6 chance of -1; 1/6 of +1, recursively
export function shift(value,less=2,same=5,more=6){
  let increment=Number.MAX_VALUE
  while(increment!=0){
    let r=roll(1,more)
    if(r>same) increment=+1
    else if(r>less) increment=0
    else increment=-1
    value+=increment
  }
  return value
}

// 50%-chance to return each item sequentially
export function choose(array,chancep=2){
  let length=array.length
  for(let i=0;i<=length-2;i+=1) if(chance(chancep)) return array[i]
  return array[length-1]
}
