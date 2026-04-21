const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const propertyRoutes = require("./routes/propertyRoutes");
const buyerRoutes = require("./routes/buyerRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const visitRoutes = require("./routes/visitRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const agentRoutes = require("./routes/agentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const agreementRoutes = require("./routes/agreementRoutes");
const documentRoutes = require("./routes/documentRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/properties", propertyRoutes);
app.use("/api/buyers", buyerRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/owners", ownerRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/agreements", agreementRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/reports", reportRoutes);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});