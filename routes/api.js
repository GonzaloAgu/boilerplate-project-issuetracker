"use strict";

const mongoose = require("mongoose");

// Mongo connecting
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MY_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const issueSchema = new mongoose.Schema({
  project: String,
  issue_title: String,
  issue_text: String,
  created_by: String,
  assigned_to: String,
  status_text: String,
  created_on: Date,
  updated_on: Date,
  open: Boolean,
});

const Issue = new mongoose.model("Issue", issueSchema);

module.exports = function (app) {
  app
    .route("/api/issues/:project")
    .get(async (req, res) => {
      let project = req.params.project;
      const filters = { project, ...req.query };
      let issues = await Issue.find(filters);
      delete issues.project;
      res.json(issues);
    })

    .post((req, res) => {
      let project = req.params.project;

      // insert to the database
      let issue = new Issue({
        project,
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || "",
        status_text: req.body.status_text || "",
        created_on: new Date(),
        updated_on: new Date(),
        open: true,
      });
      if (req.body.issue_title && req.body.issue_text && req.body.created_by) {
        console.log("Saving new issue in project " + project);
        issue.save();
        res.json(issue);
      } else {
        res.json({ error: "required field(s) missing" });
      }
    })

    .put((req, res) => {
      if (!req.body._id) {
        res.json({ error: "missing _id" });
 
      } else if (
              !req.body.issue_title &&
              !req.body.issue_text &&
              !req.body.created_by &&
              !req.body.assigned_to &&
              !req.body.status_text
            ) {
              console.log('Error: No fields sent to update. _id: ', req.body._id);
              res.json({ error: "no update field(s) sent", _id: req.body._id });
              return;
            } else {
        // preparing object with valid data to update
        let update = {};
        for (let [key, value] of Object.entries(req.body)) {
          if (value) update[key] = value;
        }
        update.updated_on = new Date();

        Issue.findByIdAndUpdate(req.body._id, update)
          .then((doc) => {
            //console.log("line 73:", doc);
            if (!doc) {
              console.log('Error: Document not found. _id: ', req.body._id);
              res.json({ error: "could not update", _id: req.body._id });
              return
            } else {
              res.json({ result: "successfully updated", _id: req.body._id });
              return
            }
          })
          .catch((err) => {
            if (err) {
              console.log("Couldn't find _id:", req.body._id);
              res.json({ error: "could not update", _id: req.body._id });
            }
          });
      }
    })

    .delete(function (req, res) {
      let project = req.params.project;
      if (!req.body._id) {
        res.json({ error: "missing _id" });
      } else {
        Issue.findByIdAndRemove(req.body._id)
          .then((d) => {
            if (d) {
              console.log("Issue deleted successfully in project ", project);
              res.json({ result: "successfully deleted", _id: req.body._id });
            } else {
              res.json({ error: "could not delete", _id: req.body._id });
            }
          })
          .catch(() => {
            res.json({ error: "could not delete", _id: req.body._id });
          });
      }
    });
};
