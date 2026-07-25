import {DataView} from "/lib/vUX/vUX-dataView.js";

export function TablePage(log){
    var view = null, ticker = null;

    function makeRows(count){
        let rows = [];
        for (let i = 1; i <= count; i++){
            rows.push({ id: i, symbol: "SYM" + i, price: ((i * 37) % 1000) + 1, change: 0 });
        }
        return rows;
    }

    function status(msg){
        $$.ss("#tableStatus").textContent = msg;
        log("[table] " + msg);
    }

    function visibleRowCount(){
        let all = $$.sa("#stockTable tbody tr");
        let visible = 0;
        for (let x = 0; x < all.length; x++){
            if (all[x].style.display != "none") visible++;
        }
        return visible;
    }

    function randomTick(count){
        for (let i = 0; i < count; i++){
            let id = 1 + Math.floor(Math.random() * 500);
            view.updateRow(id, { price: Math.round(Math.random() * 1000), change: (Math.random() > 0.5 ? "+" : "-") + (Math.random() * 5).toFixed(2) });
        }
    }

    function benchmark(){
        // 200 targeted DataView updates
        let t0 = performance.now();
        for (let i = 0; i < 200; i++){
            view.updateRow(1 + (i * 7) % 500, { price: i });
        }
        let targeted = performance.now() - t0;

        // naive equivalent: rebuild the whole 500-row body from the model and re-parse it
        let data = view.getData();
        let t1 = performance.now();
        let html = "";
        for (let x = 0; x < data.length; x++){
            html += "<tr><td>" + data[x].id + "</td><td>" + data[x].symbol + "</td><td>" + data[x].price + "</td><td>" + data[x].change + "</td></tr>";
        }
        let scratch = document.createElement("tbody"); // detached, so the live view stays intact
        scratch.innerHTML = html;
        let rebuild = performance.now() - t1;

        status("benchmark: 200 targeted updates " + targeted.toFixed(1) + "ms | full 500-row rebuild " + rebuild.toFixed(1) + "ms");
    }

    this.mount = function(){
        view = new DataView($$.ss("#stockTable"));
        view.config.key = "id";
        view.config.data = makeRows(500);
        view.initialize();
        status("mounted, rows in DOM: " + visibleRowCount());

        $$.ss("#btnSortPrice").addEventListener("click", function(){
            view.sort(function(a, b){ return a.price - b.price; });
            status("sorted by price, first row id: " + $$.ss("#stockTable tbody tr td").textContent);
        });
        $$.ss("#btnSortId").addEventListener("click", function(){
            view.sort(function(a, b){ return a.id - b.id; });
            status("sorted by id, first row id: " + $$.ss("#stockTable tbody tr td").textContent);
        });
        $$.ss("#btnFilter").addEventListener("click", function(){
            view.filter(function(row){ return row.price > 500; });
            status("filtered price > 500, visible rows: " + visibleRowCount());
        });
        $$.ss("#btnClearFilter").addEventListener("click", function(){
            view.filter(null);
            status("filter cleared, visible rows: " + visibleRowCount());
        });
        $$.ss("#btnTicker").addEventListener("click", function(){
            if (ticker != null) return;
            ticker = setInterval(function(){ randomTick(50); }, 100);
            status("ticker running");
        });
        $$.ss("#btnBench").addEventListener("click", benchmark);
    }

    this.destroy = function(){
        if (view == null) return; // never mounted, or already destroyed
        if (ticker != null){
            clearInterval(ticker);
            ticker = null;
        }
        view.destroy();
        view = null;
        log("[table] destroyed: ticker stopped, DataView released");
    }
}
