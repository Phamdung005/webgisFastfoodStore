// Khởi tạo bản đồ OpenLayers
const map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([105.85, 21.02]), 
        zoom: 12
    })
});

// Hàm tạo layer từ GeoJSON
async function createLayer(sourceUrl, color) {
    try {
        let response = await fetch(sourceUrl);
        let data = await response.json();
        if (!data.features) throw new Error("Dữ liệu không hợp lệ");

        let features = data.features.map(feature => {
            let coords = feature.geometry.coordinates;
            let point = new ol.geom.Point(ol.proj.fromLonLat([coords[1], coords[0]]));
            
            let marker = new ol.Feature({
                geometry: point,
                name: feature.properties.name,
                address: feature.properties.address,
                time: feature.properties.time,
                phoneNumber: feature.properties.phoneNumber,
                website: feature.properties.website,
                rate: feature.properties.rate,
                information: feature.properties.information
            });

            // Thêm text label hiển thị tên cửa hàng
            marker.setStyle(new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 6,
                    fill: new ol.style.Fill({ color }), 
                    stroke: new ol.style.Stroke({ color: 'white', width: 2 })
                }),
                text: new ol.style.Text({
                    text: feature.properties.name, 
                    font: 'bold 12px Arial', 
                    fill: new ol.style.Fill({ color }), 
                    stroke: new ol.style.Stroke({ color: 'white', width: 3 }), 
                    offsetY: -12 
                })
            }));
            return marker;
        });

        let vectorSource = new ol.source.Vector({ features });
        let layer = new ol.layer.Vector({
            source: vectorSource
        });

        map.addLayer(layer);
        return layer;
    } catch (error) {
        console.error("Lỗi khi tạo layer:", error);
        return null;
    }
}

// Quản lý các lớp bản đồ
const layers = {};
Promise.all([
    createLayer('http://localhost:5000/kfc', 'red').then(layer => layers.kfc = layer),
    createLayer('http://localhost:5000/lotte', 'blue').then(layer => layers.lotte = layer),
    createLayer('http://localhost:5000/jollibee', 'orange').then(layer => layers.jollibee = layer)
]).then(() => {
    // Gán sự kiện cho checkbox sau khi các layer đã được tạo
    document.getElementById("kfc-layer").addEventListener("change", (e) => {
        if (layers.kfc) layers.kfc.setVisible(e.target.checked);
    });
    document.getElementById("lotte-layer").addEventListener("change", (e) => {
        if (layers.lotte) layers.lotte.setVisible(e.target.checked);
    });
    document.getElementById("jollibee-layer").addEventListener("change", (e) => {
        if (layers.jollibee) layers.jollibee.setVisible(e.target.checked);
    });
});

// Hiển thị popup khi click vào điểm
const popup = document.getElementById("popup");
const overlay = new ol.Overlay({ element: popup, positioning: 'bottom-center', stopEvent: false });
map.addOverlay(overlay);

map.on('click', event => {
    let featureFound = false;
    map.forEachFeatureAtPixel(event.pixel, feature => {
        const properties = feature.getProperties();
        if (!properties || !properties.name) return;

        let informations = properties.information ? properties.information.replace(/\n/g, '<br>') : 'không có thông tin';
        let phone = properties.phoneNumber;
        let website = properties.website;
        let rate = properties.rate.replace("\uf005", '<i class="fa-solid fa-star" style="color: #FFD43B;"></i>');

        popup.innerHTML = `
            <div class="popup-content">
                <h3>${properties.name}</h3>
                <p> - <strong> Địa chỉ:</strong> ${properties.address}</p>
                <p> - <strong> SĐT:</strong> ${phone}</p>
                <p> - <strong> Website:</strong> <a href="${website}" target="_blank">${website}</a></p>
                <p> - <strong> Đánh giá:</strong> ${rate}</p>
                <p id="information-text"> - <strong> Thông tin chung:</strong><br>${informations}</p>
            </div>
        `;
        overlay.setPosition(feature.getGeometry().getCoordinates());
        popup.style.display = 'block';
        featureFound = true;

        const popupContent = document.querySelector(".popup-content");
        if (popupContent) {
            popupContent.addEventListener("wheel", function (event) {
                event.stopPropagation(); 
            }, { passive: false });
        }
    });

    if (!featureFound) popup.style.display = 'none';
});
popup.addEventListener("pointerdown", function (event) {
    event.stopPropagation();
});

map.on('pointerdown', event => {
    const target = event.originalEvent.target;
    if (!popup.contains(target)) {
        popup.style.display = 'none';
    }
});
// Hiển thị tọa độ khi di chuột
const coordinateDisplay = document.createElement("div");
coordinateDisplay.id = "coordinateDisplay";
coordinateDisplay.style.cssText = "position:absolute;bottom:10px;left:10px;padding:5px 10px;background:rgba(0,0,0,0.7);color:#fff;border-radius:5px;font-size:12px;";
document.body.appendChild(coordinateDisplay);

map.on('pointermove', event => {
    let coord = ol.proj.toLonLat(event.coordinate);
    coordinateDisplay.innerHTML = `Tọa độ: ${coord[1].toFixed(6)}, ${coord[0].toFixed(6)}`;
});

// Tải dữ liệu tìm kiếm
let allDatas = [];
async function fetchAllData() {
    let urls = [
        { url: 'http://localhost:5000/kfc', type: "kfc" },
        { url: 'http://localhost:5000/lotte', type: "lotte" },
        { url: 'http://localhost:5000/jollibee', type: "jollibee" }
    ];

    for (let item of urls) {
        try {
            let response = await fetch(item.url);
            let data = await response.json();
            if (!data.features) continue;

            allDatas.push(...data.features.map(feature => ({
                name: feature.properties.name,
                address: feature.properties.address,
                coordinates: feature.geometry.coordinates,
                type: item.type
            })));
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        }
    }
}
fetchAllData();