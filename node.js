var http = require("http")
var express = require("express")
var app = express()
var port = process.env.PORT || 5000
var pg = require('pg');

var bodyParser = require('body-parser');
var app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static(__dirname + "/"))

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Authorization, Content-Type');
  next();
});

var server = http.createServer(app)
server.listen(port)

console.log("Listening on %d", port)

var baseClient;
pg.connect(process.env.DATABASE_URL, function(err, client) {
    baseClient = client;
});
var that = this;

function insertFeed(studentid, value){
    var queryString = "INSERT INTO feed (studentid, value, datetime) values('" + studentid + "', '" + value + "',now());";
    if(baseClient != null)
    var query = baseClient.query(queryString);
}

app.post('/login', function (req, res) {
    console.log('login:' + req.body.username);
    
    insertFeed(req.body.username, 'logged in');
    var rows = [];
    var queryString = "SELECT * FROM login where username = '" + req.body.username + "' and password='" + req.body.password + "';";
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('login: ' + result.rowCount + ' rows');
        // console.log(rows);
        res.json(rows);
    });
});

app.post('/updatepassword', function (req, res) {
    console.log('updatepassword:' + req.body.username);
    
    var rows = [];
    var queryString = "SELECT * FROM login where username = '" + req.body.username + "' and password='" + req.body.password + "';";
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
        insertFeed(req.body.username, 'changed password');
        var queryStringInner = "UPDATE login SET password = '" + req.body.newpassword +"' where username = '" + req.body.username + "';";
        console.log(queryStringInner);
        var queryInner = baseClient.query(queryStringInner);
        res.json('password changed');
    });
    query.on('end', function(result) {
        console.log('updatepassword: ' + result.rowCount + ' rows');
        if(result.rowCount == 0)
        res.json('password not changed');
    });
});

app.post('/createaccount', function (req, res) {
    console.log('createaccount:' + req.body.username);
    console.log('createaccount:' + req.body.type);
    if(req.body.type == 'admin'){
        if(req.body.promo == 'macadmin'){
            insertFeed(req.body.username, 'created a new account');
            createaccount(req.body.username, req.body.password, req.body.photoid, req.body.type);            
        }else{
            res.json('invalid promo code');
        }
    }else{
        insertFeed(req.body.username, 'created a new student account');
        createaccount(req.body.username, req.body.password, req.body.photoid, req.body.type);       
        createstudent(req.body.username, req.body.firstname, req.body.middlename, 
            req.body.lastname, req.body.email, req.body.telephone, req.body.gender, 
            req.body.residentstatus, req.body.country, req.body.semesterregistered,
            req.body.currentgpa, req.body.internshipstatus);
        createzerovaluedskills(req.body.username);
    }
    res.json('created');
});

function createaccount(username, password, photoid, type){
    var rows = [];
    var queryString = "INSERT INTO login (username, password, photoid, type) VALUES ('" + 
    username + "', '" + 
    password + "', '" + 
    photoid + "', '" + 
    type + "');";

    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('createaccount: ' + result.rowCount + ' rows');
    });
}

function createstudent(username, firstname, middlename, 
            lastname, email, telephone, gender, 
            residentstatus, country, semesterregistered, currentgpa, internshipstatus){
    var rows = [];
    var queryString = "INSERT INTO student (studentid, firstname, middlename, "+
            "lastname, email, telephone, gender, " +
            "residentstatus, country, semesterregistered, currentgpa, internshipstatus) VALUES ('" + 
    username + "', '" +  
    firstname + "', '" +  
    middlename + "', '" +  
    lastname + "', '" +  
    email + "', '" +  
    telephone + "', '" +  
    gender + "', '" +  
    residentstatus + "', '" +  
    country + "', '" +  
    semesterregistered + "', '" +  
    currentgpa + "', '" +  
    internshipstatus + "');";

    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('createaccount: ' + result.rowCount + ' rows');
    });
}

app.post('/updatestudent', function (req, res) {
    console.log('updatestudent:' + req.body.username);
    insertFeed(req.body.username, 'updated student information');
    updatestudent(req.body.username, req.body.firstname, req.body.middlename, 
        req.body.lastname, req.body.email, req.body.telephone, req.body.gender, 
        req.body.residentstatus, req.body.country, req.body.semesterregistered, 
        req.body.currentgpa, req.body.internshipstatus);
    res.json('updated');
});

