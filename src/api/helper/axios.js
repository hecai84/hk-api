let axios = require('axios')
const Qs = require("qs");
module.exports = {
    axios: async (method, path, body) => {
        try {
            var raw = JSON.stringify(body);
            const res = await axios({
                method: method,
                headers: {
                    "Authorization": "am9yZGFubGVlQGxvZ2Zsb3dzLmNvbTo5N2ZjZGE0Y2JlZGM4NGUxMTY1YWRjZWE4ZGVhYmQyMA==",
                    "Content-Type": "application/json"
                },
                url: "https://gateway-uat.hk.pickupp.io/v2" + path,
                data: raw
            })
            return res
        } catch (error) {
            return error
        }
    }
}
