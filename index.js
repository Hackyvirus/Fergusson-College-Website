// import statement 
import 'dotenv/config'
import express from "express"
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import pg from 'pg'
import http from 'http';
import { Server } from 'socket.io';
import { compile } from "ejs";

// Constants 
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express()
const server = http.createServer(app);
const io = new Server(server);

const sslOptions = {
    rejectUnauthorized: false,
  };
  const db = new pg.Client({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASS,
    port: 5432,
    ssl: sslOptions,
})
db.connect()

// Variables 
let chats = [];
const teacherCodes = [1234, 4321, 5678, 1010]
const studentCodes = [1234, 4321, 5678, 1010]
const alumniCodes = [1234, 4321, 5678, 1010]
const adminCodes = [1234, 4321, 5678, 1010]

// socket connection 
io.on('connection', (socket) => {
    socket.emit('all chats', chats);
    socket.on('chat message', (data) => {
        const { sender, message } = data;
        chats.push({ sender, message });
        io.emit('chat message', { sender, message });
    });
    socket.on('disconnect', () => {
    });
});

// App Use and Set 
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public/'))

// // App Get Routes 
app.get("/", (req, res) => {
    res.render('index.ejs');
})
app.get("/teacher-code", (req, res) => {
    res.render("code/teacher-code.ejs")
})
app.get("/student-code", (req, res) => {
    res.render("code/student-code.ejs")
})
app.get("/alumni-code", (req, res) => {
    res.render("code/alumni-code.ejs")
})
app.get("/admin-code", (req, res) => {
    res.render("code/admin-code.ejs")
})

// Login Get Routes 
app.get("/teacher-login", (req, res) => {
    res.render('login/teacher-login.ejs')
})
app.get("/student-login", (req, res) => {
    res.render('login/student-login.ejs')
})
app.get("/admin-login", (req, res) => {
    res.render('login/admin-login.ejs')
})
app.get("/alumni-login", (req, res) => {
    res.render('login/alumni-login.ejs')
})

// App check Post Routes 
app.post("/check-student", (req, res) => {
    const code = req.body.sCode
    if (studentCodes.includes(parseInt(code))) {
        return res.render("registor/student-register.ejs")
    } else {
        return res.render("code/student-code.ejs")
    }
})
app.post("/check-teacher", (req, res) => {
    const code = req.body.sCode
    if (teacherCodes.includes(parseInt(code))) {
        return res.render("registor/teacher-register.ejs")
    } else {
        return res.render("code/teacher-code.ejs")
    }
})
app.post("/check-alumni", (req, res) => {
    const code = req.body.sCode
    if (alumniCodes.includes(parseInt(code))) {
        return res.render("registor/alumni-register.ejs")
    } else {
        return res.render("code/alumni-code.ejs")
    }
})
app.post("/check-admin", (req, res) => {
    const code = req.body.sCode
    if (adminCodes.includes(parseInt(code))) {
        return res.render("registor/admin-register.ejs")
    } else {
        return res.render("code/admin-code.ejs")
    }
})

