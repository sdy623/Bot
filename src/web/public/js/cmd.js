async function setup() {
    try {
        const r = await axios.get('/api/server');
        if (r.data) {
            var data = r.data;

            //console.log(data);

            data.forEach(item => {
                const optionElement = document.createElement('option');
                optionElement.setAttribute('value', item.id);
                optionElement.innerText = item.name;
                document.getElementById("getserver").appendChild(optionElement);
            });

        }
    } catch (error) {
        console.error(error);
    }
}
let data_login;

let cmd_raw = document.querySelector("#cmd_raw");
cmd_raw.addEventListener("submit", async function (e) {
    e.preventDefault();

    if(!data_login){
        Swal.fire({
            icon: 'error',
            title: "No Login",
            showConfirmButton: false,
            timer: 1500
        });
        return;
    }

    console.log(data_login);

    let formData = new FormData(cmd_raw);
    let object = {};
    formData.forEach(function (value, key) {
        object[key] = value;
    });
    //let json = JSON.stringify(object);
    //console.log(object);

    var tmp = data_login;

    tmp['cmd'] = object['get_cmd_raw'];

    console.log(tmp);

    //TODO: check  type?
    const rr = await axios.get('/api/server/' + data_login['server']+"/command", {
        params: tmp
    });
    console.log(rr);
    if (rr.data) {
        var d = rr.data;
        if (d.code == 200) {
            Swal.fire({
                icon: 'success',
                title: d.msg,
                showConfirmButton: false,
                timer: 1500
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: d.msg
            });
        }
    } else {
        Swal.fire({
            icon: 'error',
            title: "Maybe down?",
            showConfirmButton: false,
            timer: 1500
        });
    }

});

let cmd_login = document.querySelector("#cmd_login");
cmd_login.addEventListener("submit", async function (e) {
    e.preventDefault();

    let formData = new FormData(cmd_login);
    let object = {};
    formData.forEach(function (value, key) {
        object[key] = value;
    });
    let json = JSON.stringify(object);
    console.log(json);

    //TODO: add real login
    const rr = await axios.post('/api/server/' + object.server, json);
    if (rr.data) {
        var d = rr.data;
        if (d.code == 200) {

            Swal.fire({
                icon: 'success',
                title: 'You have successfully connected',
                showConfirmButton: false,
                timer: 1500
            });
            data_login = object;
            Toggle("go_login");
            Toggle("go_cmd_raw");

        } else {
            Swal.fire({
                icon: 'error',
                title: d.msg
            });
        }
    } else {
        Swal.fire({
            icon: 'error',
            title: "Maybe down?",
            showConfirmButton: false,
            timer: 1500
        });
    }
    console.log(rr);
});

function Toggle(name = "go_cmd_raw", foce = null) {
    var x = document.getElementById(name);
    if (foce) {
        x.style.display = foce;
        return;
    }
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

setup();