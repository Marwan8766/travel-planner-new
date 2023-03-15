const Agenda = require("agenda");
const blackListTokenModel = require("../models/blackListToken.model");

// Initialize the Agenda library
const agenda = new Agenda({
  db: { address: process.env.DATABASE },
});

// Define a task to remove the expired tokens
agenda.define("remove expired tokens", async (job, done) => {
  try {
    // Calculate the current timestamp
    const now = Date.now();

    // Remove all expired tokens from the blacklist collection
    const result = await blackListTokenModel.deleteMany({
      expiresAt: { $lt: now },
    });

    // If there is any error or the result is empty, throw an error
    if (result.deletedCount === 0) {
      throw new Error("No expired tokens found");
    }

    // If everything goes well, call the done function to indicate the task is finished
    done();
  } catch (error) {
    // If there is an error, call the done function with the error
    console.log(error);
    done(error);
  }
});

// Start the Agenda instance when it's ready
agenda.on("ready", () => {
  // Schedule the task to run every day at 4:00 AM
  agenda.every("0 4 * * *", "remove expired tokens");
  agenda.start();
});