// App Register Routes 
app.post("/teacher-registration", async (req, res) => {
    const first_name = req.body.fname
    const last_name = req.body.lname
    const email_id = req.body.email
    const phone_no = req.body.phone
    const password = req.body.password
    const DOB = req.body.dob
    const checkTeacher = await db.query("SELECT * FROM teachers WHERE email_id= $1 OR phone_no = $2", [email_id, phone_no])
    if (checkTeacher.rows.length > 0) {
        return res.render("login/teacher-login.ejs", { userExist: 'User Exist with this email or Phone Number' })
    } else {
        try {
            await db.query("INSERT INTO teachers (first_name, last_name, email_id, phone_no, password,dob) VALUES ($1,$2,$3,$4,$5,$6)", [first_name, last_name, email_id, phone_no, password, DOB]);
            res.redirect("/teacher-login");
        } catch (err) {
            console.log(err);
            res.render("registor/teacher-register.ejs")
        }
    }

})
app.post("/student-registration", async (req, res) => {
    const first_name = req.body.fname
    const last_name = req.body.lname
    const roll_no = req.body.roleNumber
    const email_id = req.body.email
    const phone_no = req.body.phone
    const DOB = req.body.dob
    const current_class = req.body.class
    const password = req.body.password
    const checkStudent = await db.query("SELECT * FROM students WHERE email_id = $1 OR phone_no = $2", [email_id, phone_no])
    if (checkStudent.rows.length > 0) {
        return res.render("login/student-login.ejs", { userExist: 'User Exist with this email or Phone Number' })
    }
    else {
        try {
            await db.query("INSERT INTO students(first_name, last_name, roll_no, email_id, phone_no,dob,class,password) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)", [first_name, last_name, roll_no, email_id, phone_no, DOB, current_class, password])
            res.redirect("/student-login");
        } catch (error) {
            console.log(error)
            res.render("registor/student-register.ejs")
        }
    }
})
app.post("/alumni-registration", async (req, res) => {
    const first_name = req.body.fname
    const last_name = req.body.lname
    const email_id = req.body.email
    const phone_no = req.body.phone
    const password = req.body.password
    const DOB = req.body.dob
    const checkAlumni = await db.query("SELECT * FROM alumni WHERE email_id= $1 OR phone_no = $2", [email_id, phone_no])
    if (checkAlumni.rows.length > 0) {
        return res.render("login/alumni-login.ejs", { userExist: 'User Exist with this email or Phone Number' })
    } else {
        try {
            await db.query("INSERT INTO alumni(first_name,last_name,email_id,phone_no,password,dob) VALUES($1,$2,$3,$4,$5,$6)", [first_name, last_name, email_id, phone_no, password, DOB])
            res.redirect("/alumni-login");
        } catch (error) {
            console.log(error)
            res.render("registor/alumni-register.ejs")
        }
    }
})
app.post("/admin-registration", async (req, res) => {
    const first_name = req.body.fname
    const last_name = req.body.lname
    const email_id = req.body.email
    const phone_no = req.body.phone
    const password = req.body.password
    const DOB = req.body.dob
    const checkAdmin = await db.query("SELECT * FROM admin WHERE email_id= $1 OR phone_no = $2", [email_id, phone_no])
    if (checkAdmin.rows.length > 0) {
        return res.render("login/admin-login.ejs", { userExist: 'User Exist with this email or Phone Number' })
    } else {
        try {
            await db.query("INSERT INTO admin (first_name,last_name,email_id,phone_no,password,dob) VALUES($1,$2,$3,$4,$5,$6)", [first_name, last_name, email_id, phone_no, password, DOB])
            res.redirect("/admin-login");
        } catch (error) {
            console.log(error)
            res.render("registor/admin-register.ejs")
        }
    }
})

