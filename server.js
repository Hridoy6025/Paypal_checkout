const express = require("express");
const paypal = require("paypal-rest-sdk");
paypal.configure({
  mode: "sandbox",
  client_id:
    "AdjrUm39HifNNUVHI0YWx0m0UBLkM_PdFRKXg4w8A0HSjaNGwMoLr1O0W4_wjYP2XkVe3ghHK4OmPlto",
  client_secret:
    "EO75hBNqzMuvv5KHLDfvkWvz6LUNgFFAXD32RBfCwrZKQuQxXtzI9C4VcEMgaVExcFmOYtghPsr1rK1b",
});

const port = process.env.PORT || 3000;
const app = express();

app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

app.post("/pay", (req, res) => {
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Red Sox Hat",
              sku: "001",
              price: "5.00",
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: "5.00",
        },
        description: "Hat for the best tem for ever",
      },
    ],
  };
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

app.get("/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "5.00",
        },
      },
    ],
  };

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        console.log(JSON.stringify(payment));
        res.send("Success");
      }
    }
  );
});

app.get("/cancel", (req, res) => res.send("Cancelled"));

app.listen(port, (req, res) => {
  console.log(`server is running at http://localhost:${port}`);
});
