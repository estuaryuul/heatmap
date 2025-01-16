d3.json(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
) // URL sumber data
  .then((data) => {
    console.log(data.monthlyVariance.slice(0, 5));

    // membuat variable ukuran untuk svg
    const width = 1000;
    const height = 900;
    const padding = 50;

    // membuat variable svg
    const svg = d3
      .select("#container")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // membuat variable dengan mendekonstruksi dari data
    const tempBase = data.baseTemperature;
    const years = data.monthlyVariance.map((d) => d.year);
    const months = data.monthlyVariance.map((d) => d.month);
    const variances = data.monthlyVariance.map((d) => d.variance);

    console.log(years.slice(0, 5));
    console.log(months.slice(0, 5));
    console.log(variances.slice(0, 5));

    // membuat variable min max untuk years
    const minYears = d3.min(years);
    const maxYears = d3.max(years);

    // membuat variable xScale
    const xScale = d3
      .scaleLinear()
      .domain([minYears, maxYears]) // menentukan domain dengan nilai minimal dan maximal
      .range([padding, width - padding]); // menentukan panjang xScale dari nilai awal pixel dan nilai akhir pixel

    // membuat variable xAxis dari skala xScale
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(d3.range(minYears, maxYears + 1).filter((d) => d % 10 === 0)) // Buat array semua tahun dan pilih kelipatan 10
      .tickFormat(d3.format("d"));

    // menambahkan group utnuk x axis atau bottom axis ke element svg
    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height - padding - 300})`) // memanipulasi posisi axis agar berada di bawah sesuai height
      .call(xAxis);

    const nameMonthsFormat = d3.timeFormat("%B"); // membuat variable untuk format bulan ke nama bulan
    const nameMonths = Array.from(new Set(months)) // menghilangkan nilai duplikat pada array months
      .sort((a, b) => b - a) // mengurutkan array dari terbesar ke terkecil
      .map((m) => nameMonthsFormat(new Date(2000, m - 1))); // merubah nila bulan menjadi nama bulan

    // membuat variable yScale
    const yScale = d3
      .scaleBand()
      .domain(nameMonths) // menentukan nilai domain dengan array nameMonths
      .range([height - padding - 300, padding]); // menentukan panjang xScale dari nilai awal pixel dan nilai akhir pixel

    // membuat variable yAxis dari skala yScale
    const yAxis = d3.axisLeft(yScale);

    // menambahkan group utnuk y axis atau left axis ke element svg
    svg
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${padding}, 0)`) // memanipulasi posisi axis agar berada di sedikit ke kanan sejauh padding
      .call(yAxis);

    // membuat variable min max untuk variance
    const minVariances = d3.min(variances) - 1;
    const maxVariances = d3.max(variances) + 1;
    // membuat variable color scale untuk heatmap
    const colorScale = d3
      .scaleSequential(d3.interpolateCool)
      .domain([minVariances, maxVariances]);

    const legendScale = d3
      .scaleLinear()
      .domain([minVariances + tempBase, maxVariances + tempBase])
      .range([padding, padding + 300]);

    const legendAxis = d3.axisBottom(legendScale).tickFormat(d3.format(".1f"));

    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr("transform", `translate(0, ${height - padding})`); // memanipulasi posisi axis agar berada di sedikit ke kanan sejauh padding
    const uniqTemp = Array.from(new Set(variances));

    const legendRectWidth =
      300 / (maxVariances + tempBase - (minVariances + tempBase + 1));

    legend
      .append("g")
      .selectAll(".cell")
      .data(uniqTemp) // mengambil data untuk heatmap
      .enter()
      .append("rect") // membuat element persegi untuk setiap data pada heatmap
      .attr("x", (d) => legendScale(d + tempBase)) // memberi nilai x menggunakan xScale dengan nilai years array ke i
      .attr("y", 0) // memberi nilai y menggunakan yScale dari nilai month yang dirubah ke nama bulan
      .attr("width", legendRectWidth) // memberikan nilai width dengan nilai reactWidth
      .attr("height", 20) //memberi nilai height dengan nilai lebar dari yScale
      .attr("fill", (d) => colorScale(d));

    legend.append("g").attr("transform", `translate(0, 20)`).call(legendAxis);
    // membuat variable untuk lebar cell heatmap
    const rectWidth = (width - 2 * padding) / (maxYears - minYears + 1);

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid gray")
      .style("border-radius", "4px")
      .style("padding", "5px")
      .style("font-size", "12px")
      .style("box-shadow", "0px 2px 5px rgba(0, 0, 0, 0.3)")
      .style("display", "none")
      .style("pointer-events", "none");
    const tooltipselector = d3.select("#tooltip");

    // membuat heatmap
    svg
      .selectAll(".cell")
      .data(data.monthlyVariance) // mengambil data untuk heatmap
      .enter()
      .append("rect") // membuat element persegi untuk setiap data pada heatmap
      .attr("class", "cell") // memberi class cell pada setiap data pada heatmap
      .attr("data-year", (d) => d.year) // memberi properti data-year
      .attr("data-month", (d) => d.month - 1) // memberi properti data-month
      .attr("data-temp", (d) => tempBase + d.variance) // memberi properti data-temp dari temperatur base ditambah variance
      .attr("x", (d, i) => xScale(years[i])) // memberi nilai x menggunakan xScale dengan nilai years array ke i
      .attr("y", (d) => yScale(nameMonthsFormat(new Date(2000, d.month - 1)))) // memberi nilai y menggunakan yScale dari nilai month yang dirubah ke nama bulan
      .attr("width", rectWidth) // memberikan nilai width dengan nilai reactWidth
      .attr("height", yScale.bandwidth()) //memberi nilai height dengan nilai lebar dari yScale
      .attr("fill", (d) => colorScale(d.variance)) // memberikan warna berdasarkan colorScale dengan nilai variance data
      .on("mouseover", function (e, d) {
        tooltipselector
          .style("display", "block")
          .attr("data-year", d.year)
          .text(`Year: ${d.year}`);
      })
      .on("mousemove", function (e) {
        tooltipselector
          .style("left", `${e.pageX + 10}px`)
          .style("top", `${e.pageY + 10}px`);
      })
      .on("mouseout", function () {
        tooltipselector.style("display", "none");
      });
  })

  .catch((error) => {
    console.error("Error loading data: ", error);
  });
