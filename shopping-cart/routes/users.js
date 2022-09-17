var express = require("express");
const Cart = require("../models/Cart");

var router = express.Router();
var Users = require("../models/Users");
/* GET users listing. */

router.get('/cartItems',(req,res,next) => {
  Users.findById(req.user.id).populate('cartItems').exec((err,user) => {
    if(err) return next(err);
    if(user.cartItems && user.cartItems.listItems.length>0){
      Cart.findById(user.cartItems._id).populate('listItems').exec((err,result) => {
        if(err) return next(err);
        console.log(result);
        return res.render('listItem',{data:result.listItems});
      })
    }else{
      req.flash('empty-cart-msg','no items found in cart !!!')
      return res.redirect('/dashboard');
    }
  })
})

module.exports = router;