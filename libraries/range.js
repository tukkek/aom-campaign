function* step(start,stop,step=0){
  if(step==0) step=start<stop?+1:-1
  if(start<stop) for(let i=start;i<stop;i+=step) yield i
  else for(let i=start;i>stop;i+=step) yield i
}

function range(start,stop,stepp=0){return Array.from(step(start,stop,stepp))}

Math.step=step
Math.range=range
