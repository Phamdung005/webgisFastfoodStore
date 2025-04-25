function search() {
    let valueSearchInput = document.getElementById("searchBar").value;
    let dataSearch = allDatas.filter(value => value.name.toUpperCase().includes(valueSearchInput.toUpperCase()));
    console.log("Kết quả tìm kiếm:", dataSearch);
}

document.getElementById("searchIcon").addEventListener("click", () => {
    localStorage.setItem("searchQuery", document.getElementById("searchBar").value);
    window.location.href = "searchResult.html";
});

document.addEventListener("DOMContentLoaded", () => {
    let searchValue = localStorage.getItem("searchQuery");
    if (searchValue && document.getElementById("resultTitle")) {
        document.getElementById("resultTitle").innerText = `Kết quả tìm kiếm: ${searchValue}`;
    }
    
    let mapLocation = localStorage.getItem("mapLocation");
    if (mapLocation) {
        let { lng, lat } = JSON.parse(mapLocation);
        moveToLocation(lng, lat);
        localStorage.removeItem("mapLocation");
    }
});
