const express = require("express");
const cors = require("cors");
const axios = require("axios");
const router = express.Router();

// Get base URL and default API key from environment variables
const BASE_URL = process.env.BASE_URL || "https://eplffc.et";
const DEFAULT_ARIFPAY_KEY = process.env.DEFAULT_ARIFPAY_KEY || "GtzNUYg9vislc0DyYdPZlN1KjeoK4Gtj";

router.post("/", async (req, res) => {
  try {
    console.log('Received payment request:', JSON.stringify(req.body, null, 2));
    
    const {
      cancelUrl = "https://example.com",
      phone,
      email = "default@coalition.com",
      nonce = Date.now().toString(),
      errorUrl = "http://error.com",
      notifyUrl = "https://example.com",
      successUrl = "http://example.com",
      apikey,
      paymentMethods = [
        "TELEBIRR", "AWASH", "AWASH_WALLET", "PSS", "CBE",
        "AMOLE", "BOA", "KACHA", "TELEBIRR_USSD", "HELLOCASH", "MPESSA"
      ],
      expireDate = new Date(Date.now() + 30 * 60 * 1000).toISOString(), // expires in 30 mins
      items = [],
      beneficiaries = [],
      lang = "EN"
    } = req.body;

    // Basic validation (adjust as needed)
    if (!phone || items.length === 0 || beneficiaries.length === 0 || !apikey) {
      console.log('Validation failed - missing fields:', {
        phone: !!phone,
        email: !!email,
        items: items.length,
        beneficiaries: beneficiaries.length,
        apikey: !!apikey
      });
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Use the passed API key or fallback to default
    const DEFAULT_ARIFPAY_KEYToUse = apikey || DEFAULT_ARIFPAY_KEY;
    
    // Debug logging
    console.log('Received API key:', apikey);
    console.log('API key length:', apikey ? apikey.length : 'undefined');
    console.log('Using API key:', DEFAULT_ARIFPAY_KEYToUse);

    const payload = {
      cancelUrl,
      phone,
      email: email || "default@coalition.com",
      nonce,
      errorUrl,
      notifyUrl,
      successUrl,
      paymentMethods,
      expireDate,
      items,
      beneficiaries,
      lang
    };

    const response = await axios.post(
      "https://gateway.arifpay.net/api/checkout/session",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "x-arifpay-key": DEFAULT_ARIFPAY_KEYToUse
        }
      }
    );

    return res.status(200).json({ response: response.data });

  } catch (error) {
    return res.status(500).json({
      error: error.response?.data || error.message
    });
  }
});




router.post("/donation", async (req, res) => {
  try {
    const {
      amount,
      email = "anonymous@donor.com",
      phone = "",
      return_url,
      successUrl,
      currency = "ETB",
      donorName = "Anonymous Donor",
      message = "",
      donationReference = "",
      targetId = "",
      apikey,
      bankAccountNumber,
      bank
    } = req.body;

    // Basic validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid donation amount." });
    }

    if (!donationReference) {
      return res.status(400).json({ error: "Donation reference is required." });
    }

    // Use the passed API key or fallback to default
    const DEFAULT_ARIFPAY_KEYToUse = apikey || DEFAULT_ARIFPAY_KEY;

    const nonce = donationReference; // Use donation reference as nonce for tracking

    const payload = {
      cancelUrl: `${return_url}?cancelled=true&ref=${donationReference}`,
      phone: phone || "251900000000", // Default Ethiopian number if not provided
      email,
      nonce,
      errorUrl: `${return_url}?error=true&ref=${donationReference}`,
      notifyUrl: `${BASE_URL}/api/donation/webhook/arifpay`,
      successUrl: successUrl || `${return_url}?success=true&sessionId=${nonce}&ref=${donationReference}`,
      paymentMethods: [
        "TELEBIRR", "AWASH", "AWASH_WALLET", "PSS", "CBE",
        "AMOLE", "BOA", "KACHA", "TELEBIRR_USSD", "HELLOCASH", "MPESSA"
      ],
      expireDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // expires in 30 mins
      items: [
        {
          image: `${BASE_URL}/assets/images/logos/logo-remove.jpg`,
          name: `Donation to EPLFFC Coalition - ${donorName}`,
          quantity: 1,
          price: amount,
          description: message || "Supporting EPLFFC Coalition Development"
        }
      ],
      beneficiaries: [
        {
          accountNumber: bankAccountNumber || "01320811436100",
          bank: bank || "AWINETAA",
          amount: amount,
        }
      ],
      lang: "EN"
    };

    console.log(`Processing ArifPay donation for reference: ${donationReference}, Amount: ${amount}, Donor: ${donorName}`);

    const response = await axios.post(
      "https://gateway.arifpay.net/api/checkout/session",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "x-arifpay-key": DEFAULT_ARIFPAY_KEYToUse
        }
      }
    );

    console.log(`ArifPay session created successfully for donation: ${donationReference}`);
    console.log(response.data);

    return res.status(200).json({ response: response.data, donationReference: donationReference });
   

  } catch (error) {
    console.error("Donation error:", error);
    return res.status(500).json({
      error: true,
      msg: error.response?.data?.message || error.message || "Payment processing failed"
    });
  }
});

router.get("/verify-payment/:tx_ref", async (req, res) => {
  try {
    const txRef = req.params.tx_ref;
    // Get API key from query parameter, fallback to default
    const apikey = req.query.apikey || DEFAULT_ARIFPAY_KEY;

    const response = await axios.get(
      `https://gateway.arifpay.net/api/ms/transaction/status/${txRef}`,
      {
        headers: {
          "x-arifpay-key": apikey,
        },
      }
    );

    return res.status(200).json({ response: response.data });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.response?.data || error.message });
  }
});

router.get("/test", (req, res) => {
  res.send("ArifPay integration working ✅");
});

router.post("/webhook/arifpay", (req, res) => {
  const paymentData = req.body;

  // ✅ Update your DB with paymentData
  console.log("Received ArifPay webhook:", paymentData);

  // You can verify signature here if ArifPay provides one

  res.sendStatus(200);
});

router.post("/webhook/donation", (req, res) => {
  const donationData = req.body;

  // ✅ Update your donation DB with donationData
  console.log("Received ArifPay donation webhook:", donationData);

  // You can verify signature here if ArifPay provides one
  // Process donation confirmation, update database, send thank you emails, etc.

  res.sendStatus(200);
});

module.exports = router;
