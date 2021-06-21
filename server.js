const express = require("express");
const path = require("path");

const app = express();

app.use("/static", express.static(path.resolve(__dirname, "client","static")));
app.use("/icon", express.static(path.resolve(__dirname, "client","icon")));

app.get("/manifest.json",(req,res)=>{
    res.sendFile(path.resolve(__dirname, "client","manifest.json"))
})

app.get("/serviceworker.js", (req,res)=>{
    res.sendFile(path.resolve(__dirname, "client","serviceworker.js"))
})

app.get("/index.html",(req,res)=>{
    res.sendFile(path.resolve(__dirname, "client","index.html"))
})

app.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "index.html"));
});



app.listen(3000, () => console.log("Server running..."));