function updatestudent(username, firstname, middlename, 
            lastname, email, telephone, gender, 
            residentstatus, country, semesterregistered, currentgpa, internshipstatus){
    var rows = [];
    var queryString = "UPDATE student SET " +
    "firstname = '" + firstname + "', " +  
    "middlename = '" + middlename + "', " +  
    "lastname = '" + lastname + "', " +  
    "email = '" + email + "', " +  
    "telephone = '" + telephone + "', " +  
    "gender = '" + gender + "', " +  
    "residentstatus = '" + residentstatus + "', " +  
    "country = '" + country + "', " +  
    "semesterregistered = '" + semesterregistered + "', " +  
    "currentgpa = " + currentgpa + ", " +  
    "internshipstatus = '" + internshipstatus + "' where " +
    "studentid = '" + username + "';";    

    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('createaccount: ' + result.rowCount + ' rows');
    });
}

app.post('/addeducation', function (req, res) {
    console.log('addeducation:' + req.body.username);
    insertFeed(req.body.username, 'added new education information');

    var rows = [];
    var queryString = "INSERT INTO education (studentid, degreetype, major, "+
            "gpa, university, location, certifications) VALUES ('" + 
    req.body.username + "', '" +  
    req.body.degreetype + "', '" +  
    req.body.major + "', '" +  
    req.body.gpa + "', '" +  
    req.body.university + "', '" +  
    req.body.location + "', '" +  
    req.body.certifications + "');";

    var query = baseClient.query(queryString);
    res.json('added');
});

app.post('/addworkexperience', function (req, res) {
    console.log('addworkexperience:' + req.body.username);
    insertFeed(req.body.username, 'added new work experience');

    var rows = [];
    var queryString = "INSERT INTO workexperience (studentid, companyid, location, "+
            "startdate, enddate, position) VALUES ('" + 
    req.body.username + "', '" +  
    req.body.companyid + "', '" +  
    req.body.location + "', '" +  
    req.body.startdate + "', '" +  
    req.body.enddate + "', '" +  
    req.body.position + "');";

    var query = baseClient.query(queryString);
    res.json('added');
});

app.post('/addcompany', function (req, res) {
    console.log('addcompany:' + req.body.username);
    insertFeed(req.body.username, 'added new company ' + toTitleCase(req.body.companyname));

    var rows = [];
    var queryString = "INSERT INTO company (photoid, companyname, address, "+
            "city, postalcode, country, contactpersonfirstname, contactpersonlastname, "+
            "contactpersonposition, telephone, email, type, companywebsite) VALUES ('" + 
    req.body.photoid + "', '" +  
    req.body.companyname + "', '" +  
    req.body.address + "', '" +  

    req.body.city + "', '" +  
    req.body.postalcode + "', '" +  
    req.body.country + "', '" +  
    req.body.contactpersonfirstname + "', '" +  
    req.body.contactpersonlastname + "', '" +  

    req.body.contactpersonposition + "', '" +  
    req.body.telephone + "', '" +  
    req.body.email + "', '" +  
    req.body.type + "', '" +  
    req.body.companywebsite + "');";

    var query = baseClient.query(queryString);
    res.json('added');
});

app.post('/addinternship', function (req, res) {
    console.log('addinternship:' + req.body.username);
    insertFeed(req.body.username, 'added new internship');

    var rows = [];
    var queryString = "INSERT INTO internship (studentid, companyid, "+
            "notes) VALUES ('" + 
    req.body.username + "', '" +  
    req.body.companyid + "', '" +  
    req.body.notes + "');";

    var query = baseClient.query(queryString);
    res.json('added');
});

app.post('/viewinternship', function (req, res) {
    console.log('viewinternship:' + req.body.username);

    var rows = [];
    var queryString = "select internship.id as superid,* from internship "+
    "inner join company on "+
    "cast(internship.companyid as int) = company.id where studentid = '"+
    req.body.username +"'";

     var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('viewstudent: ' + result.rowCount + ' rows');
        res.json(rows);
    });
});

app.post('/addjob', function (req, res) {
    console.log('addjob:' + req.body.username);
    insertFeed(req.body.username, 'posted a new job');

    var rows = [];
    var queryString = "INSERT INTO job (companyid, position, description, "+
            "responsibilities, requirements, salary, availability) VALUES ('" + 
    req.body.companyid + "', '" +  
    req.body.position + "', '" +  
    req.body.description + "', '" +  
    req.body.responsibilities + "', '" +  
    req.body.requirements + "', '" +  
    req.body.salary + "', '" +  
    req.body.availability + "');";

    var query = baseClient.query(queryString);
    res.json('added');
});

