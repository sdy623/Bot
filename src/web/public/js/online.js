async function online() {
    try {

        // list server
        const r = await axios.get('/api/server', {
            timeout: 1000 * 10
        });
        if (r.data) {
            var count = 0;
            var s = r.data;
            //console.log(s);
            var e = document.getElementById("server_list");
            e.innerHTML = "";
            s.data.forEach(item => {
                console.log(item);
                if(item.server.public == false){
                    return;
                }
                var name = item.name.replace("YuukiPS ", "");
                var t = ` \
                <div class="col">
                    <div class="card mb-4 rounded-3 shadow-sm"> \
                        <div class="card-header py-3"> \
                            <h4 class="my-0 fw-normal">${name}</h4> \
                        </div> \
                        <div class="card-body"> \
                            <h1 class="card-title text-center">${item.server.player} <small class="text-muted fw-light">Online</small></h1> \
                        </div> \
                        <ul class="list-group list-group-flush"> \
                         <li class="list-group-item">Version: ${item.server.version.toString()}</li> \
                         <li class="list-group-item">CPU: ${item.server.cpu}</li> \
                         <li class="list-group-item">RAM: ${item.server.ram}</li> \
                         <li class="list-group-item">Commit: ${item.server.commit}</li> \
                        </ul> \
                    </div> \
                </div> \
                `;
                count++;                
                e.insertAdjacentHTML('afterbegin', t);
            });
            e.classList.add("row-cols-md-" + count);

        }

    } catch (error) {
        console.error(error);
    }
}
online();
setInterval(function () {
    online();
}, 10 * 1000);