const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require("lodash");

const app =  express();

// let items = ["Buy Food","Cook Food","Eat Food"];
// let workItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-priyank:pri1234@cluster0.eaitrh9.mongodb.net/todolistdb", {useNewUrlParser: true});

const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item",itemsSchema);


const item1 = new  Item({
  name: "Welcome to your todolist!"
});

const item2 = new  Item({
  name: "Hit the + button to aff a new item."
});

const item3 = new  Item({
  name: "<-- hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res){
//  res.send("hello");

var today =new Date();


var options = {
  weekday: "long",
  day:"numeric",
  month: "long",

};

var day = today.toLocaleDateString("en-US", options);

Item.find({}, function(err, foundItems){

if(foundItems.length ===0){
  Item.insertMany(defaultItems, function(err){
    if(err){
      console.log(err);
    }else{
      console.log("successfully saved default items to DB.");
    }
  });
  res.redirect("/");
}else{
  res.render("list", {listTitle: "Today", newListItems: foundItems});
}


});



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  } else {

    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    });
  }
});

  // let item = req.body.newItem;
  // if(req.body.list === "work"){
  //   workItems.push(item);
  //   res.redirect("/work");
  // }else{
  //   items.push(item);
  //
  //   res.redirect("/");
  // }



app.post("/delete", function(req,res){
const checkedItemId = req.body.checkbox;
const listName = req.body.listName;

if(listName === "Today") {
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(!err){
      console.log("successfully deleted");
      res.redirect("/");
    }
  });
} else {
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
    if(!err){
      res.redirect("/"+listName);
    }
  });
}



});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
        if(!foundList){
          const list = new List({
            name: customListName,
            items: defaultItems
          });
          list.save();
          res.redirect("/"+ customListName);
    }else{
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  }
});

});

app.get("/work", function(req, res){
  res.render("list", {listTitle: "work List", newListItems: workItems});
});

app.post("/work", function(req,res){
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work")
});
app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
  console.log("server started successfully ");
});