function createzerovaluedskills(username){
    var queryString = "INSERT INTO skill (studentid) values('" + username + "');";
    if(baseClient != null)
    var query = baseClient.query(queryString);
}

app.post('/updateskill', function (req, res) {
    console.log('updateskill:' + req.body.username);
    insertFeed(req.body.username, 'updated skills set');

    var rows = [];
    var queryString = "UPDATE skill SET " +
    "asp_dot_net = " + req.body.asp_dot_net + "," + 
    "c = " + req.body.c + "," + 
    "cplusplus = " + req.body.cplusplus + "," + 
    "csharp = " + req.body.csharp + "," + 
    "flex = " + req.body.flex + "," + 
    "java = " + req.body.java + "," + 
    "javascript = " + req.body.javascript + "," + 
    "lisp = " + req.body.lisp + "," + 
    "matlab = " + req.body.matlab + "," + 
    "mysql = " + req.body.mysql + "," + 
    "objectivec = " + req.body.objectivec + "," + 
    "pascal = " + req.body.pascal + "," + 
    "perl = " + req.body.perl + "," + 
    "php = " + req.body.php + "," + 
    "prolog = " + req.body.prolog + "," + 
    "python = " + req.body.python + "," + 
    "r = " + req.body.r + "," + 
    "ruby = " + req.body.ruby + "," + 
    "sql_oracle = " + req.body.sql_oracle + "," + 
    "tcl = " + req.body.tcl + "," + 
    "t_sql = " + req.body.t_sql + "," + 
    "vb_dot_net = " + req.body.vb_dot_net + "," + 
    "concrete = " + req.body.concrete + "," + 
    "dotnetnuke = " + req.body.dotnetnuke + "," + 
    "drupal = " + req.body.drupal + "," + 
    "joomla = " + req.body.joomla + "," + 
    "wordpress = " + req.body.wordpress + "," + 
    "android = " + req.body.android + "," + 
    "chromeos = " + req.body.chromeos + "," + 
    "ios = " + req.body.ios + "," + 
    "linux = " + req.body.linux + "," + 
    "macos = " + req.body.macos + "," + 
    "unix = " + req.body.unix + "," + 
    "windows = " + req.body.windows + " where " +
    "studentid = '" + req.body.username + "';"; 
    console.log(queryString)
    var query = baseClient.query(queryString);
    res.json('updateskill');
});

app.post('/addstudentjobachieved', function (req, res) {
    console.log('addstudentjobachieved:' + req.body.username);
    insertFeed(req.body.username, 'got a new job');

    var rows = [];
    var queryString = "INSERT INTO student_job_achieved (studentid, jobid) VALUES ('" + 
    req.body.username + "', '" +  
    req.body.jobid + "');";

    var query = baseClient.query(queryString);
    res.json('added');
});

app.post('/addstudentjobinterest', function (req, res) {
    console.log('addstudentjobinterest:' + req.body.username);
    insertFeed(req.body.username, 'is interested in a job');

    var rows = [];
    var queryString = "INSERT INTO student_job_interest (studentid, jobid) VALUES ('" + 
    req.body.username + "', '" +  
    req.body.jobid + "');";

    var query = baseClient.query(queryString);
    res.json('added');
});

app.post('/removestudentjobachieved', function (req, res) {
    console.log('removestudentjobachieved:' + req.body.username);
    insertFeed(req.body.username, 'is removed from a job');

    var rows = [];
    var queryString = "DELETE FROM student_job_achieved WHERE " + 
    "studentid = '" + req.body.username + "' AND " +  
    "jobid = '" + req.body.jobid + "';";

    var query = baseClient.query(queryString);
    res.json('removed');
});

app.post('/removestudentjobinterest', function (req, res) {
    console.log('removestudentjobinterest:' + req.body.username);
    insertFeed(req.body.username, 'removed a job interest');

    var rows = [];
    var queryString = "DELETE FROM student_job_interest WHERE " + 
    "studentid = '" + req.body.username + "' AND " +  
    "jobid = '" + req.body.jobid + "';";

    var query = baseClient.query(queryString);
    res.json('removed');
});






