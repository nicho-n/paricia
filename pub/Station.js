var commodityInfo = document.getElementById("commodityInfo");
var p = window.parent.window.parent.playerInfo;
var commodityList = document.getElementById("commodityList");
var buyTab = document.getElementById("buyTab");
var sellTab = document.getElementById("sellTab");
var _this;
function displayInfo(file){
	commodityInfo.src = file;
}


class Station{
	constructor(){
		_this = this;
		_this.commodities = {};
	}

	addCommodity(key, commodity){
		commodities[key] = commodity;
	}

	loadBuyTab(){
		buyTab.style.backgroundColor = "blue";
		sellTab.style.backgroundColor = "black";
		commodityList.innerHTML = "";
		var table = document.createElement("table");
		var tr = document.createElement("tr");
		var td1 = document.createElement("td");
		var td2 = document.createElement("td");
		var text1 = document.createTextNode("Items");
		var text2 = document.createTextNode("Price");
		td1.appendChild(text1);
		td2.appendChild(text2);

		tr.appendChild(td1);
		tr.appendChild(td2);

		tr.onclick = displayInfo("corn.html");

		table.appendChild(tr);

		for (var key in _this.commodities){
			var tr = document.createElement("tr");
			var td1 = document.createElement("td");
			var td2 = document.createElement("td");
			var text1 = document.createTextNode(_this.commodities[key].name);
			var text2 = document.createTextNode(_this.commodities[key].price);
			td1.appendChild(text1);
			td2.appendChild(text2);
			tr.appendChild(td1);
			tr.appendChild(td2);
			table.appendChild(tr);
		}

		tr.onclick = displayInfo("corn.html");
		commodityList.appendChild(table);


	}

	loadSellTab(){
		sellTab.style.backgroundColor = "blue";
		buyTab.style.backgroundColor = "black";
        	commodityList.innerHTML = "";
                var table = document.createElement("table");
                var tr = document.createElement("tr");
                var td1 = document.createElement("td");
                var td2 = document.createElement("td");
                var text1 = document.createTextNode("Your Items");
                var text2 = document.createTextNode("Sell Price");
                td1.appendChild(text1);
                td2.appendChild(text2);

                tr.appendChild(td1);
                tr.appendChild(td2);

		tr.onclick = displayInfo("sellcorn.html");

                table.appendChild(tr);

                for (var key in p.inventory){
                        var tr = document.createElement("tr");
                        var td1 = document.createElement("td");
                        var td2 = document.createElement("td");
                        var text1 = document.createTextNode(p.inventory[key].name);
                        var text2 = document.createTextNode(p.inventory[key].price);
                        td1.appendChild(text1);
                        td2.appendChild(text2);
                        tr.appendChild(td1);
                        tr.appendChild(td2);
                        table.appendChild(tr);
                }

                commodityList.appendChild(table);
		var slider = document.createElement(slider);
		
	}

}