// Login Post Routes 
app.post('/teacher-login', async (req, res) => {
    const email_id = req.body.email
    const password = req.body.password
    try {
        const result = await db.query("SELECT * FROM teachers WHERE email_id = $1 AND password =  $2", [email_id, password])
        const noticesResult = await db.query("SELECT notice FROM notices ORDER BY notice")
        const notices = noticesResult.rows.map(item => item.notice)
        const resultEmail = result.rows[0].email_id
        const resultPass = result.rows[0].password
        if (email_id === resultEmail && password === resultPass) {
            const FullName = result.rows[0].first_name + ' ' + result.rows[0].last_name
            const Email = result.rows[0].email_id
            const phone = result.rows[0].phone_no
            const DO = new Date(result.rows[0].dob)
            const month = DO.getMonth()
            const date = DO.getDate()
            const year = DO.getFullYear()
            const DOB = date + '/' + (month + 1) + '/' + year
            res.render('dashboard/teacher-dashboard.ejs', { fullname: FullName, email: Email, phone_no: phone, dob: DOB, notices: notices });
        } else {
            res.redirect('/teacher-login')
        }
    } catch (error) {
        res.redirect('/teacher-login')
    }
})
app.post('/student-login', async (req, res) => {
    const email_id = req.body.email
    const password = req.body.password
    try {
        const result = await db.query("SELECT * FROM students WHERE email_id = $1 AND password =  $2", [email_id, password])
        const resultEmail = result.rows[0].email_id
        const resultPass = result.rows[0].password
        const current_class = result.rows[0].class
        const noticesResult = await db.query("SELECT notice FROM notices WHERE class = $1 OR  class = 'general' ORDER BY notice ", [current_class])
        const notices = noticesResult.rows.map(item => item.notice)
        let materialResult = await db.query("SELECT * FROM materials WHERE class = $1 AND class = 'general' ORDER BY material", [current_class])
        materialResult = materialResult.rows
        const materials = materialResult.map(item => item.material)
        const materialsName = materialResult.map(item => item.class)
  
        if (email_id === resultEmail && password === resultPass) {
            const current_class = result.rows[0].class
            const FullName = result.rows[0].first_name + ' ' + result.rows[0].last_name
            const Email = result.rows[0].email_id
            const phone = result.rows[0].phone_no
            const DO = new Date(result.rows[0].dob)
            const month = DO.getMonth()
            const date = DO.getDate()
            const year = DO.getFullYear()
            const DOB = date + '/' + (month + 1) + '/' + year
            res.render('dashboard/student-dashboard.ejs', { fullname: FullName, email: Email, phone_no: phone, dob: DOB, notices: notices, material: materials, materialsName: materialsName, materialResult: materialResult,current_class:current_class })
        } else {
            res.redirect('/student-login')
        }

    } catch (error) {
        res.redirect('/student-login')
    }
})
app.post('/alumni-login', async (req, res) => {
    const email_id = req.body.email
    const password = req.body.password
    try {
        const result = await db.query("SELECT * FROM alumni WHERE email_id = $1 AND password =  $2", [email_id, password])
        const resultEmail = result.rows[0].email_id
        const resultPass = result.rows[0].password
        const current_class = result.rows[0].class
        const noticesResult = await db.query("SELECT notice FROM notices WHERE class = 'general' ORDER BY notice ")
        const notices = noticesResult.rows.map(item => item.notice)
        let materialResult = await db.query("SELECT * FROM materials WHERE class = 'general' ORDER BY material")
        materialResult = materialResult.rows
        if (email_id === resultEmail && password === resultPass) {
            const FullName = result.rows[0].first_name + ' ' + result.rows[0].last_name
            const Email = result.rows[0].email_id
            const phone = result.rows[0].phone_no
            const DO = new Date(result.rows[0].dob)
            const month = DO.getMonth()
            const date = DO.getDate()
            const year = DO.getFullYear()
            const DOB = date + '/' + (month + 1) + '/' + year
            res.render('dashboard/alumni-dashboard.ejs', { fullname: FullName, email: Email, phone_no: phone, dob: DOB, notices: notices, materialResult: materialResult })
        } else {
            res.redirect('/alumni-login')
        }

    } catch (error) {
        res.redirect('/alumni-login')
    }
})
app.post('/admin-login', async (req, res) => {
    const email_id = req.body.email
    const password = req.body.password
    try {
        const result = await db.query("SELECT * FROM admin WHERE email_id = $1 AND password =  $2", [email_id, password])
        const noticesResult = await db.query("SELECT notice FROM notices ORDER BY notice ")
        const notices = noticesResult.rows.map(item => item.notice)
        const resultEmail = result.rows[0].email_id
        const resultPass = result.rows[0].password
        if (email_id === resultEmail && password === resultPass) {
            const FullName = result.rows[0].first_name + ' ' + result.rows[0].last_name
            const Email = result.rows[0].email_id
            const phone = result.rows[0].phone_no
            const DO = new Date(result.rows[0].dob)
            const month = DO.getMonth()
            const date = DO.getDate()
            const year = DO.getFullYear()
            const DOB = date + '/' + (month + 1) + '/' + year
            res.render('dashboard/admin-dashboard.ejs', { fullname: FullName, email: Email, phone_no: phone, dob: DOB, notices: notices })
        } else {
            res.redirect('/admin-login')
        }

    } catch (error) {
        res.redirect('/admin-login')
    }
})


