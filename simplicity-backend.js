var yaml = require('yamljs');
var pg = require('pg');
var Cursor = require('pg-cursor');
var program = require('commander');
var cnt = 0;
pg.defaults.poolsize = 25;

//args
program
    .version('0.0.1')
    .usage('[options] ')
    .option('-d, --databaseconn <file>', 'PostGres database connection file <file> default is config/db.yml', String, 'config/db.yml')
    .option('-m, --maintenance <file>', 'maintenance configuration file <file>', String)
    .option('-t, --datatest <file>', 'data test configuration file <file>', String)
    .option('-c, --buildcache <file>', 'data test configuration file <file>', String)
    .parse(process.argv);

// Load yaml file using YAML.load
// do not change the name of database connection file db.yml
// or it will be pushed to gitHub :-(
//may move this as argument 1
var dbObj = yaml.load(program.databaseconn);


//data tests passed as argument?
if (program.datatest) {
    var dataTests = yaml.load(program.datatest);
    var dataTestsObj = dataTests.tests;
    var datatestcheck = true;
    var checkrun = false;
}

//maintenance passed as argument?
if (program.maintenance) {
    var maintenance = yaml.load(program.maintenance);
    var maintenanceObj = maintenance.sql;
}

//buildcache data passed as argument?
if (program.buildcache) {
    var buildcache = yaml.load(program.buildcache);
    var buildcacheObj = buildcache.sql;
    var buildcacheCntObj = buildcache.count;
    var buildcacheCntrlObj = buildcache.control;
    var buildcacheINC = buildcache.increment;
    var buildcacheSleep = buildcache.sleep;
    var buildcacheDistances = buildcache.distances;
    var buildcacheChecksObj = buildcache.controlcheck;
    var checkpass = true;
}


var sleep = function (milliSeconds) {
    'use strict';
    var startTime = new Date().getTime(); // get the current time
    while (new Date().getTime() < startTime + milliSeconds) {
    }
};

var sql;
var client;
var successClient;
var query;
var checkQuery;
var queryConfig = {};

var clientError = function (err) {
    'use strict';
    if (err) {
        console.error("Error: %s", err);
    }
};

var scCE = function (err) {
    'use strict';
    if (err) {
        console.error("Error: %s", err);
    }
};

//when query ends
var queryEnd = function (result) {
    'use strict';
    //console.log(this.name + '...' + result.rowCount + ' row(s) returned.');
};

var successDrain = function () {
        'use strict';
        successClient.end();
};


var sd = function () {
        'use strict';
        successClientc.end();
};


var scqr = function (row, result) {
    //console.log(row);
};

var rowcount = 0;
var startname = '';
var dot = '';
var scend = function (result) {
    'use strict';
    sleep(buildcacheSleep);

    if (rowcount === 0) {
      startname = this.name;
      rowcount = 1;
    }
    if (startname === this.name){
      rowcount += buildcacheINC;
      dot = '';
    } else {
      dot = dot + '.';
    }

    var complete = ((rowcount/cnt) * 100).toFixed(2);
    //console.log(result.command);
    //console.log('SC END');
    console.log(this.name + '...' + result.rowCount + ' row(s) returned.');

    console.log(complete + '% completed' + dot);
    //console.log(this.acount);
};


var queryRow = function (row, result) {
    'use strict';
    if (row.hasOwnProperty('check')) {
        if (row.check) {
            console.log(this.name + ' PASSED.');
        } else {
            console.log(this.name + ' FAILED.');
            datatestcheck = false;
        }
    } else {
        //console.log();
    }
};

var queryBuildRow = function (row, result) {
    'use strict';
    if (row.count) {
        cnt = row.count;
        if (cnt <  1) {
            console.error('Building cache requires results from the count query.');
        } else {
            console.log('total address count: ' + cnt);
            buildBuffer();
            //checkControl();
            //buildCache(cnt);
        }

    } else {
        console.error('Must have a column named count!');
    }
};

var BufferDrain = function () {
    'use strict';
    sc.end();
    buildCache(cnt);
};

