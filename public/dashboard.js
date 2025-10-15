const token = localStorage.getItem('token');
const expenseForm = document.getElementById('expenseForm');
const expensesTableBody = document.querySelector('#expensesTable tbody');
const messageDiv = document.getElementById('message');
const logoutBtn = document.getElementById('logoutBtn');
const cancelEditBtn = document.getElementById('cancelEdit');

if (!token) {
  alert('Please login first');
  window.location.href = 'login.html';
}

async function fetchExpenses() {
  const res = await fetch('/expenses', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  if (res.ok) {
    const expenses = await res.json();
    renderExpenses(expenses);
  } else {
    window.location.href = 'login.html';
  }
}

function renderExpenses(expenses) {
  expensesTableBody.innerHTML = '';
  expenses.forEach(expense => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${expense.description}</td>
      <td>${expense.amount}</td>
      <td>${expense.category}</td>
      <td>${new Date(expense.date).toLocaleDateString()}</td>
      <td>
        <button class="action-btn" onclick="editExpense('${expense._id}')">Edit</button>
        <button class="action-btn" onclick="deleteExpense('${expense._id}')">Delete</button>
      </td>
    `;
    expensesTableBody.appendChild(tr);
  });
}

expenseForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const description = document.getElementById('description').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value;
  const expenseId = document.getElementById('expenseId').value;

  const expenseData = { description, amount, category, date };

  let url = '/expenses';
  let method = 'POST';

  if (expenseId) {
    url += `/${expenseId}`;
    method = 'PUT';
  }

  const res = await fetch(url, {
    method,
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(expenseData)
  });

  const data = await res.json();

  if (res.ok) {
    messageDiv.textContent = expenseId ? 'Expense updated!' : 'Expense added!';
    expenseForm.reset();
    document.getElementById('expenseId').value = '';
    cancelEditBtn.style.display = 'none';
    fetchExpenses();
  } else {
    messageDiv.textContent = data.error || 'Error occurred';
  }
});

window.editExpense = async function(id) {
  const res = await fetch(`/expenses`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const expenses = await res.json();
  const expense = expenses.find(e => e._id === id);
  if (expense) {
    document.getElementById('expenseId').value = expense._id;
    document.getElementById('description').value = expense.description;
    document.getElementById('amount').value = expense.amount;
    document.getElementById('category').value = expense.category;
    document.getElementById('date').value = expense.date ? new Date(expense.date).toISOString().substring(0,10) : '';
    cancelEditBtn.style.display = 'inline';
  }
};

window.deleteExpense = async function(id) {
  if (confirm('Are you sure you want to delete this expense?')) {
    const res = await fetch(`/expenses/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (res.ok) {
      messageDiv.textContent = 'Expense deleted!';
      fetchExpenses();
    } else {
      messageDiv.textContent = 'Failed to delete expense';
    }
  }
};

cancelEditBtn.onclick = () => {
  expenseForm.reset();
  cancelEditBtn.style.display = 'none';
  document.getElementById('expenseId').value = '';
};

logoutBtn.onclick = () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
};

// Initial fetch of expenses on page load
fetchExpenses();
