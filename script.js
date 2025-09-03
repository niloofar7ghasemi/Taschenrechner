(function(){
  const display = document.getElementById('display');
  const keys = document.getElementById('keys');
  const state = { displayValue: '0', firstOperand: null, operator: null, waitingForSecond: false };
  function updateDisplay(){ display.textContent = state.displayValue; }
  function clearAll(){ state.displayValue='0'; state.firstOperand=null; state.operator=null; state.waitingForSecond=false; updateDisplay(); }
  function inputDigit(d){
    if (state.waitingForSecond){ state.displayValue=String(d); state.waitingForSecond=false; }
    else {
      if (state.displayValue==='0') state.displayValue=String(d);
      else if (state.displayValue.length<16) state.displayValue+=String(d);
    }
    updateDisplay();
  }
  function inputDecimal(){
    if (state.waitingForSecond){ state.displayValue='0.'; state.waitingForSecond=false; }
    else if (!state.displayValue.includes('.')){ state.displayValue+='.'; }
    updateDisplay();
  }
  function toNumber(v){ const n=parseFloat(v); return Number.isFinite(n)?n:0; }
  function roundSmart(n){ return Math.round((n+Number.EPSILON)*1e12)/1e12; }
  function calculate(a,b,op){
    switch(op){
      case '+': return roundSmart(a+b);
      case '−': return roundSmart(a-b);
      case '×': return roundSmart(a*b);
      case '÷': return b===0 ? 'Fehler' : roundSmart(a/b);
      default: return b;
    }
  }
  function handleOperator(nextOp){
    const inputValue = toNumber(state.displayValue);
    if (state.firstOperand===null){ state.firstOperand=inputValue; }
    else if (state.operator && !state.waitingForSecond){
      const result = calculate(state.firstOperand, inputValue, state.operator);
      state.displayValue=String(result);
      state.firstOperand = (result==='Fehler')? null : toNumber(result);
    }
    state.operator=nextOp; state.waitingForSecond=true; updateDisplay();
  }
  function handlePercent(){ const current = toNumber(state.displayValue); state.displayValue=String(roundSmart(current/100)); updateDisplay(); }
  function handleBackspace(){
    if (state.waitingForSecond) return;
    if (state.displayValue.length<=1) state.displayValue='0';
    else state.displayValue=state.displayValue.slice(0,-1);
    updateDisplay();
  }
  function handleEquals(){
    if (state.operator===null || state.waitingForSecond) return;
    const a=state.firstOperand, b=toNumber(state.displayValue);
    const result=calculate(a,b,state.operator);
    state.displayValue=String(result); state.firstOperand=null; state.operator=null; state.waitingForSecond=false; updateDisplay();
  }
  keys.addEventListener('click',(e)=>{
    const btn=e.target.closest('button'); if(!btn) return;
    const digit=btn.getAttribute('data-digit'); const action=btn.getAttribute('data-action');
    if(digit!==null){ inputDigit(digit); return; }
    if(!action) return;
    switch(action){
      case 'decimal': inputDecimal(); break;
      case 'clear': clearAll(); break;
      case 'backspace': handleBackspace(); break;
      case 'percent': handlePercent(); break;
      case 'operator': handleOperator(btn.getAttribute('data-operator')); break;
      case 'equals': handleEquals(); break;
    }
  });
  const keyMap={ '/':'÷','*':'×','+':'+','-':'−' };
  window.addEventListener('keydown',(e)=>{
    const { key } = e;
    if (/^[0-9]$/.test(key)) { inputDigit(key); return; }
    if (key==='.' || key===',') { inputDecimal(); return; }
    if (key in keyMap) { handleOperator(keyMap[key]); return; }
    if (key==='Enter' || key==='=') { e.preventDefault(); handleEquals(); return; }
    if (key==='Backspace') { handleBackspace(); return; }
    if (key==='Delete') { clearAll(); return; }
    if (key==='%') { handlePercent(); return; }
  });
  updateDisplay();
})();