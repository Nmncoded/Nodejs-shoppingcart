var express = require("express");
// const { render } = require("../app");
var router = express.Router();
var Items = require("../models/Items");
var Cart = require("../models/Cart");
const Users = require("../models/Users");

// router.get("/", (req, res, next) => {
//   var session = req.session.userId;
//   Items.find({}, (err, content) => {
//     if (err) return next(err);
//     res.render("listItem", { data: content, session });
//   });
// });

// router.get("/:id/list", (req, res, next) => {
//   var id = req.params.id;
//   Items.findById({ adminId: id }, (err, content) => {
//     if (err) return next(err);
//     res.render("listOfAdminProduct", { data: content });
//   });
// });

router.get("/:id/detail", (req, res, next) => {
  Items.findById(req.params.id)
    .populate("adminId")
    .exec((err, item) => {
      res.render("singleItem", { data: item, isAdmin : req.user.isAdmin, user: req.user });
    });
});

router.get("/:id/likes", (req, res, render) => {
  // var id = req.session.userId;
  // Items.findById(req.params.id, (err, content) => {
  //   if (err) return next(err);
  //   if (!req.session.userId) {
  //     return res.redirect("/users/login");
  //   }
  //   if (content.likes.includes(id)) {
  //     content.likes.pull(id);
  //   } else {
  //     content.likes.push(id);
  //   }
  //   Items.findByIdAndUpdate(
  //     req.params.id,
  //     { likes: content.likes },
  //     (err, updateContent) => {
  //       if (err) return next(err);
  //       res.redirect("/items/" + req.params.id + "/detail");
  //     }
  //   );
  // });
  var id = req.params.id;
  Items.findById(id,(err,item) => {
    if(err) return next(err);
    if(item.likes.length<1 || !item.likes.some(like => like.equals(req.user.id) ) ){
      Items.findByIdAndUpdate(id,{$push:{likes : req.user.id }},{new:true},(err,result) => {
        if (err) return next(err);
        // console.log(result);
        return res.redirect("/items/" + id + '/detail' );
      })
    }else{
      Items.findByIdAndUpdate(id,{$pull:{likes : req.user.id }},{new:true},(err,result) => {
        if (err) return next(err);
        return res.redirect("/items/" + id + '/detail' );
      })
    }
  })
});

router.get("/:id/edit", (req, res, next) => {
  Items.findById(req.params.id)
    .populate("adminId")
    .exec((err, item) => {
      if(err) return next(err);
      return res.render("editItem", { data: item });
      // if (item.adminId.id === req.session.userId) {
      // } else {
      //   res.redirect("/users/login");
      // }
    });
});

router.post("/:id", (req, res, next) => {
  Items.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
    (err, content) => {
      if (err) return next(err);
      res.redirect("/items/" + req.params.id + "/detail");
    }
  );
});

router.get("/:id/delete", (req, res, next) => {
  Items.findByIdAndDelete(req.params.id,(err,result) => {
    if(err) return next(err);
    // console.log(result);
    Users.findByIdAndUpdate(
			result.adminId,
			{ $pull : { products : result._id } },
			{ new: true },
			(err, updateuser) => {
				if (err) return next(err);
        // console.log(updateuser);
        Cart.findOneAndUpdate({userId:result.adminId},{ $pull : { listItems : req.params.id } },(err,updatedCart) => {
          if(err) return next(err);
          return res.redirect("/dashboard");
        })
			}
		);
  })
  // Items.findById(req.params.id)
  //   .populate("adminId")
  //   .exec((err, item) => {
  //     if (item.adminId.id === req.session.userId) {
  //       Items.findByIdAndDelete(req.params.id, (err, content) => {
  //         res.redirect("/admin/" + item.adminId.id + "/dasboardAdmin");
  //       });
  //     } else {
  //       res.redirect("/users/login");
  //     }
  //   });
});

// add-to-cart
router.get('/:id/cart',(req, res, next) => {
  let obj = {
    userId : req.user.id,
    listItems : [req.params.id]
  }
  Cart.findOne({userId:req.user.id},(err,found) => {
    if(err) return next(err);
    if(found){
      Cart.findByIdAndUpdate(found.id,{$push:{listItems:req.params.id}},(err,updatedCart) => {
      if(err) return next(err);
      return res.redirect("/items/" + req.params.id + "/detail");
      })
    }else{
      Cart.create(obj,(err,result) => {
        if(err) return next(err);
          Users.findByIdAndUpdate(
            req.user.id,
            { cartItems : result.id } ,
            { new: true },
            (err, updateuser) => {
              if (err) return next(err);
              return res.redirect("/items/" + req.params.id + "/detail");
            }
          );
      })
    }
  })
});

// router.get("/:id/cart", (req, res, next) => {
//   var sessionId = req.session.userId;
//   Cart.findOne({ userId: sessionId }, (err, content) => {
//     console.log(content);
//     if (err) return next(err);
//     if (content === null) {
//       req.body.userId = req.session.userId;
//       req.body.listItems = [req.params.id];
//       Cart.create(req.body, (err, createContent) => {
//         if (err) return next(err);
//         console.log(createContent, "undefine");
//         res.redirect("/items");
//       });
//     } else {
//       if (content.listItems.includes(req.params.id)) {
//         console.log("alredy includes");
//         res.redirect("/items");
//       } else {
//         Cart.findOneAndUpdate(
//           { userId: sessionId },
//           { $push: { listItems: req.params.id } },
//           { new: true },
//           (err, content) => {
//             if (err) next(err);
//             res.redirect("/items");
//           }
//         );
//       }
//     }
//   });
// });

// router.get("/carts", (req, res, next) => {
//   Cart.findOne({ userId: req.session.userId })
//     .populate("listItems")
//     .exec((err, items) => {
//       console.log(items);
//       if (err) return next(err);
//       if (items) {
//         return res.render("listcarts", { data: items.listItems });
//       } else {
//         return res.redirect("/items");
//       }
//     });
// });

module.exports = router;