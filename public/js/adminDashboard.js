async function fetchUsername(userId) {
  try {
    const response = await fetch(`/admin/get-username/${userId}`); // Assume this route returns the username
    const data = await response.json();
    return data.username;
  } catch (error) {
    console.error("Error fetching username:", error);
    return 'Unknown'; // Fallback if there's an error
  }
}

async function fetchAuditLogs() {
  const response = await fetch('/admin/audit-logs'); // Endpoint to fetch audit logs
  const logs = await response.json();

  const tableBody = document.getElementById('auditLogBody');
  for (const log of logs) {
    const username = await fetchUsername(log.user); // Fetch username using userId

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${username}</td> <!-- Use the fetched username -->
      <td>${log.ipAddress || 'N/A'}</td>
      <td>${log.action}</td>
      <td>${log.field}</td>
      <td>${new Date(log.timestamp).toLocaleString()}</td>
    `;
    tableBody.appendChild(row);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchAuditLogs();
});


window.onload = async function() {
  try {
    // Fetch user IPs from the new endpoint
    const response = await fetch('/admin/user-ips');
    const ipAddresses = await response.json();  // Renamed for clarity
    
    // Prepare location counts (city counts based on IPs)
    const locationCounts = {};
    
    // Function to fetch location from IP using ip-api
    const getLocationFromIp = async (ip) => {
      try {
        const res = await fetch(`http://ip-api.com/json/${ip}`);
        const data = await res.json();
        return data.city || 'Unknown';
      } catch (error) {
        console.error(`Error fetching location for IP ${ip}:`, error);
        return 'Unknown';
      }
    };

    // Process each IP and fetch location
    for (const ip of ipAddresses) {
      const location = await getLocationFromIp(ip); // Fetch location using ip-api
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    }

    // Function to generate random color
    const generateRandomColor = () => {
      const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
      return randomColor;
    };

    // Generate random colors for the chart slices
    const backgroundColors = Object.keys(locationCounts).map(() => generateRandomColor());

    // Handle Pie Chart
    const ctx = document.getElementById('locationPieChart').getContext('2d');
    const pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(locationCounts),
        datasets: [{
          data: Object.values(locationCounts),
          backgroundColor: backgroundColors, // Use the generated random colors
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(tooltipItem) {
                return tooltipItem.label + ': ' + tooltipItem.raw + ' users';
              }
            }
          }
        }
      }
    });

  } catch (error) {
    console.error("Error fetching or parsing data for Pie Chart:", error);
  }
};