// Upload Notice POST Routes 
app.post('/teacher-notice', async (req, res) => {
    try {
        const current_class = req.body.class
        const notice = req.body.noticeText
        const FullName = req.body.fullname
        const Email = req.body.email
        const phone = req.body.phone_no
        const dateOfbirth = req.body.dob
        await db.query("INSERT INTO notices (email_id , notice, class) VALUES ($1,$2,$3)", [Email, notice, current_class])
        const noticesResult = await db.query("SELECT notice FROM notices ORDER BY notice ")
        const notices = noticesResult.rows.map(item => item.notice)
        const materialResult = await db.query("SELECT material FROM materials ORDER BY material")
        const materials = materialResult.rows.map(item => item.material)
        res.render('dashboard/teacher-dashboard.ejs', { fullname: FullName, email: Email, phone_no: phone, dob: dateOfbirth, notices: notices, material: materials })
    } catch (error) {
        console.log(error)
    }
})
app.post('/admin-notice', async (req, res) => {
    try {
        const current_class = req.body.class
        const notice = req.body.noticeText
        const FullName = req.body.fullname
        const Email = req.body.email
        const phone = req.body.phone_no
        const dateOfbirth = req.body.dob
        await db.query("INSERT INTO notices (email_id , notice, class) VALUES ($1,$2,$3)", [Email, notice, current_class])
        const noticesResult = await db.query("SELECT notice FROM notices ORDER BY notice ")
        const notices = noticesResult.rows.map(item => item.notice)
        const materialResult = await db.query("SELECT material FROM materials ORDER BY material")
        const materials = materialResult.rows.map(item => item.material)
        res.render('dashboard/admin-dashboard.ejs', { fullname: FullName, email: Email, phone_no: phone, dob: dateOfbirth, notices: notices, material: materials })
    } catch (error) {
        console.log(error)
    }
})
app.post('/admin-material', async (req, res) => {
    try {
        const current_class = req.body.class2
        const material = req.body.materialText
        const FullName = req.body.fullname
        const Email = req.body.email
        const name = req.body.name
        const phone = req.body.phone_no
        const dateOfbirth = req.body.dob
        await db.query("INSERT INTO materials (email_id , material, class,name) VALUES ($1,$2,$3,$4)", [Email, material, current_class,name])
        let materialResult = await db.query("SELECT material FROM materials ORDER BY material")
        materialResult = materialResult.rows.map(item => item.material)
        const noticesResult = await db.query("SELECT notice FROM notices ORDER BY notice ")
        const notices = noticesResult.rows.map(item => item.notice)
        res.render('dashboard/admin-dashboard.ejs', { fullname: FullName, email: Email, phone_no: phone, dob: dateOfbirth, notices: notices, materialResult: materialResult })
    } catch (error) {
        console.log(error)
    }
})
app.post('/teacher-material', async (req, res) => {
    try {
        const current_class = req.body.class2
        const material = req.body.materialText
        const FullName = req.body.fullname
        const Email = req.body.email
        const name = req.body.name
        const phone = req.body.phone_no
        const dateOfbirth = req.body.dob
        await db.query("INSERT INTO materials (email_id , material, class,name) VALUES ($1,$2,$3,$4)", [Email, material, current_class,name])
        let materialResult = await db.query("SELECT material FROM materials ORDER BY material")
        materialResult = materialResult.rows.map(item => item.material)
        const noticesResult = await db.query("SELECT notice FROM notices ORDER BY notice ")
        const notices = noticesResult.rows.map(item => item.notice)
        res.render('dashboard/teacher-dashboard.ejs', { fullname: FullName, email: Email, phone_no: phone, dob: dateOfbirth, notices: notices, materialResult: materialResult })
    } catch (error) {
        console.log(error)
    }
})


