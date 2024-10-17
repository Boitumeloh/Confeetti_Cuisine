const mongoose = require("mongoose");
const { Schema } = mongoose;
const Subscriber = require("./subscriber");
const bcrypt = require("bcrypt");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema(
    {
      name: {
        first: {
          type: String,
          trim: true,
        },
        last: {
          type: String,
          trim: true,
        },
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      zipCode: {
        type: Number,
        min: [10000, "Zip code too short"],
        max: 99999,
      },
      password: {
        type: String,
        required: true,
      },
      courses: [
        {
          type: Schema.Types.ObjectId,
          ref: "Course",
        },
      ],
      subscribedAccount: {
        type: Schema.Types.ObjectId,
        ref: "Subscriber",
      },
    },
    {
      timestamps: true,
    }
);

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.name.first} ${this.name.last}`;
});

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  const user = this;

  // Hash the password only if it is new or modified
  if (user.isModified("password")) {
    try {
      const hash = await bcrypt.hash(user.password, 10);
      user.password = hash;
    } catch (error) {
      console.log(`Error in hashing password: ${error.message}`);
      return next(error);
    }
  }

  // Check for subscriber account
  if (!user.subscribedAccount) {
    try {
      const subscriber = await Subscriber.findOne({ email: user.email });
      if (subscriber) {
        user.subscribedAccount = subscriber._id; // Assigning ObjectId of the found subscriber
      }
    } catch (error) {
      console.log(`Error in connecting subscriber: ${error.message}`);
      return next(error);
    }
  }
  
  next();
});

// Method for password comparison
userSchema.methods.passwordComparison = function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

// Adding passport-local-mongoose as a plugin
userSchema.plugin(passportLocalMongoose, { usernameField: "email" });

module.exports = mongoose.model("User", userSchema);
