var mysql = require('mysql');

module.exports = {
    insertDBRow: function(table, params, pool){
        return new Promise(function(resolve, reject){
            var sqlInsertQuery = buildSqlInsertQuery(table, params);

            pool.query(sqlInsertQuery, function(error, results){
                if(error){
                    reject(error);
                }else{
                    resolve(results);
                }
            })
        })

    },
    readDBRowsFiltered: function(table, params, pool){
        return new Promise(function(resolve, reject){
            var sqlSelectQuery = buildSqlSelectFilteredQuery(table, params);

            pool.query(sqlSelectQuery, function(error, results){
                if(error){
                    reject(error);
                }else{
                    resolve(results);
                }
            })
        })
    },
    readDBRows: function(table, pool){
        return new Promise(function(resolve, reject){
            var sqlSelectQuery = "SELECT * FROM ??";
            sqlSelectQuery = mysql.format(sqlSelectQuery, table);

            pool.query(sqlSelectQuery, function(error, results){
                if(error){
                    reject(error);
                }else{
                    resolve(results);
                }
            })
        })
    },
    updateDBRow: function(table, body, params, pool){
        return new Promise(function(resolve, reject){
            var sqlUpdateQuery = buildSqlUpdateQuery(table, body, params);
            console.log(sqlUpdateQuery)
            pool.query(sqlUpdateQuery, function(error, results){
                if(error){
                    console.log(error)
                    reject(error);
                }else{
                    resolve(results);
                }
            })
        })
    },
    deleteDBRowsFiltered: function(table, params, pool){
        return new Promise(function(resolve, reject){
            var sqlDeleteQuery = buildSqlDeleteFilteredQuery(table, params);
            console.log(sqlDeleteQuery)
            pool.query(sqlDeleteQuery, function(error, results){
                if(error){
                    reject(error);
                }else{
                    resolve(results);
                }
            })
        })
    },
    checkInputData: function(table, params, pool){
        return new Promise(function(resolve, reject){
            var sqlQuery = "SHOW COLUMNS FROM " + table;
            pool.query(sqlQuery, function(error, columns, fields){
                if(error){
                    reject(error);
                }else{
                    columns.forEach(column =>{
                        if(!column.Extra.includes("auto_increment")){
                            if(Object.keys(params).find(k => k === column.Field) === undefined){
                                reject(column);
                            }
                        }
                    })
                    resolve(true);
                }
            })
        })
    }
}

function buildSqlSelectFilteredQuery(table, params){
    var sqlSelectQuery;
    if(typeof params !== "undefined" && params !== null){
        sqlSelectQuery = "SELECT * FROM ?? WHERE ";
        var queryParams = [];
        queryParams.push(table);
        //componing the string for the insert query
        Object.keys(params).forEach(function(key, index) {
            if(typeof params[key] === "object"){
                for(let i = 0; i < params[key].length; i++){
                    if(i === 0){
                        sqlSelectQuery += "( ?? = ?";
                    }else{
                        sqlSelectQuery += " OR ?? = ?"
                    }
                    queryParams.push(key);
                    queryParams.push(params[key][i]);
                }
                sqlSelectQuery += (index !== Object.keys(params).length-1) ? ") AND " : ") ";
            }else{
                sqlSelectQuery += (index !== Object.keys(params).length-1) ? "?? = ? AND" : "?? = ?";

                queryParams.push(key);
                queryParams.push(params[key]);
            }
        })
    }else {
        sqlSelectQuery = "SELECT * FROM ??";
        var queryParams = [];
        queryParams.push(table);
    }

    //creating the query, from the string we created and the params
    sqlSelectQuery = mysql.format(sqlSelectQuery, queryParams);

    return sqlSelectQuery;
}

function buildSqlInsertQuery(table, params) {
    var sqlInsertQuery = "INSERT INTO ?? (";
    var values = [];
    var columns = [];
    var queryParams = [];
    columns.push(table);
    var numberOfColumn = 0;
    //componing the string for the insert query
    Object.keys(params).forEach(function(key, index) {
        sqlInsertQuery += (index !== Object.keys(params).length-1) ? "?? , " : "??) VALUES (";

        values.push(params[key]);
        columns.push(key);
        numberOfColumn = index;
    })
    for(var i = 0; i <= numberOfColumn; i++){
        sqlInsertQuery += (i == numberOfColumn) ? "?)" : "?, "
    };
    queryParams = columns.concat(values);
    //creating the query, from the string we created and the params
    sqlInsertQuery = mysql.format(sqlInsertQuery, queryParams);

    return sqlInsertQuery;
}

function buildSqlUpdateQuery(table, body, params){
    var sqlUpdateQuery = "UPDATE ?? SET ";
    var values = [];
    var columns = [];
    var queryParams = [];
    queryParams.push(table);
    var numberOfColumn = 0;
    //componing the string for the insert query
    Object.keys(body).forEach(function(key, index) {
        sqlUpdateQuery += (index !== Object.keys(body).length-1) ? "?? = ? , " : "?? = ? WHERE  ";
        queryParams.push(key);
        queryParams.push(body[key]);
    })
    // queryParams = columns.concat(values);
    Object.keys(params).forEach(function(key, index) {
        if(typeof params[key] === "object"){
            for(let i = 0; i < params[key].length; i++){
                if(i === 0){
                    sqlUpdateQuery += "( ?? = ?";
                }else{
                    sqlUpdateQuery += " OR ?? = ?"
                }
                queryParams.push(key);
                queryParams.push(params[key][i]);
            }
            sqlUpdateQuery += (index !== Object.keys(params).length-1) ? ") AND " : ") ";
        }else{
            sqlUpdateQuery += (index !== Object.keys(params).length-1) ? "?? = ? AND" : "?? = ?";

            queryParams.push(key);
            queryParams.push(params[key]);
        }
    })
        // sqlUpdateQuery += (i == numberOfColumn) ? " ?? = ?" : "?? = ?, "
    // queryParams = columns.concat(values);
    //creating the query, from the string we created and the params
    sqlUpdateQuery = mysql.format(sqlUpdateQuery, queryParams);
    console.log(sqlUpdateQuery)
     return sqlUpdateQuery;
}

function buildSqlDeleteFilteredQuery(table, params){
    var sqlDeleteQuery;
    if(typeof params !== "undefined" && params !== null){
        sqlDeleteQuery = "DELETE FROM ?? WHERE ";
        var queryParams = [];
        queryParams.push(table);
        //componing the string for the insert query
        Object.keys(params).forEach(function(key, index) {
            if(typeof params[key] === "object"){
                for(let i = 0; i < params[key].length; i++){
                    if(i === 0){
                        sqlDeleteQuery += "( ?? = ?";
                    }else{
                        sqlDeleteQuery += " OR ?? = ?"
                    }
                    queryParams.push(key);
                    queryParams.push(params[key][i]);
                }
                sqlDeleteQuery += (index !== Object.keys(params).length-1) ? ") AND " : ") ";
            }else{
                sqlDeleteQuery += (index !== Object.keys(params).length-1) ? "?? = ? AND" : "?? = ?";

                queryParams.push(key);
                queryParams.push(params[key]);
            }
        })
    }else {
        sqlDeleteQuery = "";
        var queryParams = [];
        queryParams.push(table);
    }
 //creating the query, from the string we created and the params
 sqlDeleteQuery = mysql.format(sqlDeleteQuery, queryParams);

 return sqlDeleteQuery;
}