app.post('/update-students', async (req, res) => {
    const first_name = req.body.fname
    const last_name = req.body.lname
    const roll_no = req.body.roleNumber
    const email_id = req.body.email
    const phone_no = req.body.phone
    const DOB = req.body.dob
    const current_class = req.body.class
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword
    if (first_name && last_name && roll_no && DOB && current_class && phone_no && password && confirmPassword) {
        const result = await db.query('SELECT * from students where email_id = $1 AND password = $2 OR phone_no = $3 AND password = $4', [email_id, password, phone_no, password])
        if (result.rows.length > 0) {
            try {
                db.query(
                    `UPDATE students SET first_name = $1, last_name = $2, roll_no = $3, email_id = $4, phone_no = $5, dob = $6, class = $7, password = $8 WHERE email_id = $9 AND password = $10 OR phone_no = $11 AND password = $12 OR email_id = $13 AND phone_no = $14`, [first_name, last_name, roll_no, email_id, phone_no, DOB, current_class, password, email_id, password, phone_no, password, email_id, phone_no]
                )

                res.redirect("/");
            } catch (error) {
                console.log(error)
                res.redirect("/student-login")
            }
        } else {
            res.redirect("/student-login")
        }

    }

})
app.post('/update-teachers', async (req, res) => {
    const first_name = req.body.fname
    const last_name = req.body.lname
    const email_id = req.body.email
    const phone_no = req.body.phone
    const DOB = req.body.dob
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword
    if (first_name && last_name && DOB && phone_no && password && confirmPassword) {
        const result = await db.query('SELECT * from teachers where email_id = $1 AND password = $2 OR phone_no = $3 AND password = $4', [email_id, password, phone_no, password])
        if (result.rows.length > 0) {
            try {
                db.query(
                    `UPDATE teachers SET first_name = $1, last_name = $2, email_id = $3, phone_no = $4, dob = $5, password = $6 WHERE email_id = $7 AND password = $8 OR phone_no = $9 AND password = $10 OR email_id = $11 AND phone_no = $12 `, [first_name, last_name, email_id, phone_no, DOB, password, email_id, password, phone_no, password, email_id, phone_no]
                )

                res.redirect("/");
            } catch (error) {
                console.log(error)
                res.redirect("/teacher-login")
            }
        } else {
            res.redirect("/teacher-login")
        }

    }

})
app.post('/update-alumnis', async (req, res) => {
    const first_name = req.body.fname
    const last_name = req.body.lname
    const email_id = req.body.email
    const phone_no = req.body.phone
    const DOB = req.body.dob
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword
    if (first_name && last_name && DOB && phone_no && email_id && password && confirmPassword) {
        const result = await db.query('SELECT * from alumni where email_id = $1 AND password = $2 OR phone_no = $3 AND password = $4', [email_id, password, phone_no, password])
        if (result.rows.length > 0) {
            try {
                db.query(
                    `UPDATE alumni SET first_name = $1, last_name = $2, email_id = $3, phone_no = $4, dob = $5, password = $6 WHERE email_id = $7 AND password = $8 OR phone_no = $9 AND password = $10 OR email_id = $11 AND phone_no = $12 `, [first_name, last_name, email_id, phone_no, DOB, password, email_id, password, phone_no, password, email_id, phone_no]
                )

                res.redirect("/");
            } catch (error) {
                console.log(error)
                res.redirect("/alumni-login")
            }
        } else {
            res.redirect("/alumni-login")
        }

    }

})
app.post('/update-admins', async (req, res) => {
    const first_name = req.body.fname
    const last_name = req.body.lname
    const email_id = req.body.email
    const phone_no = req.body.phone
    const DOB = req.body.dob
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword
    if (first_name && last_name && DOB && phone_no && email_id && password && confirmPassword) {
        const result = await db.query('SELECT * from admin where email_id = $1 AND password = $2 OR phone_no = $3 AND password = $4', [email_id, password, phone_no, password])
        if (result.rows.length > 0) {
            try {
                db.query(
                    `UPDATE admin SET first_name = $1, last_name = $2, email_id = $3, phone_no = $4, dob = $5, password = $6 WHERE email_id = $7 AND password = $8 OR phone_no = $9 AND password = $10 OR email_id = $11 AND phone_no = $12 `, [first_name, last_name, email_id, phone_no, DOB, password, email_id, password, phone_no, password, email_id, phone_no]
                )

                res.redirect("/");
            } catch (error) {
                console.log(error)
                res.redirect("/admin-login")
            }
        } else {
            res.redirect("/admin-login")
        }

    }

})

// App listing On port 
server.listen(process.env.PORT, () => {
    console.log(`Server Started On port ${process.env.PORT}`);
});