function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function parseTwitterDate(tdate) {
    var system_date = new Date(Date.parse(tdate));
    var user_date = new Date();
    var diff = Math.floor((user_date - system_date) / 1000);
    if (diff <= 1) {return "just now";}
    if (diff < 20) {return diff + " seconds ago";}
    if (diff < 40) {return "half a minute ago";}
    if (diff < 60) {return "less than a minute ago";}
    if (diff <= 90) {return "one minute ago";}
    if (diff <= 3540) {return Math.round(diff / 60) + " minutes ago";}
    if (diff <= 5400) {return "1 hour ago";}
    if (diff <= 86400) {return Math.round(diff / 3600) + " hours ago";}
    if (diff <= 129600) {return "1 day ago";}
    if (diff < 604800) {return Math.round(diff / 86400) + " days ago";}
    if (diff <= 777600) {return "1 week ago";}
    return "on " + system_date;
}

//SELECT STUDENTS
app.post('/showstudents', function (req, res) {
    console.log('showstudents: parameters');
    console.log('1');
    
    //search
    var searchQuery = "((firstname is NOT NULL OR firstname is NULL) OR " +
        "(middlename is NOT NULL OR middlename is NULL) OR " + 
        "(lastname is NOT NULL OR lastname is NULL))";
    if(req.body.search != undefined){
        if(req.body.search.length > 0){
            searchQuery = "((firstname like '%" + req.body.search + "%') OR " +
                "(middlename like '%" + req.body.search + "%') OR " + 
                "(student.studentid like '%" + req.body.search + "%') OR " + 
                "(lastname like '%" + req.body.search + "%'))";
        }
    }
    console.log('2');

    var rows = [];
    var studentids = '';
    //student info
    var display = req.body.gender == "all"?"(gender like '%')":"(gender like '" + req.body.gender + "')";
    display += " AND ";
    display += req.body.residentstatus == "all"?"(residentstatus like '%')":"(residentstatus = '" + req.body.residentstatus + "')";
    display += " AND ";
    display += req.body.country == "all"?"(country like '%')":"(country = '" + req.body.country + "')";
    display += " AND ";
    display += req.body.companyid == "all"?"(job.companyid is NOT NULL OR job.companyid is NULL)":"(job.companyid = '" + req.body.companyid + "')";
    display += " AND ";
    display += req.body.semesterregistered == "all"?"(semesterregistered like '%')":"(semesterregistered = '" + req.body.semesterregistered + "')";
    display += " AND ";
    display += req.body.currentgpa == "all"?"(currentgpa != -1)":"(currentgpa " + req.body.currentgpa + ")";
    display += " AND ";
    display += req.body.internshipstatus == "all"?"(internshipstatus like '%')":"(internshipstatus = '" + req.body.internshipstatus + "')";

    //job
    var hired = "(student_job_achieved.jobid is NOT NULL OR student_job_achieved.jobid is NULL)";
    if(req.body.hired == "true"){
        hired = "(student_job_achieved.jobid is NOT NULL)";
    }else if(req.body.hired == "false"){
        hired = "(student_job_achieved.jobid is NULL)";
    }

    //salary
    var salary = req.body.salary == "all"?"(salary is NOT NULL OR "+
    "salary is NULL)":"(cast(salary as int) " + req.body.salary + ")";

    var queryString = "SELECT distinct on (student.id) student.id " + 
    "FROM login inner join student on login.username = student.studentid "+
    "left join " + 
    " student_job_achieved on student.studentid = student_job_achieved.studentid " +
    "left join job on cast(student_job_achieved.jobid as int) = job.id where " + 
    display + " and " +
    hired + " and " +
    salary + " and " +
    searchQuery;

    console.log('3');
    console.log(queryString);
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        // rows.push(row);
        studentids += "'" + row.id + "',";
    });
    query.on('end', function(result) {
        console.log('showstudents: ' + result.rowCount + ' rows');
        console.log('studentids: ' + studentids);
        if(studentids.length == 0){
            rows = [];
            res.json(rows);
            // return 1;
        }else{
            studentids = studentids.substring(0, studentids.length-1);
            // res.json(studentids);
            if(req.body.gpa == 'all'){
                //send student details
                showStudents(studentids, res);

            }else{
                var queryString = "select student.id from education "+
                    "inner join student on cast(student.studentid as int) = "+
                    "cast(education.studentid as int) group by " +
                    "student.id having student.id in (" + studentids + ") and avg(gpa) "+req.body.gpa+";"
                var studentidsNew ='';
                var rows = [];
                // res.json(queryString);
                var query2 = baseClient.query(queryString);
                query2.on('row', function(row) {
                    // rows.push(row);
                    studentidsNew += "'" + row.id + "',";
                });
                query2.on('end', function(result) {
                    console.log('getgpa: ' + result.rowCount + ' rows');
                    console.log(studentidsNew);
                    if(studentidsNew.length == 0){
                        res.json(rows);
                        return 1;
                    }
                    studentidsNew = studentidsNew.substring(0, studentidsNew.length-1);
                    showStudents(studentidsNew, res);
                });
            }
        }
    });
});

