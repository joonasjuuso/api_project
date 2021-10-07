READ FOR UNDERSTANDING OF THE API:

 POST ONLY FORM-DATA!!!!

This repository includes our project in which we created an API to handle the following features:
  - Handling registration
  - Handling login
  - Able to search for items
  - Able to search items with path variables for date, category and location
  - Able to post new items (Images do not work for reasons unknown to us.)
  - Able to modify and delete listing
   
   POST ONLY FORM-DATA!!!!

 
The security protocols in use: HTTP basic and JWT:
  - HTTP basic handles the login and signup process and after verifying the credentials, it gives the user the JWT token
  - With the JWT token, the user is able create items and modify or delete them
  - The JWT token can be passed through the Bearer token in the header OR you can decide on not using it, as it is automated through cookies

You can find the tests we created under the test -folder. One file tests the functions in our server and the other the API functionalities

The address for the API: https://item-api-project.herokuapp.com/
  
The OpenAPI documentation can be found here: https://bci-api.stoplight.io/docs/bci-api/YXBpOjIzMjYxNTk4-bci-api (Not in HTML format due to the struggles we face with creating it in the new OpenAPI 3.1 version, which seems to not be supported well
