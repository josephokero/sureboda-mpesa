export default async function handler(req, res) {
  console.log("Callback received:", JSON.stringify(req.body, null, 2));
  res.status(200).json({ message: "Callback received" });
}
