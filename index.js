const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();
const port = 3005;

app.use(bodyParser.json());
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Simulated user for demonstration purposes
const hardcodedUser = {
    email: "ojuruchinwa111@gmail.com",
    passwordHash: "Chinwa111"
};

const addtracker = {
  Firstname: String,
  Lastname: String,
  TrackingNum: Number,
  ShipmentType: String,
  parcelcontent: String,
  shippedDate: Date,
  expired_delivery_date: Date,
  sourcecity: String,
  sourceState: String,
  sourceCountry: String,
  currentCity: String,
  currentState: String,
  currentCountry: String,
  destinationCity: String,
  destinationState: String,
  destinationCountry: String,
  contactnumber: Number,
  parcelstatus: String
}

const AddNewTracker = mongoose.model("AddTracker", addtracker)

function comparePassword(raw, hash) {
    return bcrypt.compareSync(raw, hash);
}

mongoose
    .connect('mongodb+srv://favour:favoursu@cluster0.1i4m3zl.mongodb.net/test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log(`Connected to DB`))
    .catch((err) => console.error(err));

app.use('/', express.static(__dirname + '/public'));

app.get('/admin', async (req, res) => {
    res.sendFile(__dirname + "/public/admin/index.html");
});

app.get("/getParcelData", async (req, res) => {
    try {
        const parcelData = await AddNewTracker.find();
        res.json(parcelData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred" });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ error: "Your credentials are not valid" });
        }

        if (email !== hardcodedUser.email) {
            return res.status(404).json({ error: "User not found" });
        }

        const isValid = hardcodedUser.passwordHash;

        if (isValid) {
            console.log('Authenticated Successfully');
            res.sendFile(__dirname + "/public/admin/dashboard.html");
        } else {
            console.log('Invalid Authentication');
            return res.status(401).json({ error: "wrong password" });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "An error occurred" });
    }
});

app.get("/add-tracking.html", async(req, res) =>{
    res.sendFile(__dirname + "/public/admin/add-tracking.html");
})

app.post("/addtracker", async(req, res) => {
    let NewTracker = new AddNewTracker({
        Firstname: req.body.firstname,
        Lastname: req.body.lastname,
        TrackingNum: req.body.tracknum,
        ShipmentType: req.body.shipmentType,
        parcelcontent: req.body.parcelcontent,
        shippedDate: req.body.shippeddate,
        expired_delivery_date: req.body.exipreddate,
        sourcecity: req.body.sourcecity,
        sourceState: req.body.sourcestate,
        sourceCountry: req.body.sourcecountry,
        currentCity: req.body.currentcity,
        currentState: req.body.currentstate,
        currentCountry: req.body.currentzip,
        destinationCity: req.body.destinationstatecity,
        destinationState: req.body.destinationstate,
        destinationCountry: req.body.destinationcountry,
        contactnumber: req.body.contactnumber,
        parcelstatus: req.body.Parcelstatus

    })
    NewTracker.save()
    try {
        console.log('Tracker added successfully');
        res.sendFile(__dirname + "/public/admin/dashboard.html");
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "An error occurred" });
    }
})

app.get("/searchShipment", async (req, res) => {
    const trackingNumber = req.query.trackingNumber;

    try {
        const shipment = await AddNewTracker.findOne({ TrackingNum: trackingNumber });
        if (shipment) {
            res.sendFile(__dirname + "/public/admin/dashboard.html");
        }else{
            return res.status(404).json({ error: "Shipment not found" });
        }

        res.json(shipment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
});


app.get("/", (req, res) => {
    res.set({
        "Access-Control-Allow-Origin": '*'
    });

    return res.redirect('index.html');
});


app.get('/logout', (req, res) => {
    // Perform any necessary session cleanup or token invalidation here
    // For demonstration purposes, I'm assuming you're using a session-based approach
    // Clear the simulated user session
    hardcodedUser.isLoggedIn = false;

    console.log('Logged out');
    res.redirect('/admin'); // Redirect to the login page or some other appropriate page
});
app.listen(port, () => {
    console.log(`Listening on PORT ${port}`);
});
