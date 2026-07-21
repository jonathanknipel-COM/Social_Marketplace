document.addEventListener("DOMContentLoaded", () => {
    drawCategoryChart();
    drawDeliveryChart();
});

function drawCategoryChart() {
    // Exactly matches your route: /api/products + /stats/by-category
    fetch('/api/products/stats/by-category') 
        .then(res => res.json())
        .then(data => {
            const chartData = data.results; 
            
            const width = 300;
            const height = 200;
            const margin = { top: 20, right: 20, bottom: 30, left: 40 };

            const svg = d3.select("#category-chart-container")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

            const x = d3.scaleBand()
                .domain(chartData.map(d => d.categoryName))
                .range([margin.left, width - margin.right])
                .padding(0.1);

            const y = d3.scaleLinear()
                .domain([0, d3.max(chartData, d => d.totalProducts)]).nice()
                .range([height - margin.bottom, margin.top]);

            svg.selectAll("rect")
                .data(chartData)
                .enter()
                .append("rect")
                .attr("x", d => x(d.categoryName))
                .attr("y", d => y(d.totalProducts))
                .attr("width", x.bandwidth())
                .attr("height", d => height - margin.bottom - y(d.totalProducts))
                .attr("fill", "#3b82f6");

            svg.selectAll("text.label")
                .data(chartData)
                .enter()
                .append("text")
                .attr("class", "label")
                .attr("x", d => x(d.categoryName) + x.bandwidth() / 2)
                .attr("y", height - 5)
                .attr("text-anchor", "middle")
                .attr("font-size", "12px")
                .text(d => d.categoryName);
        })
        .catch(err => console.error("Error drawing category chart:", err));
}

function drawDeliveryChart() {
    // Exactly matches your route: /api/products + /stats/delivered-by-city-month
    fetch('/api/products/stats/delivered-by-city-month') 
        .then(res => res.json())
        .then(data => {
            const chartData = data.results; 
            
            const width = 300;
            const height = 200;
            
            const svg = d3.select("#delivery-chart-container")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

            svg.selectAll("circle")
                .data(chartData)
                .enter()
                .append("circle")
                .attr("cx", (d, i) => (i * 60) + 50)
                .attr("cy", height / 2)
                .attr("r", d => d.totalDelivered * 10) 
                .attr("fill", "#10b981")
                .attr("opacity", 0.7);
                
            svg.selectAll("text")
                .data(chartData)
                .enter()
                .append("text")
                .attr("x", (d, i) => (i * 60) + 50)
                .attr("y", height / 2 + 5)
                .attr("text-anchor", "middle")
                .attr("fill", "white")
                .attr("font-weight", "bold")
                .text(d => d.totalDelivered);
        })
        .catch(err => console.error("Error drawing delivery chart:", err));
}