//drain for main client.
//when this is a data test this will spawn a new client to
//handle the sql for updateing the production table
var clientDrain = function () {
    'use strict';
    client.end();
    if (program.datatest) {
        if (!checkrun) {
            console.log(dataTests.testname + ' Test Results: ' + datatestcheck);
        }
        if (datatestcheck && !checkrun) {
            console.log(dataTests.testname + ' Test Results: ' + datatestcheck);
            var sqlcommands = dataTests.onsuccess;
            var sql;
            for (sql in sqlcommands) {
                if (sqlcommands.hasOwnProperty(sql)) {
                    successClient = new pg.Client(dbObj);
                    successClient.on('drain', successDrain);
                    successClient.connect(clientError);
                    console.log(sqlcommands[sql]);
                    checkrun = true;
                    successClient.query(sqlcommands[sql], clientError)
                        .on('row', queryRow)
                        .on('end', queryEnd);
                }
            }
        }
    }
};


var checkControl = function () {
    'use strict';
    successClient = new pg.Client(dbObj);
    successClient.on('drain', successDrain);
    successClient.connect(clientError);
    //build controls - buffers
    var sql;
    for (sql in buildcacheChecksObj) {
        if (buildcacheChecksObj.hasOwnProperty(sql)) {
            console.log('***check***');
            console.log(buildcacheChecksObj[sql]);
            console.log('***');
            successClient.query('select now();', clientError)
                .on('row', queryRow)
                .on('end', queryEnd);
        }
    }
};

var sc;
var buildBuffer = function () {
    'use strict';
    sc = new pg.Client(dbObj);
    sc.on('drain', BufferDrain);
    sc.connect(clientError);
    //build controls - buffers
    for (sql in buildcacheCntrlObj) {
        //sc.query(buildcacheCntrlObj[sql], scCE)
        sc.query('SELECT NOW();', scCE)
            .on('row', queryRow)
            .on('end', queryEnd);
    }
};

var successClientc;
//build the data cache
var buildCache = function (cnt) {
    'use strict';

    successClientc = new pg.Client(dbObj);
    successClientc.on('drain', sd);
    successClientc.connect(clientError);
    var i = 0;
    var sqlbc;
    for (i = 0; i < cnt; i += buildcacheINC) {
        //console.log('break-' + i);
        //sleep(buildcacheSleep);

        for (sqlbc in buildcacheObj) {
            if (buildcacheObj.hasOwnProperty(sqlbc)) {
                //console.log(buildcacheDistances)
                var dist;
                var theDist;
                var theName;
                var bcConfig;
                buildcacheDistances =  buildcacheObj[sqlbc].distances.join();
                if ( parseInt(buildcacheDistances) === 0 )  {
                    buildcacheDistances = 0;
                } else {
                  buildcacheDistances =  buildcacheObj[sqlbc].distances;
                }
                //for (dist in buildcacheDistances){
                    //if (buildcacheDistances.hasOwnProperty(dist)) {
                        //theDist = buildcacheDistances[dist];
                        theDist = buildcacheDistances;
                        theName = buildcacheObj[sqlbc].name;
                        //console.log(buildcacheDistances[dist]);
                        //console.log(buildcacheObj[sqlbc].text);
                        bcConfig = {
                                      acount: cnt,
                                      ai: i,
                                      name: theName ,
                                      text: buildcacheObj[sqlbc].text,
                                      values: [buildcacheINC,i,theDist]
                                    };
                        //console.log(bcConfig);
                        successClientc.query(bcConfig, clientError)
                           .on('row', scqr)
                           .on('end', scend);
                    //}
                //}
            }
        }
    }
};


//rollback function
var rollback = function (client, done) {
    'use strict';
    client.query('ROLLBACK', clientError);
    client.end();
};

client = new pg.Client(dbObj);
client.on('drain', clientDrain);
client.connect(clientError);

//build process
if (program.buildcache) {
    queryConfig = buildcacheCntObj[0];
    console.log(queryConfig);
    query = client.query(queryConfig, clientError)
        .on('row', queryBuildRow)
        .on('end', queryEnd);
}

//data tests
if (program.datatest) {
    for (sql in dataTestsObj) {
        if (dataTestsObj.hasOwnProperty(sql)) {
            queryConfig = dataTestsObj[sql];
            query = client.query(queryConfig, clientError)
                .on('row', queryRow)
                .on('end', queryEnd);
        }
    }
}

//maintenance scripts
if (program.maintenance) {
    for (sql in maintenanceObj) {
        if (maintenanceObj.hasOwnProperty(sql)) {
            queryConfig = maintenanceObj[sql];
            query = client.query(queryConfig, clientError)
                .on('row', queryRow)
                .on('end', queryEnd);
        }
    }
}

//time query to ensure end client ends
query = client.query('SELECT NOW()', clientError);
pg.end();
