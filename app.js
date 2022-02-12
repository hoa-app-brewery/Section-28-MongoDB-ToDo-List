//

const express = require(`express`);
const app = express();
const mongoose = require(`mongoose`);
const _ = require(`lodash`);

app.set(`view engine`, `ejs`);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(`public`));

//
mongoose.connect(
	"mongodb+srv://admin-hoa:testpw321@cluster0.fxogn.mongodb.net/todolistDB",
	{
		useNewUrlParser: true,
	}
);

const itemsSchema = new mongoose.Schema({
	name: String,
});
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
	name: "Welcome to your todolist!",
});
const item2 = new Item({
	name: "Click the + button to add a new item.",
});
const item3 = new Item({
	name: "<-- Click this to delete an item.",
});
const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
	name: String,
	items: [itemsSchema],
});

const List = mongoose.model("List", listSchema);

//
app.get(`/`, function (req, res) {
	Item.find({}, function (err, items) {
		if (items.length === 0) {
			Item.insertMany(defaultItems, function (err) {
				if (err) {
					console.log(err);
				} else {
					console.log("Successfully added the items!");
				}
			});
			res.redirect(`/`);
		} else {
			res.render(`list`, { listTitle: `Today`, newListItems: items });
		}
	});
});

app.post(`/`, function (req, res) {
	const itemName = req.body.newItem;
	const listName = req.body.list;

	const item = new Item({
		name: itemName,
	});

	if (listName === "Today") {
		item.save();
		res.redirect(`/`);
	} else {
		List.findOne({ name: listName }, function (err, foundList) {
			foundList.items.push(item);
			foundList.save();
			res.redirect(`/${listName}`);
		});
	}

	// let userInput = req.body.newItem;
	// console.log(req.body.list);
	// if (req.body.list === `Work`) {
	// 	workItems.push(userInput);
	// 	res.redirect(`/work`);
	// } else {
	// 	items.push(userInput);
	// 	res.redirect(`/`);
	// }
});

app.post(`/delete`, function (req, res) {
	//console.log(req.body.checkbox);
	const checkedItemId = req.body.checkbox;
	const listName = req.body.dlistName;

	if (listName === `Today`) {
		Item.findByIdAndRemove(checkedItemId, function (err) {
			if (err) {
				console.log(err);
			} else {
				console.log("Successfully removed item!");
				res.redirect(`/`);
			}
		});
	} else {
		List.findOneAndUpdate(
			{ name: listName },
			{ $pull: { items: { _id: checkedItemId } } },
			function (err, foundList) {
				if (!err) {
					res.redirect(`/${listName}`);
				}
			}
		);
	}
});

app.get(`/:customListName`, function (req, res) {
	//console.log(req.params.customListName);
	const listName = _.capitalize(req.params.customListName);

	List.findOne({ name: listName }, function (err, foundList) {
		if (!err) {
			if (!foundList) {
				//console.log(`List not found!`);
				//Creates a new list.
				const list = new List({
					name: listName,
					items: defaultItems,
				});
				list.save();
				res.redirect(`/${listName}`);
			} else {
				//console.log(`List was found!`);
				//Shows an existing list.
				res.render(`list`, {
					listTitle: foundList.name,
					newListItems: foundList.items,
				});
			}
		}
	});
});

// app.get(`/work`, function (req, res) {
// 	res.render(`list`, { listTitle: `Work List`, newListItems: workItems });
// });

app.get(`/about`, function (req, res) {
	res.render(`about`);
});

app.post(`/work`, function (req, res) {
	let item = req.body.newItem;
	workItems.push(item);
	res.redirect(`/work`);
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function (req, res) {
	console.log(`App running on port: ${port}`);
});

// Scope in JavaScript
// https://www.digitalocean.com/community/tutorials/understanding-scope-in-javascript