function showStudents(studentids, res){
    var queryString = "select login.photoid, student.id, "+
        "student.firstname, student.currentgpa, student.internshipstatus,"+
        "student.lastname, student.residentstatus, student.country, student.gender, "+
        "student.studentid from login inner join student on "+
        "login.username = student.studentid "+
        "where student.id in(" + studentids + ");"
    var rows = [];
    console.log('this is what we need');
    console.log(queryString);
    // res.json(queryString);
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('selectstudent: ' + result.rowCount + ' rows');
        // console.log(rows);
        res.json(rows);
    });
}

//average gpa
app.post('/getgpa', function (req, res) {
    console.log('getgpa: ' + req.body.studentids);
    
    var queryString = "select avg(gpa), studentid from education group by " +
    "studentid having studentid in (" + req.body.studentids + ") and avg(gpa) "+req.body.gpa+";"
    
    var rows = [];
    // res.json(queryString);
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('getgpa: ' + result.rowCount + ' rows');
        // console.log(rows);
        res.json(rows);
    });
});

app.post('/viewstudent', function (req, res) {
    console.log('viewstudent:' + req.body.username);
    
   var rows = [];
    var queryString = "SELECT login.photoid, student.*, "+
    "semesterregistered.* FROM login inner join student on "+
    "login.username = student.studentid inner join semesterregistered "+
    "on cast(student.semesterregistered as int) = semesterregistered.id "+
    "where studentid = '" + req.body.username + "';";
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('viewstudent: ' + result.rowCount + ' rows');
        res.json(rows);
    });
});

app.post('/viewstudenteducation', function (req, res) {
    console.log('viewstudenteducation:' + req.body.username);
    
   var rows = [];
    var queryString = "SELECT * FROM education where studentid = '" + req.body.username + "';";
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('viewstudenteducation: ' + result.rowCount + ' rows');
        res.json(rows);
    });
});

app.post('/viewstudentworkexperience', function (req, res) {
    console.log('viewstudentworkexperience:' + req.body.username);
    
   var rows = [];
    var queryString = "SELECT workexperience.id as superid, * FROM workexperience inner join company " +
    "on cast(workexperience.companyid as int) = company.id where studentid = '" + req.body.username + "';";
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('viewstudentworkexperience: ' + result.rowCount + ' rows');
        res.json(rows);
    });
});

app.post('/viewallcompany', function (req, res) {
    console.log('viewallcompany:' + req.body.search);
    
    var queryString = "SELECT * FROM company where ";

    queryString += req.body.search == "all"?"(companyname like '%')":"(companyname like '%" + req.body.search + "%')";
    queryString += " and ";
    queryString += req.body.city == "all"?"(city like '%')":"(city like '%" + req.body.city + "%')";
    queryString += " and ";
    queryString += req.body.country == "all"?"(country like '%')":"(country like '%" + req.body.country + "%')";

    // res.json(queryString);

    var rows = [];
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('viewallcompany: ' + result.rowCount + ' rows');
        res.json(rows);
    });
});

app.post('/viewcompanybyid', function (req, res) {
    console.log('viewcompanybyid:' + req.body.id);
    
    var queryString = "SELECT * FROM company where id=" + req.body.id;

    var rows = [];
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('viewallcompany: ' + result.rowCount + ' rows');
        res.json(rows);
    });
});

