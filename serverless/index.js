exports.main = (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    var mysql = require('mysql');

    var con = mysql.createConnection({
        socketPath: process.env.DB_SOCKET,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    con.connect(function(err) {
        if (err) res.status(500).send(err);
        const keyword = `%${req.query.keyword}%`;
        con.query(`SELECT * FROM articles WHERE content LIKE ${con.escape(keyword)} LIMIT ${Math.min(req.query.limit, 2000)};`, function (err, result, fields) {
            if (err) res.status(500).send(err);
            res.status(200).send(result);
        });
    });
}
