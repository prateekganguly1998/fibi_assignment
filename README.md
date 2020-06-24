# fibi_assignment
Assignment for approval

GET IMAGE: localhost:3000/getImage?nameString=image1&page=1&limit=1
POST IMAGE : localhost:3000/addImage 
          body can be both json or form data
          1. For external URL:
          {
          "imageUrl":"https://image.shutterstock.com/image-photo/waves-on-seashore-sunset-260nw-1501833791.jpg",
          "name":"image1"
          }
          2. For local file:
          form file field :
             image


Run by follwing these steps:
cd into the project folder
in terminal run : npm install
then run : npm start