app.post('/viewalljob', function (req, res) {
    console.log('viewalljob:' + req.body.search);
    
    var queryString = "SELECT job.id as jobid, * FROM job inner join company on cast(job.companyid as int) = company.id where ";
    
    queryString += req.body.search == "all"?"(position like '%')":"(position like '%" + req.body.search + "%')";
    queryString += " and ";
    queryString += req.body.city == "all"?"(city like '%')":"(city like '%" + req.body.city + "%')";
    queryString += " and ";
    queryString += req.body.country == "all"?"(country like '%')":"(country like '%" + req.body.country + "%')";

    // res.json(queryString);
    
    var rows = [];
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('viewalljob: ' + result.rowCount + ' rows');
        res.json(rows);
    });
});

app.post('/viewjobcompanybyid', function (req, res) {
    console.log('viewjobcompanybyid:' + req.body.id);
    
    var queryString = "SELECT job.id as jobid, * FROM job inner join company on cast(job.companyid as int) = company.id where ";
    queryString += " company.id = " + req.body.id;
    
    var rows = [];
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('viewjobcompanybyid: ' + result.rowCount + ' rows');
        res.json(rows);
    });
});

app.post('/viewjobbyid', function (req, res) {
    console.log('viewjobbyid:' + req.body.id);
    
    var queryString = "SELECT job.id as jobid, * FROM job inner join company on cast(job.companyid as int) = company.id where ";
    queryString += " job.id = " + req.body.id;
    
    var rows = [];
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('viewjobbyid: ' + result.rowCount + ' rows');
        res.json(rows);
    });
});

app.post('/viewallsemester', function (req, res) {
    console.log('viewallsemester:');
    
    var queryString = "SELECT * FROM semesterregistered ";
    
    // res.json(queryString);
    
    var rows = [];
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('viewalljob: ' + result.rowCount + ' rows');
        res.json(rows);
    });
});

app.post('/addsemester', function (req, res) {
    console.log('addsemester:' + req.body.semester + ', ' + req.body.year);
    
    var queryString = "SELECT * FROM semesterregistered where "+
    "semester='" + req.body.semester+"' and "+
    "year='" + req.body.year + "'";
    
    // res.json(queryString);
    
    var rows = [];
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('addsemestercheck: ' + result.rowCount + ' rows');
        // res.json(rows);
        if(result.rowCount < 1){
            var queryString2 = "INSERT INTO semesterregistered (semester, year) values " +
                "('" + req.body.semester + "','" + req.body.year + "');";
                
            // res.json(queryString);
            
            var rows2 = [];
            var query2 = baseClient.query(queryString2);
            query2.on('row', function(row) {
                rows2.push(row);
            });
            query2.on('end', function(result) {
                res.json('added');
            });
        }else{
            res.json('not added');
        }
    });

    
});

app.post('/deletedatafromtable', function (req, res) {
    console.log('deletedataofid:' + req.body.id + ', table:' + req.body.table);
    
    var queryString = "delete from " + req.body.table + " where id = " + req.body.id ;
    
    // res.json(queryString);
    
    var rows = [];
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        res.json('deleted');
    });
});

app.post('/getfeed', function(req, res) {
    console.log('getfeed:');

    var queryString = "select login.id, login.username, photoid, login.type, " +
    "student.firstname, student.lastname, feed.value, feed.datetime  from feed inner join login " +
    "on feed.studentid = login.username left join student on login.username = " +
    "student.studentid";

    if(req.body.username != null){
        queryString += " where login.username = '" + req.body.username +"'";
    }

    queryString += " where feed.value != 'logged in' order by feed.datetime desc";

    var rows = [];
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        row.newdatetime = parseTwitterDate(row.datetime);
        rows.push(row);
        // console.log(row.datetime);
    });
    query.on('end', function(result) {
        console.log('viewalljob: ' + result.rowCount + ' rows');
        res.json(rows);
    });

});

app.post('/getcount', function(req, res) {
    console.log('getcount:' + req.body.table);
    var rows = [];
    var table = req.body.table;
    if(table == 'company' || table == 'job' || table == 'student' || table == 'semesterregistered' ||
        table == 'student_job_achieved' || table == 'student_job_interest'){
        var queryString = "select count(*) from " + req.body.table;
        var query = baseClient.query(queryString);
        
        query.on('row', function(row) {
            rows.push(row);
        });
        query.on('end', function(result) {
            console.log('getcount: ' + result.rowCount + ' rows');
            res.json(rows);
        });
    }else{
        res.json('invalid table name');
    }

});

