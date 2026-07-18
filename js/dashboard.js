// Drawing a festive contribution medal on the Canvas component (Requirement ii)
function drawContributionMedal() {
    const canvas = document.getElementById("profile-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Cleaning
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
    ctx.fillStyle = "#e74c3c";
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
        // Fetching GroupBy data from the server
        const response = await fetch('/api/stats/summary');
        const statsData = await response.json(); 
        // Expected structure: { categoriesCount: [...], monthlySales: [...] }

        // --- Chart 1: Item distribution by category (Pie chart) ---
        const width = 300, height = 300, radius = Math.min(width, height) / 2;
        const svg1 = d3.select("#chart-categories")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const color = d3.scaleOrdinal(d3.schemeCategory10);
        const pie = d3.pie().value(d5 => d5.count);
        const arc = d3.arc().innerRadius(0).outerRadius(radius);

        const arcs = svg1.selectAll("arc")
            .data(pie(statsData.categoriesCount))
            .enter()
            .append("g");

        arcs.append("path")
            .attr("d", arc)
            .attr("fill", d => color(d.data._id)); // _id represents the category name from GroupBy

        // --- Chart 2: Quantity of items delivered throughout the months of the year (Bar chart) ---
        const margin = {top: 20, right: 20, bottom: 30, left: 40};
        const bcWidth = 400 - margin.left - margin.right;
        const bcHeight = 250 - margin.top - margin.bottom;

        const svg2 = d3.select("#chart-monthly")
            .append("svg")
            .attr("width", bcWidth + margin.left + margin.right)
            .attr("height", bcHeight + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const x = d3.scaleBand().rangeRound([0, bcWidth]).padding(0.1)
            .domain(statsData.monthlySales.map(d => d.month));
        const y = d3.scaleLinear().rangeRound([bcHeight, 0])
            .domain([0, d3.max(statsData.monthlySales, d => d.count)]);

        svg2.append("g")
            .attr("transform", `translate(0, ${bcHeight})`)
            .call(d3.axisBottom(x));

        svg2.append("g")
            .call(d3.axisLeft(y));

        svg2.selectAll(".bar")
            .data(statsData.monthlySales)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.month))
            .attr("y", d => y(d.count))
            .attr("width", x.bandwidth())
            .attr("height", d => bcHeight - y(d.count))
            .attr("fill", "#3498db");

    } catch (err) {
        console.error("Error generating D3 charts:", err);
    }
}

// Execution on page load
window.onload = () => {
    drawContributionMedal();
    renderD3Charts();
};