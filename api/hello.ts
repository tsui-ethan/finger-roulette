export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).end(JSON.stringify({ message: "This is a Vercel serverless function!" }));
}
