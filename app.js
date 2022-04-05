const { notDeepEqual } = require("assert");
const express = require("express");
const { json } = require("express/lib/response");
const app = express();

const fs = require("fs");
const { format } = require("path");

app.set("view engine", "pug");

app.use("/static", express.static("public"));

app.use(express.urlencoded({ extended: false }));

// localhost:5000
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/create", (req, res) => {
  res.render("create");
});

//Create method function
app.post("/create", (req, res) => {
  const FullName = req.body.FullName;
  const Email = req.body.Email;
  const PhoneNumber = req.body.PhoneNumber;
  const Address = req.body.Address;

  if (
    FullName.trim() === "" &&
    Email.trim() === "" &&
    PhoneNumber.trim() === "" &&
    Address.trim() === ""
  ) {
    res.render("create", { error: true });
  } else if (isNaN(PhoneNumber)) {
    res.render("create", { phoneError: true });
  } else if (!Email.includes("@")) {
    res.render("create", { emailError: true });
  } else {
    fs.readFile("./data/profiles.json", (err, data) => {
      if (err) throw err;

      const profiles = JSON.parse(data);
      profiles.push({
        id: id(),
        FullName: FullName,
        Email: Email,
        PhoneNumber: PhoneNumber,
        Address: Address,
      });

      fs.writeFile("./data/profiles.json", JSON.stringify(profiles), (err) => {
        if (err) throw err;

        res.render("create", { success: true });
      });
    });
  }
});

// Get method function
app.get("/api/v1/profiles", (req, res) => {
  fs.readFile("./data/profiles.json", (err, data) => {
    if (err) throw err;

    const profiles = JSON.parse(data);

    res.json(profiles);
  });
});
//
app.get("/profiles", (req, res) => {
  fs.readFile("./data/profiles.json", (err, data) => {
    if (err) throw err;

    const profiles = JSON.parse(data);

    res.render("profiles", { profiles: profiles });
  });
});
//

app.get("/profiles/:id", (req, res) => {
  const id = req.params.id;

  fs.readFile("./data/profiles.json", (err, data) => {
    if (err) throw err;

    const profiles = JSON.parse(data);

    const profile = profiles.find((profile) => profile.id == id);

    res.render("detail", {
      FullName: profile.FullName,
      Email: profile.Email,
      PhoneNumber: profile.PhoneNumber,
      Address: profile.Address,
    });
  });
});
//

//Delete method function
app.post("/profiles/delete/:id", (req, res) => {
  const id = req.params.id;

  fs.readFile("./data/profiles.json", (err, data) => {
    if (err) throw err;

    const profiles = JSON.parse(data);

    const newprofiles = profiles.filter((profile) => profile.id !== id);

    res.redirect("/profiles");

    fs.writeFile("./data/profiles.json", JSON.stringify(newprofiles), (err) => {
      if (err) throw err;

      res.render("create", { success: true });
    });
  });
});
// Edit(Update) method function
app.post("/profiles/edit/:id", (req, res) => {
  const id = req.params.id;

  fs.readFile("./data/profiles.json", (err, data) => {
    if (err) throw err;

    const profiles = JSON.parse(data);

    const profileToUpdate = profiles.find((profile) => profile.id === id);

    console.log(profileToUpdate);

    res.render("update", { profile: profileToUpdate });
  });
});

app.post("/profiles/update/:id", (req, res) => {
  const id = req.params.id;

  fs.readFile("./data/profiles.json", (err, data) => {
    if (err) throw err;

    const profiles = JSON.parse(data);

    const profileToUpdate = profiles.find((profile) => profile.id === id);

    profileToUpdate.FullName = req.body.FullName;

    profileToUpdate.Email = req.body.Email;
    profileToUpdate.PhoneNumber = req.body.PhoneNumber;
    profileToUpdate.Address = req.body.Address;

    fs.writeFile("./data/profiles.json", JSON.stringify(profiles), (err) => {
      if (err) throw err;

      res.redirect("/profiles");
    });
  });
});

app.listen(5000, (err) => {
  if (err) console.log(err);

  console.log("server is running on port 5000...");
});

function id() {
  return "_" + Math.random().toString(36).substr(2, 9);
}
