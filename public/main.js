document.getElementById('registerForm').addEventListener('submit', async function(e){
  e.preventDefault();
  const username = this.username.value;
  const password = this.password.value;
  const res = await fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ username, password })
  });
  const result = await res.json();
  alert(result.message || result.error);
});