app.post('/checkusername', function (req, res) {
    console.log('checkusername:' + req.body.username);
    
    var rows = [];
    var queryString = "SELECT * FROM login where username = '" + req.body.username + "';";
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('checkusername: ' + result.rowCount + ' rows');
        // console.log(rows);
        if(result.rowCount > 0){
            res.json('exists');
        }else{
            res.json('unique');
        }
    });
});


app.post('/dashboardjob', function (req, res) {
    console.log('dashboardjob:');
    
    var queryString = "SELECT count(*), companyname FROM job inner join company on cast(job.companyid as int) = company.id group by companyname";
    
    // res.json(queryString);
    
    var rows = [];
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('dashboardjob: ' + result.rowCount + ' rows');
        res.json(rows);
    });
});

app.post('/dashboardstudentcountry', function (req, res) {
    console.log('dashboardstudentcountry:');
    
    var queryString = "select count(*), country from student group by country;";
    
    // res.json(queryString);
    
    var rows = [];
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('dashboardstudentcountry: ' + result.rowCount + ' rows');
        res.json(rows);
    });
});

app.post('/dashboardlikedpositions', function (req, res) {
    console.log('dashboardlikedpositions:');
    
    var queryString = "select count(*), position from job inner join student_job_interest on job.id = cast(student_job_interest.jobid as int) group by position";

    // res.json(queryString);
    
    var rows = [];
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('dashboardlikedpositions: ' + result.rowCount + ' rows');
        res.json(rows);
    });
});

app.post('/dashboardskilltotal', function (req, res) {
    console.log('dashboardskilltotal:');
    
    var queryString = "select sum(asp_dot_net) as asp_dot_net, sum(c) as c, sum(cplusplus) as cplusplus, sum(csharp) as csharp, sum(flex) as flex, sum(java) as java, sum(javascript) as javascript, sum(lisp) as lisp, sum(matlab) as matlab, sum(mysql) as mysql, sum(objectivec) as objectivec, sum(pascal) as pascal, sum(perl) as perl, sum(php) as php, sum(prolog) as prolog, sum(python) as python, sum(r) as r, sum(ruby) as ruby, sum(sql_oracle) as sql_oracle, sum(tcl) as tcl, sum(t_sql) as t_sql, sum(vb_dot_net) as vb_dot_net, sum(concrete) as concrete, sum(dotnetnuke) as dotnetnuke, sum(drupal) as drupal, sum(joomla) as joomla, sum(wordpress) as wordpress, sum(android) as android, sum(chromeos) as chromeos, sum(ios) as ios, sum(linux) as linux, sum(macos) as macos, sum(unix) as unix, sum(windows) as windows from skill";
    // res.json(queryString);
    
    var rows = [];
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('dashboardskilltotal: ' + result.rowCount + ' rows');
        res.json(rows);
    });
});

app.post('/dashboardeducationcompany', function (req, res) {
    console.log('dashboardeducationcompany:');
    
    var queryString = "select count(*), education.university, company.companyname from education inner join student_job_achieved on education.studentid = student_job_achieved.studentid inner join job on cast(student_job_achieved.jobid as int) = job.id inner join company on cast(job.companyid as int) = company.id group by education.university, company.companyname";

    var rows = [];
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('dashboardeducationcompany: ' + result.rowCount + ' rows');
        res.json(rows);
    });
});


app.post('/viewstudentachievedbyjobid', function (req, res) {
    console.log('viewstudentachievedbyjobid:' + req.body.id);
    
    var queryString = "select student_job_achieved.id, login.photoid, "+
    "student.firstname, "+
    "student.lastname, student.country, student.gender, "+
    "student.studentid from login inner join student on "+
    "login.username = student.studentid "+
    "inner join student_job_achieved on cast(student.studentid as int) "+
    "= cast(student_job_achieved.studentid as int) inner join job on "+
    "cast(student_job_achieved.jobid as int) = job.id "+
    "where ";
    queryString += " job.id = " + req.body.id;
    
    var rows = [];
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('viewstudentachievedbyjobid: ' + result.rowCount + ' rows');
        res.json(rows);
    });
});

app.post('/viewstudentinterestbyjobid', function (req, res) {
    console.log('viewstudentinterestbyjobid:' + req.body.id);
    
    var queryString = "select student_job_interest.id, login.photoid, "+
    "student.firstname, "+
    "student.lastname, student.country, student.gender, "+
    "student.studentid from login inner join student on "+
    "login.username = student.studentid "+
    "inner join student_job_interest on cast(student.studentid as int) "+
    "= cast(student_job_interest.studentid as int) inner join job on "+
    "cast(student_job_interest.jobid as int) = job.id "+
    "where ";
    queryString += " job.id = " + req.body.id;
    
    var rows = [];
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('viewstudentinterestbyjobid: ' + result.rowCount + ' rows');
        res.json(rows);
    });
});

