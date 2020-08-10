### ODINBOOK (Fakebook)

This app is the final project of [the Odin Project](https://www.theodinproject.com/)'s Node.js curriculum. It has the basic functionalities of a social media website and is built for educational purposes only.

The code includes [Passport](http://www.passportjs.org/) authentication with the Local strategy. It also has fully functional code behind the Facebook strategy (works on a local server) but it is currently not implemented due to Facebook's requirement to include Terms and Conditions as well as Privacy Policy on a page to allow logging in with Facebook credentials.
The database is populated with accounts created with my seeds.js file using the [Faker](https://www.npmjs.com/package/faker) module.
I use [mongoDB](https://www.mongodb.com/) as a database with [Mongoose](https://mongoosejs.com/) object modeling. For my image database I use [Cloudinary](cloudinary.com).

Thanks to the use of more advanced queries than in previous projects, it's not necessary to delete all dependent items before deleting a model instance. E.g., you can delete your account and all your posts, comments, and friendship connections will automatically also be gone.

The live version of the app is deployed on Heroku and is available **[HERE](https://odinbook-kikupiku.herokuapp.com/)**.

![gif on the project in action](https://res.cloudinary.com/kikupiku/image/upload/v1597065129/project-gifs/odinbook_coepbo.gif)