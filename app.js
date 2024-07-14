document.addEventListener("DOMContentLoaded", function () {
  const filterName = document.getElementById("filterName");
  const filterAmount = document.getElementById("filterAmount");
  const customerTableBody = document.querySelector("#customerTable tbody");
  const transactionChartCtx = document.getElementById("transactionChart").getContext("2d");

  let customers = [];
  let transactions = [];

  async function fetchData() {
    try {
      const response = await fetch("data.json");
      const data = await response.json();
      customers = data.customers;
      transactions = data.transactions;
      displayData(customers, transactions);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  function displayData(customers, transactions) {
    customerTableBody.innerHTML = "";
    transactions.forEach((transaction) => {
      const customer = customers.find((c) => c.id === transaction.customer_id);
      if (customer) {
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${customer.name}</td>
                    <td>${transaction.amount}</td>
                    <td>${transaction.date}</td>
                `;
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

    new Chart(transactionChartCtx, {
      type: "line",
      data: {
        labels: Object.keys(chartData),
        datasets: [
          {
            label: "Transaction Amount",
            data: Object.values(chartData),
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
            fill: false,
          },
        ],
      },
      options: {
        scales: {
          x: {
            type: "time",
            time: {
              unit: "day",
            },
          },
        },
      },
    });
  }

  filterName.addEventListener("input", function () {
    const searchText = filterName.value.toLowerCase();
    const filteredCustomers = customers.filter((customer) =>
      customer.name.toLowerCase().includes(searchText)
    );
    const filteredTransactions = transactions.filter((transaction) =>
      filteredCustomers.some(
        (customer) => customer.id === transaction.customer_id
      )
    );
    displayData(filteredCustomers, filteredTransactions);
  });

  filterAmount.addEventListener("input", function () {
    const minAmount = parseFloat(filterAmount.value);
    const filteredTransactions = transactions.filter(
      (transaction) => transaction.amount >= minAmount
    );
    const filteredCustomers = customers.filter((customer) =>
      filteredTransactions.some(
        (transaction) => transaction.customer_id === customer.id
      )
    );
    displayData(filteredCustomers, filteredTransactions);
  });

  fetchData();
});
