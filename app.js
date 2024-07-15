document.addEventListener('DOMContentLoaded', function () {
  const filterName = document.getElementById('filterName');
  const filterAmount = document.getElementById('filterAmount');
  const customerTableBody = document.querySelector('#customerTable tbody');
  const transactionChartCtx = document.getElementById('transactionChart').getContext('2d');
  const customerModal = document.getElementById('customerModal');
  const customerDetails = document.getElementById('customerDetails');
  const closeModal = document.querySelector('.close');

  let customers = [];
  let transactions = [];
  let chartInstance;

  async function fetchData() {
      try {
          const response = await fetch('data.json');
          const data = await response.json();
          customers = data.customers;
          transactions = data.transactions;
          displayData(customers, transactions);
      } catch (error) {
          console.error('Error fetching data:', error);
      }
  }

  function displayData(customers, transactions) {
      customerTableBody.innerHTML = '';
      transactions.forEach(transaction => {
          const customer = customers.find(c => c.id === transaction.customer_id);
          if (customer) {
              const row = document.createElement('tr');
              row.innerHTML = `
                  <td>${customer.name}</td>
                  <td>${customer.analyses}</td>
                  <td>${customer.status}</td>
                  <td>${transaction.amount}</td>
                  <td>${transaction.date}</td>
              `;
              row.addEventListener('click', () => {
                  showCustomerDetails(customer);
              });
              customerTableBody.appendChild(row);
          }
      });
      updateChart(transactions);
  }

  function updateChart(transactions) {
      const chartData = transactions.reduce((acc, curr) => {
          const date = new Date(curr.date).toDateString();
          acc[date] = (acc[date] || 0) + curr.amount;
          return acc;
      }, {});

      if (chartInstance) {
          chartInstance.destroy();
      }

      chartInstance = new Chart(transactionChartCtx, {
          type: 'bar',
          data: {
              labels: Object.keys(chartData),
              datasets: [{
                  label: 'Transaction Amount',
                  data: Object.values(chartData),
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1
              }]
          },
          options: {
              scales: {
                  x: {
                      type: 'time',
                      time: {
                          unit: 'day'
                      }
                  },
                  y: {
                      beginAtZero: true
                  }
              }
          }
      });
  }

  function showCustomerDetails(customer) {
      customerDetails.innerHTML = `
          <p><strong>Name:</strong> ${customer.name}</p>
          <p><strong>Analysis:</strong> ${customer.analyses}</p>
          <p><strong>Status:</strong> ${customer.status}</p>
      `;
      customerModal.style.display = 'block';
  }

  filterName.addEventListener('input', function () {
      const searchText = filterName.value.toLowerCase();
      const filteredCustomers = customers.filter(customer => customer.name.toLowerCase().includes(searchText));
      const filteredTransactions = transactions.filter(transaction => filteredCustomers.some(customer => customer.id === transaction.customer_id));
      displayData(filteredCustomers, filteredTransactions);
  });

  filterAmount.addEventListener('input', function () {
      const minAmount = parseFloat(filterAmount.value);
      const filteredTransactions = transactions.filter(transaction => transaction.amount >= minAmount);
      const filteredCustomers = customers.filter(customer => filteredTransactions.some(transaction => transaction.customer_id === customer.id));
      displayData(filteredCustomers, filteredTransactions);
  });

  closeModal.addEventListener('click', () => {
      customerModal.style.display = 'none';
  });

  window.addEventListener('click', (event) => {
      if (event.target == customerModal) {
          customerModal.style.display = 'none';
      }
  });

  fetchData();
});