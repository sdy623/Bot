async function online() {
    try {

        // list server
        const r = await axios.get('/api/server', {
            timeout: 1000 * 10
        });
        if (r.data) {
            var s = r.data;
            //console.log(s);
            var e = document.getElementById("server_list");
            e.innerHTML = "";
            s.data.forEach(item => {
                var name = item.name.replace("YuukiPS ", "");
                var t = ` \
                <div class="col">
                    <div class="card mb-4 rounded-3 shadow-sm"> \
                        <div class="card-header py-3"> \
                            <h4 class="my-0 fw-normal">${name}</h4> \
                        </div> \
                        <div class="card-body"> \
                            <h1 class="card-title pricing-card-title">${item.server.player} <small class="text-muted fw-light">Online</small></h1> \
                        </div> \
                    </div> \
                </div> \
                `;
                e.classList.add("row-cols-md-" + s.data.length);
                e.insertAdjacentHTML('afterbegin', t);
            });

        }

    } catch (error) {
        console.error(error);
    }
}
online();
setInterval(function () {
    online();
}, 60 * 1000);