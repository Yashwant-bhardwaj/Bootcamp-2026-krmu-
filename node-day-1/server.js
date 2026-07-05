/*const math = require("./math");// using file 
console.log(math,"math");
console.log(math.add(2,3),"add");
console.log(math.sub(5,3),"sub");

console.log("backend logic");
*/
const express = require("express");
//console.log(xpress);
const app = express();
//console.log(app);
app.get("/home", (req, res) => {
  //console.log(req);
  res.send("home page");
});
app.get("/about", (req, res) => {
  //console.log(req);
  res.send("about page");
});
app.get("/contact", (req, res) => {
  //console.log(req);
  res.send("contact page");
});
// repond the html code 
app.get("/", (req, res) => {
  
  res.send(`<h1>hello world</h1>`);
});


app.listen(3000, () => {
  console.log("server is running on port 3000");
})
