// Drawing a festive contribution medal on the Canvas component (Requirement ii)
function drawContributionMedal() {
    const canvas = document.getElementById("profile-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Cleaning the canvas frame area before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Drawing the medal circle
    ctx.beginPath();
    ctx.arc(100, 70, 40, 0, 2 * Math.PI);
    ctx.fillStyle = "#f1c40f"; // Gold
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#f39c12";
    ctx.stroke();

    // Drawing the medal ribbons
    ctx.beginPath();
    ctx.moveTo(85, 105);
    ctx.lineTo(70, 160);
    ctx.lineTo(95, 150);
    ctx.lineTo(100, 110);
    ctx.fillStyle = "#e74c3c"; // Red
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(115, 105);
    ctx.lineTo(130, 160);
    ctx.lineTo(105, 150);
    ctx.lineTo(100, 110);
    ctx.fillStyle = "#e74c3c"; // Red
    ctx.fill();

    // Text inside the medal
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Community", 100, 70);
    ctx.fillText("Donor", 100, 85);
}

// Creating charts using the D3.js library (Requirement i)
async function renderD3Charts() {
    try {
        // Fetch category aggregation and delivery aggregation separately
        const [categoryRes, deliveryRes] = await Promise.all([
            fetch(API_BASE_URL + '/api/products/stats/by-category'),
            fetch(API_BASE_URL + '/api/products/stats/delivered-by-city-month')
        ]);

        if (!categoryRes.ok) {
            throw new Error(`Category stats fetch failed: ${categoryRes.status} ${categoryRes.statusText}`);
        }
        if (!deliveryRes.ok) {
            throw new Error(`Delivery stats fetch failed: ${deliveryRes.status} ${deliveryRes.statusText}`);
        }

        const categoryData = await categoryRes.json();
        const deliveryData = await deliveryRes.json();

        const categories = categoryData.results || [];
        const deliveries = deliveryData.results || [];

        // --- Chart 1: Item distribution by category (Pie chart) ---
        const width = 200;
        const height = 200;
        const radius = Math.min(width, height) / 2;

        const svg1 = d3.select("#chart-categories")
            .selectAll("svg")
            .data([null])
            .join("svg")
            .attr("width", width)
            .attr("height", height)
            .selectAll("g")
            .data([null])
            .join("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const color = d3.scaleOrdinal(d3.schemeCategory10);
        const pie = d3.pie().value(d => d.totalProducts);
        const arc = d3.arc().innerRadius(0).outerRadius(radius);

        const arcs = svg1.selectAll("g.arc")
            .data(pie(categories))
            .join("g")
            .attr("class", "arc");

        arcs.append("path")
            .attr("d", arc)
            .attr("fill", d => color(d.data.categoryName || d.data.categoryId));

        arcs.append("text")
            .attr("transform", d => `translate(${arc.centroid(d)})`)
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .selectAll("tspan")
            .data(d => [
                { text: d.data.categoryName || d.data.categoryId, dy: "-0.35em", fill: "#fff" },
                { text: `${d.data.totalProducts}`, dy: "1em", fill: "#fff" }
            ])
            .join("tspan")
            .attr("x", 0)
            .attr("dy", d => d.dy)
            .attr("fill", d => d.fill)
            .text(d => d.text);

        arcs.append("title")
            .text(d => `${d.data.categoryName}: ${d.data.totalProducts}`);

        // --- Chart 2: Quantity of items delivered throughout the months of the year (Bar chart) ---
        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        const monthlyTotals = deliveries.reduce((acc, item) => {
            const year = item._id?.year;
            const month = item._id?.month;
            if (year && month) {
                const label = `${monthNames[month - 1]} ${year}`;
                acc[label] = (acc[label] || 0) + item.totalDelivered;
            }
            return acc;
        }, {});

        const monthlyChartData = Object.entries(monthlyTotals)
            .map(([month, totalDelivered]) => ({ month, totalDelivered }))
            .sort((a, b) => {
                const [aMonth, aYear] = a.month.split(' ');
                const [bMonth, bYear] = b.month.split(' ');
                return (parseInt(aYear) - parseInt(bYear)) || (monthNames.indexOf(aMonth) - monthNames.indexOf(bMonth));
            });

        const margin = { top: 20, right: 20, bottom: 40, left: 50 };
        const bcWidth = 420 - margin.left - margin.right;
        const bcHeight = 260 - margin.top - margin.bottom;

        const svg2 = d3.select("#chart-monthly")
            .selectAll("svg")
            .data([null])
            .join("svg")
            .attr("width", bcWidth + margin.left + margin.right)
            .attr("height", bcHeight + margin.top + margin.bottom)
            .selectAll("g")
            .data([null])
            .join("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const x = d3.scaleBand()
            .domain(monthlyChartData.map(d => d.month))
            .range([0, bcWidth])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(monthlyChartData, d => d.totalDelivered) || 1])
            .range([bcHeight, 0]);

        svg2.append("g")
            .attr("transform", `translate(0, ${bcHeight})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-35)")
            .attr("text-anchor", "end");

        svg2.append("g")
            .call(d3.axisLeft(y));

        svg2.selectAll("rect.bar")
            .data(monthlyChartData)
            .join("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.month))
            .attr("y", d => y(d.totalDelivered))
            .attr("width", x.bandwidth())
            .attr("height", d => bcHeight - y(d.totalDelivered))
            .attr("fill", "#3498db");

    } catch (err) {
        console.error("Error generating D3 charts:", err);
    }
}

// User session verification and data rendering on DOM content load
document.addEventListener("DOMContentLoaded", () => {
    // Retrieve the saved user data string from localStorage
    const userDataString = localStorage.getItem('currentUser');
    
    if (userDataString) {
        const user = JSON.parse(userDataString);
        
        // Update the DOM view containers with real application data records
        document.getElementById('user-name').textContent = user.name || "Unknown";
        document.getElementById('user-city').textContent = user.city || "Unknown";
        document.getElementById('user-phone').textContent = user.phone || "Unknown";
    } else {
        // If no user is logged in, restrict dashboard view access and redirect to the login interface
        window.location.href = "login.html";
    }
});

// Execution of drawing operations and chart rendering handlers on page load
window.onload = () => {
    drawContributionMedal();
    renderD3Charts();
};