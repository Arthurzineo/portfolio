/**
 * Runs before first paint (inlined in <head>): chooses mode and language, and holds the entrance sequence
 * (data-boot="wait") until the neural scene draws its first frame. A timer releases it regardless, so the
 * interface can never stay hidden if the scene is slow or fails.
 */
export const bootScript = `(function(){var d=document.documentElement;try{var m=localStorage.getItem('synapse-mode');var c=document.createElement('canvas');var ok=!!(c.getContext('webgl2')||c.getContext('webgl'));var r=matchMedia('(prefers-reduced-motion: reduce)').matches;d.dataset.webgl=ok?'1':'0';d.dataset.mode=(m==='focus'||!ok||(!m&&r))?'focus':'neural';d.dataset.boot=d.dataset.mode==='neural'?'wait':'ready';setTimeout(function(){d.dataset.boot='ready'},4500);var l=localStorage.getItem('synapse-lang');if(l==='en')d.lang='en';}catch(e){d.dataset.mode='focus';d.dataset.boot='ready';}})();`;
