const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const methodOverride = require('method-override')

const app = express();
const port = 3005;


app.use(bodyParser.json());
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout extractScripts', true)
app.set('layout extractStyles', true)


app.use(expressLayouts);


// Simulated user for demonstration purposes
const hardcodedUser = {
    email: "Ojuruchinwa111@gmail.com",
    passwordHash: "Chinwa111"
};

const addtracker = {
  sendername: String,
  receivername: String,
  TrackingNum: Number,
  ShipmentType: String,
  parcelcontent: String,
  shippedDate: Date,
  expecteddeliverydate: Date,
  sourcecity: String,
  sourceState: String,
  sourceCountry: String,
  currentCity: String,
  currentState: String,
  currentCountry: String,
  destinationCity: String,
  destinationState: String,
  destinationCountry: String,
  sendercontactnumber: Number,
  recievercontactnumber: Number,
  parcelstatus: String
}

const AddNewTracker = mongoose.model("AddTracker", addtracker)

function comparePassword(raw, hash) {
    return bcrypt.compareSync(raw, hash);
}

function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
      // User is authenticated
      next();
    } else {
      // User is not authenticated; redirect to the login page or return an unauthorized response
      res.redirect('/login');
    }
  }

mongoose
    .connect('mongodb+srv://richynaomi30:Required1234@cluster0.uewqabx.mongodb.net/tester', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log(`Connected to DB`))
    .catch((err) => console.error(err));

app.use(methodOverride(function (req, res) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
          // look in urlencoded POST bodies and delete it
          var method = req.body._method
          delete req.body._method
          return method
        }
      }))

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

app.post("/dashboard", async (req, res) => {
    const { email, password } = req.body;

    try {
        const parcelData = await AddNewTracker.find();
        if (!email || !password) {
            return res.status(400).json({ error: "Your credentials are not valid" });
        }

        if (email !== hardcodedUser.email) {
            return res.status(404).json({ error: "User not found" });
        }

        const isValid = hardcodedUser.passwordHash;

        if (isValid) {
            console.log('Authenticated Successfully');
            res.render("dashboard", { parcelData}); // Render the "dashboard.ejs" template
        } else {
            console.log('Invalid Authentication');
            return res.status(401).json({ error: "wrong password" });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "An error occurred" });
    }
});

app.get("/dashboard", async (req, res) => {
    try {
        // Fetch parcelData from your database or source
        const parcelData = await AddNewTracker.find(); // Assuming you have a function to fetch parcel data

        // Render the EJS template and pass parcelData to it
        res.render("dashboard", { parcelData}); // Assuming your EJS file is named "dashboard.ejs"
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred" });
    }
});

app.get("/add-tracking.html", async(req, res) =>{
    res.sendFile(__dirname + "/public/admin/add-tracking.html");
})

app.post("/addtracker", async(req, res) => {
    let NewTracker = new AddNewTracker({
        sendername: req.body.sendername,
        receivername: req.body.receivername,
        TrackingNum: req.body.tracknum,
        ShipmentType: req.body.shipmentType,
        parcelcontent: req.body.parcelcontent,
        shippedDate: req.body.shippeddate,
        expecteddeliverydate: req.body.expecteddeliverydate,
        sourcecity: req.body.sourcecity,
        sourceState: req.body.sourcestate,
        sourceCountry: req.body.sourcecountry,
        currentCity: req.body.currentcity,
        currentState: req.body.currentstate,
        currentCountry: req.body.currentzip,
        destinationCity: req.body.destinationstatecity,
        destinationState: req.body.destinationstate,
        destinationCountry: req.body.destinationcountry,
        sendercontactnumber: req.body.sendercontactnumber,
        recievercontactnumber: req.body.recievercontactnumber,
        parcelstatus: req.body.Parcelstatus

    })
    NewTracker.save()
    try {
        console.log('Tracker added successfully');
        res.redirect("dashboard");
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "An error occurred" });
    }
})


app.post("/trackingnumfind", async (req, res) => {
    // Get the tracking number from the form data
    const trackingNumber = req.body.trackingNumber;

    try {
        // Fetch the tracking details from the database based on the tracking number
        const shipmentDetails = await AddNewTracker.findOne({ TrackingNum: trackingNumber });

        if (shipmentDetails) {
            res.redirect(`/tracking-details?trackingNumber=${shipmentDetails.TrackingNum}`);
        } else {
            res.status(404).send("The tracking number is not found.");
        }
    } catch (error) {

    }
});

app.get("/tracking-details", async (req, res) => {
    const trackingNumber = req.query.trackingNumber; // Get the tracking number from the query parameter

    try {
        // Fetch the tracking details from the database based on the tracking number
        const parcelData = await AddNewTracker.find({ TrackingNum: trackingNumber });

        if (!parcelData || parcelData.length === 0) {
            // Handle the case when no parcel data is found
            return res.status(404).send("No parcel data found.");
        }

        // Send the fetched parcel data as JSON response
        res.render('tracking-details', { parcelData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred" });
    }
});

app.get("/editt/:id", async (req, res) => {
    try {
        // Fetch the item with the given ID from the database
        const parcelData = await AddNewTracker.findById({_id: req.params.id});

        if (!parcelData) {
            // If the item was not found, respond with an error.
            return res.status(404).json({ error: "Item not found" });
        }
        console.log(parcelData);
        // Render the edit page and pass the fetched parcelData to it
        res.render("edit", { parcelData});
    } catch (error) {
        // If an error occurs during the fetch operation, respond with an error.
        console.error("Error fetching item for edit:", error);
        res.status(500).json({ error: "An error occurred while fetching the item for edit" });
    }
});

// Update route for editing a specific parcel by ID
app.put("/parcels/:id", async (req, res) => {

    try {
        // Fetch the parcel with the given ID from the database
        let parcelData = await AddNewTracker.findById(req.params.id)
        .lean();

        if (!parcelData) {
            // If the parcel was not found, respond with an error.
            return res.status(404).json({ error: "Parcel not found" });
        }

        // Update the parcelData object with the edited values from the form


        // Save the updated parcelData object back to the database
        parcelData = await AddNewTracker.findOneAndUpdate( {_id: req.params.id}, req.body, {
            new: true,
            runValidators: true
        } )

        // Redirect to the dashboard or another appropriate page after editing
        res.redirect('/dashboard');
    } catch (error) {
        // If an error occurs during the edit operation, respond with an error.
        console.error("Error editing parcel:", error);
        res.status(500).json({ error: "An error occurred while editing the parcel" });
    }
});




app.get("/delete/:id", async (req, res) => {
    const itemId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
        // If the provided item ID is not a valid MongoDB ObjectID, respond with an error.
        return res.status(400).json({ error: "Invalid item ID" });
    }

    try {
        // Attempt to find and delete the item with the given ID
        const deletedItem = await AddNewTracker.findByIdAndDelete(itemId);

        if (!deletedItem) {
            // If the item was not found, respond with an error.
            return res.status(404).json({ error: "Item not found" });
        }

        // If the item was successfully deleted, respond with a success message.
        res.redirect('/dashboard');
    } catch (error) {
        // If an error occurs during the delete operation, respond with an error.
        console.error("Error deleting item:", error);
        res.status(500).json({ error: "An error occurred while deleting the item" });
    }
});






  app.listen(3000, () => {
    console.log("Express server listening on port 3000.");
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
