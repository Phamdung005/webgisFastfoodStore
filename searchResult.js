document.addEventListener("DOMContentLoaded", async () => {
    let searchValue = localStorage.getItem("searchQuery") || "";
    document.getElementById("resultTitle").innerText = `Kết quả tìm kiếm: ${searchValue}`;

    const urls = [
        { url: "http://localhost:5000/kfc", type: "KFC" },
        { url: "http://localhost:5000/lotte", type: "Lotte" },
        { url: "http://localhost:5000/jollibee", type: "Jollibee" }
    ];

    let allDatas = [];

    try {
        await Promise.all(urls.map(async (item) => {
            let response = await fetch(item.url);
            let data = await response.json();

            if (!data.features) return;
            let features = data.features.map(feature => ({
                name: feature.properties.name,
                address: feature.properties.address,
                coordinates: feature.geometry.coordinates.map(coord => parseFloat(coord)), // Chuyển tọa độ thành số
                type: item.type
            }));

            allDatas = allDatas.concat(features);
        }));


        let filteredData = allDatas.filter(item =>
            item.name.toLowerCase().includes(searchValue.toLowerCase())
        );


        let resultContainer = document.getElementById("searchResults");
        resultContainer.innerHTML = "";

        if (filteredData.length === 0) {
            resultContainer.innerHTML = "<p>Không tìm thấy kết quả nào.</p>";
        } else {
            filteredData.forEach(item => {
                let div = document.createElement("div");
                div.classList.add("search-item");
                div.innerHTML = `
                    <h3>${item.name} (${item.type})</h3>
                    <p>${item.address}</p>
                `;  
                resultContainer.appendChild(div);
            });
        }
    } catch (error) {
        console.error("Lỗi tải dữ liệu từ API:", error);
    }
});

document.getElementById("button-return").addEventListener("click", () => {
    window.location.href = "index.html";
});