app.post('/viewstudentachievedbystudentid', function (req, res) {
    console.log('viewstudentachievedbystudentid:' + req.body.username);
    
    var queryString = "select student_job_achieved.id as superid, * "+
    "from login inner join student on "+
    "login.username = student.studentid "+
    "inner join student_job_achieved on cast(student.studentid as int) "+
    "= cast(student_job_achieved.studentid as int) inner join job on "+
    "cast(student_job_achieved.jobid as int) = job.id "+
    "inner join company on company.id = cast(job.companyid as int) "+
    "where ";
    queryString += " cast(student.studentid as int) = " + req.body.username;
    
    var rows = [];
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('viewstudentachievedbystudentid: ' + result.rowCount + ' rows');
        res.json(rows);
    });
});

app.post('/viewstudentinterestbystudentid', function (req, res) {
    console.log('viewstudentinterestbystudentid:' + req.body.username);
    
    var queryString = "select student_job_interest.id as superid, * "+
    "from login inner join student on "+
    "login.username = student.studentid "+
    "inner join student_job_interest on cast(student.studentid as int) "+
    "= cast(student_job_interest.studentid as int) inner join job on "+
    "cast(student_job_interest.jobid as int) = job.id "+
    "inner join company on company.id = cast(job.companyid as int) "+
    "where ";
    queryString += " cast(student.studentid as int) = " + req.body.username;
    
    var rows = [];
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('viewstudentinterestbystudentid: ' + result.rowCount + ' rows');
        res.json(rows);
    });
});

app.post('/addskill', function (req, res) {
    console.log('addskill:' + req.body.username);
    insertFeed(req.body.username, 'added skills set');

    var rows = [];
    var queryString = "INSERT INTO skill VALUES (" +
        "'" + req.body.username + "'," + 
        "'" + req.body.asp_dot_net + "'," + 
        "'" + req.body.c + "'," + 
        "'" + req.body.cplusplus + "'," + 
        "'" + req.body.csharp + "'," + 
        "'" + req.body.flex + "'," + 
        "'" + req.body.java + "'," + 
        "'" + req.body.javascript + "'," + 
        "'" + req.body.lisp + "'," + 
        "'" + req.body.matlab + "'," + 
        "'" + req.body.mysql + "'," + 
        "'" + req.body.objectivec + "'," + 
        "'" + req.body.pascal + "'," + 
        "'" + req.body.perl + "'," + 
        "'" + req.body.php + "'," + 
        "'" + req.body.prolog + "'," + 
        "'" + req.body.python + "'," + 
        "'" + req.body.r + "'," + 
        "'" + req.body.ruby + "'," + 
        "'" + req.body.sql_oracle + "'," + 
        "'" + req.body.tcl + "'," + 
        "'" + req.body.t_sql + "'," + 
        "'" + req.body.vb_dot_net + "'," + 
        "'" + req.body.concrete + "'," + 
        "'" + req.body.dotnetnuke + "'," + 
        "'" + req.body.drupal + "'," + 
        "'" + req.body.joomla + "'," + 
        "'" + req.body.wordpress + "'," + 
        "'" + req.body.android + "'," + 
        "'" + req.body.chromeos + "'," + 
        "'" + req.body.ios + "'," + 
        "'" + req.body.linux + "'," + 
        "'" + req.body.macos + "'," + 
        "'" + req.body.unix + "'," + 
        "'" + req.body.windows + "')";
    console.log(queryString)
    var query = baseClient.query(queryString);
    res.json('addskill');
});


app.post('/viewskill', function (req, res) {
    console.log('viewskill:' + req.body.username);

    var rows = [];
    var queryString = "select * from skill where " +
    "studentid = '" + req.body.username + "';"; 
    // console.log(queryString)
    var rows = [];
    var query = baseClient.query(queryString);
    query.on('row', function(row) {
        rows.push(row);
    });
    query.on('end', function(result) {
        console.log('viewskill: ' + result.rowCount + ' rows');
        res.json(rows);
    });
});
